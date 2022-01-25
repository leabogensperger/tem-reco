import sys, os
import torch
import torch.nn.functional as F
import astra
import argparse
import matplotlib.pyplot as plt
import matplotlib
import matplotlib.gridspec as gridspec
import numpy as np
import datetime

# cuda kernels and file imports
from reco3d_tv_cuda_ext import reco3d_tv
from utils import coordinate_transform, CG, str2bool, OpElectronTomography

def warp(im, f_):
    """ function to warp each projection image in im by given shift f_ per projection angle """ 
    z, m, n = im.shape
    yy, xx = torch.meshgrid(torch.arange(n), torch.arange(m))
    yy = yy[None, None]
    xx = xx[None, None] 
    xx_normed = (2 * (xx + f_[:, 0].cpu().view(-1, 1, 1, 1)) / (n - 1.)) - 1.
    yy_normed = (2 * (yy + f_[:, 1].cpu().view(-1, 1, 1, 1)) / (m - 1.)) - 1.
    sample_coords = torch.stack((xx_normed[:,0], yy_normed[:, 0]), dim=-1)
    
    xx_m = xx.view(1, 1, m, n) + f_[:, 0].cpu().view(-1, 1, 1, 1)
    yy_m = yy.view(1, 1, m, n) + f_[:, 1].cpu().view(-1, 1, 1, 1)
    xx_m = torch.where(((xx_m < 0.) | (xx_m > n)), torch.zeros_like(xx_m), torch.ones_like(xx_m))
    yy_m = torch.where(((yy_m < 0.) | (yy_m > m)), torch.zeros_like(yy_m), torch.ones_like(yy_m))
    return F.grid_sample(im[:,None], sample_coords, padding_mode='zeros', align_corners=True).to(device)[:,0], \
        torch.logical_and(xx_m, yy_m)[:,0]

def parse_arguments(args): 
    parser = argparse.ArgumentParser('')
    
    parser.add_argument('--gpu', type=int, default=0, help="The id of the GPU to be used.") 
    parser.add_argument('--base_dir', type=str, default='', help='Base directory for projection data, correspdoning mask, and tilt angles.')
    parser.add_argument('--data_path', type=str, default='', help='Prealigned projection data file.') 
    parser.add_argument('--mask_path', type=str, default='', help='Mask for prealigned projection data.')
    parser.add_argument('--angle_file', type=str, default='', help='Tilt angles.') 
    
    parser.add_argument('--save_results', type=str2bool, default=True, help='Set to True if results should be saved.')
    
    parser.add_argument('--calc_flow', type=str2bool, default=True, help='Boolean to calculate flow in addition to reconstruction.') 
    parser.add_argument('--dyn_plot', type=str2bool, default=False, help='Boolean for dynamic plotting while iterating.')
    
    parser.add_argument('--max_iter', type=int, default=50, help='Number of primal-dual iterations.')
    parser.add_argument('--lamda', type=float, default=1e-1, help='Regularization parameter between data term and regularizer.') 
    parser.add_argument('--z', type=int, default=300, help='Integer specifying number of slices for reconstruction.') 
    parser.add_argument('--crop', type=int, default=512, help='Pixels to crop of proj data on either side starting from centre.') 
    parser.add_argument('--col_incr', type=int, default=300, help='Integer to increase number of cols.') 

    parser.add_argument('--tilt_axis_ang', type=float, default=-0.9, help='Tilt axis angle from mrc header.') 
    parser.add_argument('--use_proj_mask', type=str2bool, default=True, help='Use projection mask to mask out border at higher tilt angles.')
        
    parser.add_argument('--cg_init', type=str2bool, default=True, help='Boolean to use CG for u_init.')
    parser.add_argument('--cg_iter', type=int, default=10, help='CG iterations for u_init.')
    
    parser.add_argument('--use_anisotropic_voxels', type=str2bool, default=True, help='Anistropic voxels in z direction.')
    parser.add_argument('--hz', type=float, default=1., help='Size of voxel in z direction wrt to size 1 for x and y.')
    
    return parser.parse_args()

