import torch
import numpy as np
import argparse
import astra
import torch.nn.functional as F

class OpElectronTomography:
    """ Projection operator for electron tomography """
    def __init__(self, proj_geom, vol_geom, device, use_proj_mask=True):
        self.proj_geom = proj_geom
        self.vol_geom = vol_geom
        self.device = device
        
        self.z = vol_geom['GridRowCount']
        self.m = vol_geom['GridSliceCount']
        self.n = vol_geom['GridColCount']
        
        self.use_proj_mask = use_proj_mask
        self.proj_mask = self.projection_mask(np.ones((self.z, self.m, self.n)))
        self.tol = 10. # tolerance value for creating projection mask
        
    def projection_mask(self, ones):
        proj_id, proj_mask = astra.create_sino3d_gpu(ones.transpose(1,0,2), self.proj_geom, self.vol_geom)
        astra.data3d.delete(proj_id)
        centre_val = proj_mask[self.m//2,:,self.m//2]
        return np.logical_and((centre_val[None,:,None]-10. <= proj_mask), (proj_mask <= centre_val[None,:,None] + 10.)).transpose(1,0,2).astype(np.float32)
    
    def get_projection_mask(self):
        return self.proj_mask
    
    def forward(self, vol):
        vol = vol.cpu().numpy()
        proj_id, proj_data = astra.create_sino3d_gpu(vol.transpose(1,0,2), self.proj_geom, self.vol_geom)
        astra.data3d.delete(proj_id)
        if self.use_proj_mask:
            proj_data *= self.proj_mask.transpose(1,0,2)
        del vol
        torch.cuda.empty_cache()
        return torch.tensor(proj_data.transpose(1,0,2)).to(self.device)#.unsqueeze(1)
        
    def backward(self, proj):
        proj = proj.cpu().numpy() 
        # Backproject projection data
        bproj_id, bproj_data = astra.create_backprojection3d_gpu(proj.transpose(1,0,2), self.proj_geom, self.vol_geom)
        bproj_data = bproj_data.transpose(1,0,2)
        astra.data3d.delete(bproj_id)
        del proj
        torch.cuda.empty_cache()
        return torch.tensor(bproj_data, dtype=torch.float32).to(self.device).contiguous()

def str2bool(arg):
    """ define str2bool type for input arguments """
    if isinstance(arg, bool):
       return arg
    if arg.lower() in ('true', '1'):
        return True
    elif arg.lower() in ('false', '0'):
        return False
    else:
        raise argparse.ArgumentTypeError('Boolean value expected.')
    
def CG(proj_data, op, size_xk, max_iter, device):
    '''
    conjugate gradient algorithm to solve for reconstruction given projection data and a projectin operator
    
    Parameters
    ----------
    proj_data : torch Tensor
    op : class object
    size_xk : reconstruction dims
    max_iter : int
    device : use CPU or GPU
    
    Returns
    -------
    xk : torch Tensor

    '''    
    xk = torch.zeros((*size_xk), device=device)

    b = op.backward(proj_data)   
    rk = b - op.backward(op.forward(xk))
    pk = rk
    
    for i in range(max_iter):
        print('CG iter ', i)
        op_bwd_fwd = op.backward(op.forward(pk))
        alpha = ((rk.reshape(-1).T)@rk.reshape(-1))/((pk.reshape(-1).T)@((op_bwd_fwd).reshape(-1)))
        
        torch.cuda.empty_cache()
        
        xnext = xk + alpha*pk
        rnext = rk - alpha*(op_bwd_fwd)        
        beta = ((rnext.reshape(-1).T)@(rnext.reshape(-1)))/((rk.reshape(-1).T)@rk.reshape(-1))
        pnext = rnext + beta*pk
        
        # update
        rk = rnext
        pk = pnext
        xk = xnext
        torch.cuda.empty_cache()
    
    del pk, rk, alpha, beta, xnext, pnext, rnext, b
    torch.cuda.empty_cache()
    return xk

def coordinate_transform(angles, phi, det_p1, det_p2):
    """ coordinate_transform to match astra geometry for projection operator """
    
    # settings at 0 degree - homogeneous coordinates
    r = np.array([[0.], [-1], [0.], [1.]]) # ray direction
    d = np.array([[0.], [0.], [0.], [1.]]) # detector centre
    u = np.array([[1.], [0.], [0.], [1.]])*det_p1 # first principal direction on detector grid
    v = np.array([[0.], [0.], [1.], [1.]])*det_p2 # second principal direction on detector grid

    # first correct tilt angles axis 
    Rz = np.array([[np.cos(phi), -np.sin(phi), 0., 0.], [np.sin(phi), np.cos(phi), 0., 0.], [0., 0., 1., 0.], [0., 0., 0., 1.]])
    
    phi_y = 0.*np.pi/180
    Ry = np.array([[np.cos(phi_y), 0., np.sin(phi_y), 0.], [0., 1., 0., 0.], [-np.sin(phi_y), 0., np.cos(phi_y), 0.], [0., 0., 0., 1.]])
    
    phi_x = 0.*np.pi/180
    Rx = np.array([[1, 0, 0, 0.], [0, np.cos(phi_x), -np.sin(phi_x), 0], [0, np.sin(phi_x), np.cos(phi_x), 0.], [0., 0., 0., 1.]])
    
    r = Rx @ Ry @ Rz @ r
    u = Rx @ Ry @ Rz @ u
    v = Rx @ Ry @ Rz @ v

    # output vector array
    nproj = len(angles)
    vectors = np.zeros((nproj, 12))
    
    # rotation matrix for tilt angle alpha
    for i, alpha_rot in enumerate(angles):
        # corresponds to a tilt around axis z
        Rz = np.array([[np.cos(alpha_rot), -np.sin(alpha_rot), 0., 0.], [np.sin(alpha_rot), np.cos(alpha_rot), 0., 0.], [0., 0., 1., 0.], [0., 0., 0., 1.]])
    
        r_ = Rz @ r
        u_ = Rz @ u
        v_ = Rz @ v
    
        vectors[i, :3] = (r_[:-1,0]/r_[-1]).T
        vectors[i, -6:-3] = (u_[:-1,0]/u_[-1]).T
        vectors[i, -3::] = (v_[:-1,0]/v_[-1]).T
    
    return vectors
