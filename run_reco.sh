#!/bin/bash

cd reco
python joint_align_reco.py --base_dir  \
                           --data_path \
                           --mask_path  \
                           --angle_file  \
                           --save_results True \
                           --save_path  \
                           --calc_flow True \
                           --dyn_plot True \
                           --max_iter 10 \
                           --lamda 1e-1 \
                           --z 300 \
                           --crop 512 \
                           --col_incr 300 \
                           --tilt_axis_ang 0.9 \
                           --cg_init True \
                           --cg_iter 10 \
                           
