#!/bin/bash

cd reco
python flara.py --base_dir ../data/ \
                --data_path 497-1A_res4_projection_data.npy \
                --mask_path 497-1A_res4_mask.npy \
                --angle_file  497-1A_angles.npy \
                --save_results True \
                --calc_flow True \
                --dyn_plot True \
                --max_iter 30 \
                --lamda 1e-1 \
                --z 100 \
                --crop 256 \
                --col_incr 0 \
                --tilt_axis_ang 0.0 \
                --cg_init True \
                --cg_iter 10 \