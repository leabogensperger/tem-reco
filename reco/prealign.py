from skimage.registration import optical_flow_tvl1
from skimage.transform import warp as warp_sk
import numpy as np
import mrc
import argparse
import sys, os
sys.path.append("../utils/")
from tools import SliceViewer
from skimage.registration import phase_cross_correlation
from skimage.transform import resize
from scipy import ndimage
import matplotlib.pyplot as plt
from utils import str2bool
    
def parse_arguments(args): 
    parser = argparse.ArgumentParser('')
    
    parser.add_argument('--base_dir', type=str, default='', help="Base directory of projection data.")
    parser.add_argument('--mrc_file', type=str, default='', help="Mrc file name containing projection data.")
    parser.add_argument('--align_cycles', type=int, default=2, help="Number of alignment cycles.")
    parser.add_argument('--factor', type=int, default=2, help="Factor to downsample projection data.")
    parser.add_argument('--save_data', type=str2bool, default=True, help="Boolean to indicate whether prealigned data should be saved.")
    parser.add_argument('--interp_order', type=int, default=3, help="Interpolation order for spline interpolation.")
    parser.add_argument('--use_filter', type=str2bool, default=False, help="Boolean indicating whether fourier filter should be used for CC.")
    parser.add_argument('--save_name', type=str, default='', help="String to indicate prealignment in saved data.")
    
    return parser.parse_args() 