if __name__ == '__main__':
    args = parse_arguments(sys.argv)
    device = torch.device("cuda:{}" .format(args.gpu))
    
    base_dir = args.base_dir
    data_path = base_dir + args.data_path
    mask_path = base_dir + args.mask_path
    angle_path = base_dir + args.angle_file 

    save_path = '../exp/exp_' + str(datetime.datetime.today()).replace(' ', '_') #args.base_dir + 
    if args.save_results:
        os.makedirs(save_path)
        
        # param settings
        file = open(save_path+'/settings.txt', 'w')
        file.write(str(args))
        file.close()
        
    calc_flow = args.calc_flow
    dyn_plot = args.dyn_plot
    max_iter = args.max_iter

    # read in TEM data
    proj_data = np.load(data_path)
    mask_prealign = np.load(mask_path)
    
    # preprocess projection data
    proj_data = (proj_data - proj_data.mean((1,2))[:,None,None])
    proj_data *= mask_prealign
    angles = np.load(angle_path)*np.pi/180. 

    # crop data
    crop = args.crop
    centre = proj_data.shape[2]//2
    proj_data = proj_data[:,centre-crop:centre+crop,centre-crop:centre+crop] 
    mask_prealign = mask_prealign[:,centre-crop:centre+crop,centre-crop:centre+crop]
    proj_data = torch.tensor(proj_data, dtype=torch.float32) 

    lamda = args.lamda
    z = args.z
    tmax, m, n = proj_data.shape
    n = m + args.col_incr
    c = int(n//2)   
    
    vectors = coordinate_transform(angles, args.tilt_axis_ang*np.pi/180, det_p1=1., det_p2=1.)
    
    # astra projection and volume geometry
    proj_geom = astra.create_proj_geom('parallel3d_vec', m, m, vectors)
    if args.use_anisotropic_voxels: # vol geom (Y x X x Z)
        vol_geom = astra.create_vol_geom(z,n,m,-n//2,n//2,-(z*args.hz)//2,(z*args.hz)//2,-m//2,m//2)
    else:
        vol_geom = astra.create_vol_geom(z,n,m)
        
    # forward operator, TV operator, Nabla b for Db 
    op = OpElectronTomography(proj_geom, vol_geom, device, args.use_proj_mask)
    
    if args.use_proj_mask:
        op_mask = op.get_projection_mask()
    else:
        mask = torch.ones_like(proj_data).bool().to(device)

    if not calc_flow:
        b = proj_data.clone()
        mask = mask_prealign#.clone()
        
    # step size params
    tau_array = 1/(op.backward(torch.ones((tmax,m,m)) + (4 + 2/args.hz))) #+6
    tau_array[torch.isinf(tau_array)] = 1e-5
    tau = tau_array[z//2, m//2, n//2].item()
    del tau_array
    torch.cuda.empty_cache()
    
    sigma1 = torch.Tensor([0.5, 0.5, 1/(2/args.hz)]).to(device)
    
    sigma2_array = 1/op.forward(torch.ones((z, m, n)))
    sigma2 = sigma2_array[:,m//2,m//2]
    del sigma2_array
    torch.cuda.empty_cache()

    # init primal and dual vars
    print('\nInitial Guess with CG:')
    u = CG(proj_data*op_mask, op, [z,m,n], args.cg_iter, device) if args.cg_init else op.backward(proj_data.to(device).contiguous())
    u_old = u.clone()
    p = torch.zeros((z, m, n, 3), device=device)
    q = torch.zeros((tmax, m, m), device=device)
    
    # init shift vector
    f = torch.zeros((tmax, 2), device=device)
    
    if dyn_plot:
        fig, ax = plt.subplots(2, 3)
    
    print('\nStart Joint Alignment and Reconstruction FLARA:')
    for i in range(max_iter):
        print('Iteration: ', i) if i % 1 == 0 else 0
        if calc_flow:
            # warping
            if not args.use_proj_mask:
                b, mask_warping = warp(proj_data, f)
                mask &= mask_warping.to(device)
                if i == max_iter-1:
                    b_save = b.clone()
            else:
                b, mask_warping = warp(proj_data, f) # op_mask
                if i == max_iter-1:
                    b_save = b.clone()
                mask = (mask_warping & torch.tensor(mask_prealign, dtype=torch.bool) & torch.tensor(op_mask, dtype=torch.bool)).to(device)
                b.mul_(mask)
            
            del mask_warping
            torch.cuda.empty_cache()          

        # primal descent in p
        u_old.copy_(u) # remember old
        ATq_tmp = op.backward(q*mask)
        reco3d_tv.primal_step(u, p, ATq_tmp, tau, args.hz)
        del ATq_tmp
        torch.cuda.empty_cache()

        # overrelaxation in place
        (u.mul_(2)).sub_(u_old) # u = 2*u - u_old
        
        # dual ascent in p: p = prox(p + sigma1 * Nabla(u))
        reco3d_tv.dual_step(p, u, sigma1, args.hz, lamda)
       
        # dual ascent in q: q = prox(q + sigma2 * mask * (Au - b))
        Au_tmp = op.forward(u)
        q += Au_tmp.sub_(b).mul_(sigma2[:,None,None]).mul_(mask)
        reco3d_tv.prox_l2(q, sigma2)
        del Au_tmp
        torch.cuda.empty_cache()
        
        
        if dyn_plot and i % 1 == 0:
            for a in ax.reshape(-1):
                a.clear()
            plt.suptitle('FLARA Iteration %d' %i)
            ax[0,0].imshow(u[z//2,:,c-m//2:c+m//2].cpu(), cmap='gray'), ax[0,0].set_title('Central Slice'), ax[0,0].axis('off')
            ax[0,1].imshow(u[:,m//2,c-m//2:c+m//2].cpu(), cmap='gray'), ax[0,1].set_title('Horizontal Slice'), ax[0,1].axis('off')
            ax[0,2].imshow(u[:,:,n//2].cpu().T, cmap='gray'), ax[0,2].set_title('Vertical Slice'), ax[0,2].axis('off')
        
            ax[1,0].plot(f[:,0].cpu()), ax[1,0].set_title(r'Shift $f_0$')
            ax[1,1].plot(f[:,1].cpu()), ax[1,1].set_title(r'Shift $f_1$')
            ax[1,2].axis('off')
            
            fig.canvas.draw()
            plt.pause(0.1)
        
        if calc_flow: # calculate f
            Db = reco3d_tv.nabla2d_cd_forward(b).cpu()
            torch.cuda.empty_cache()
            
            lhs = torch.sum(Db*mask.cpu().unsqueeze(3)*(op.forward(u).cpu().unsqueeze(3) - b.cpu().unsqueeze(3) + torch.sum(Db*f.cpu().view(tmax, 1, 1, 2), 3, keepdims=True)), (1, 2))
            rhs = torch.sum(Db.unsqueeze(4)*(mask.cpu().unsqueeze(3)*Db).unsqueeze(3), (1, 2))
            
            torch.cuda.empty_cache()
            
            det = rhs[:, 0, 0]*rhs[:, 1, 1] - rhs[:, 0, 1]*rhs[:, 1, 0]
            f[:, 0] = (rhs[:, 1, 1]*lhs[:, 0]-rhs[:, 0, 1]*lhs[:, 1])/det
            f[:, 1] = (-rhs[:, 1, 0]*lhs[:, 0]+rhs[:, 0, 0]*lhs[:, 1])/det
            
            f = f.to(device)
        torch.cuda.empty_cache()

    if args.save_results: # save np arrays     
        np.save(save_path+'/reconstruction.npy', u.cpu().numpy())
        np.save(save_path+'/flow.npy', f.cpu().numpy())
        if dyn_plot:
            plt.savefig(save_path+'/reco_shift.png', bbox_inches='tight', dpi=250)
    plt.show()