def round_up_to_even(arg):
    """ round input to even """
    return (np.ceil(arg) // 2 * 2).astype(np.int)

def is_even(arg):
    """ check if input integer is even """
    return arg % 2 == 0

def fourier_filter(arg):
    """ apply fourier filter on projection data of shape (nproj,nx,ny) """
    arg = np.fft.fft2(arg, axes=(1,2))
    for i in np.arange(arg.shape[0]):
        arg[i] = (np.fft.ifft2(ndimage.fourier_uniform(arg[i], 2)))
    return np.abs(arg)

def reshape(arg, factor, interp_order):
    """ resize projection data in image plane by factor """
    return resize(arg,(arg.shape[0],arg.shape[1]//factor,arg.shape[2]//factor), interp_order)

def pad(arg, new_len_round, interp_order):
    """ stretch projection data by cosine of the resp. angle and pad all \
        images to the largest image, return padded and cropped data """
    data_pad = np.zeros((arg.shape[0],arg.shape[1], np.max(new_len_round)))

    for i in range(data_pad.shape[0]):
        data_reshaped = resize(arg[i],(arg.shape[1],new_len_round[i]), interp_order)
        diff = (data_pad.shape[-1] - data_reshaped.shape[-1])//2
        data_pad[i] = np.pad(data_reshaped,((0,0),(diff,diff)),mode='constant')
        
    ns, nr, nc = data_pad.shape
    return data_pad, data_pad[:,:,nc//2-nr//2:nc//2+nr//2]

def align_cc(data_pad, data_cc, angles):
    """ align projection images by CC starting from the 0° angle image \
        in both directions separately. Always align successive images."""
    proj_data_aligned = np.zeros_like(data_pad)
    row_coords_lim, col_coords_lim = np.meshgrid(np.arange(data_cc.shape[1]),np.arange(data_cc.shape[2]),indexing='ij')
    
    ns_full, nr_full, nc_full = data_pad.shape
    row_coords, col_coords = np.meshgrid(np.arange(nr_full),np.arange(nc_full),indexing='ij')
    proj_data_aligned[0] = data_pad[0]
    
    # align to ref
    zero_position = np.argmin(np.abs(angles))
    i1 = data_cc[zero_position] 
    
    proj_data_aligned = np.zeros_like(data_pad)
    proj_data_aligned[zero_position] = data_pad[zero_position]
    
    # align first part of tilt series [-alpha,0] starting from central slice
    for i in range(zero_position - 1,-1,-1):
        i2 = data_cc[i]
        shift = phase_cross_correlation(i1,i2)[0]
        
        proj_data_aligned[i] = warp_sk(data_pad[i], np.array([row_coords-shift[0],col_coords-shift[1]]),order=3, mode='constant')
        
        # update reference image 
        i1 = warp_sk(i2,np.array([row_coords_lim-shift[0],col_coords_lim - shift[1]]),order=3,mode='constant')
    
    # align second part of tilt series [0,alpha] starting from central slice
    i1 = data_cc[zero_position]
    for i in range(zero_position + 1,data_cc.shape[0]):
        i2 = data_cc[i]
        shift = phase_cross_correlation(i1,i2)[0]
        
        proj_data_aligned[i] = warp_sk(data_pad[i], np.array([row_coords-shift[0],col_coords-shift[1]]),order=3, mode='edge')
        
        # update reference image 
        i1 = warp_sk(i2,np.array([row_coords_lim-shift[0],col_coords_lim - shift[1]]),order=3,mode='constant')
        
    return proj_data_aligned

def restretch(proj_data_aligned, shape, new_len_round, interp_order):
    """ restretch and crop aligned projection data """
    data_aligned = np.zeros(shape).astype(np.float32)
    ncfull = int(proj_data_aligned.shape[-1]//2)
    
    for i in range(proj_data_aligned.shape[0]):
        data_cropped = proj_data_aligned[i,:,ncfull-int(new_len_round[i]//2):ncfull+int(new_len_round[i]//2)]
        
        mask = np.where(data_cropped < 1e-6, np.zeros_like(data_cropped), np.ones_like(data_cropped))
        mask = resize(mask,(shape[1],shape[2]))
        mask[mask < (1. - 1e-3)] = 0.
        
        data_aligned[i] = resize(data_cropped,(shape[1],shape[2]), interp_order)*mask
        
    return data_aligned
    
        
def prealign(base_dir, mrc_file, align_cycles, factor, save_data, \
             interp_order, use_filter, save_name):
    '''
    main function to prealign projection data
    
    Parameters
    ----------
    base_dir : base directory of projection data and projection angles.
    mrc_file : name of mrc file containing projection data.
    align_cycles : number of align cycles of cross correlations.
    factor: factor by which projection data will be resized.
    save_data : boolean indicating whether to save prealigned data.
    interp_order: order for spline interpolation for image resizing operations.
    use_filter: boolean indicating whether fourier filter should be used for CC.
    save_name: name for prealigned projection data to be saved as in base directory.
    
    Returns
    -------
    None.

    '''    
    # get projection datah
    data = mrc.imread(base_dir + mrc_file).astype(np.float64())
    # data = np.load(base_dir + mrc_file)

    # get angles 
    angles = np.flip(np.load(base_dir + angle_file)*np.pi/180)
    # data = data[:,1024-512:1024+512,1024-512:1024+512]
    
    # reshape projection data
    data = reshape(data, factor, interp_order)
    
    # restretch projection data by cosine of angles
    new_len = data.shape[1]/np.cos(angles)
    new_len_round = round_up_to_even(new_len)
    
    # create mask
    mask = np.ones_like(data)
    
    for _ in np.arange(align_cycles):
        # pad projection data
        data_pad, data_cc = pad(data, new_len_round, interp_order)
    
        if use_filter:
            data_cc = fourier_filter(data_cc)
        # alignment 
        proj_data_aligned = align_cc(data_pad, data_cc, angles)
    
        # restretch and crop images
        data = restretch(proj_data_aligned, data.shape, new_len_round, interp_order)

        mask = np.where(data <= 1e-6, np.zeros_like(data), mask)

    # save data
    if save_data:
        save_str = base_dir + 'data' + save_name + '.npy' 
        mask_str = base_dir + 'mask' + save_name + '.npy' 

        np.save(save_str, data)
        np.save(mask_str, mask)

if __name__ == "__main__":
    args = parse_arguments(sys.argv)

    prealign(args.base_dir, args.mrc_file, args.align_cycles, args.factor, args.save_data, 
             args.interp_order, args.use_filter, args.save_name)
