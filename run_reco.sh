#!/bin/bash

cd reco
python joint_align_reco.py --base_dir /home/lea/Projects/midas/Tiltseries Tomography/data/497-9C_NOD_Ctrl/trial01/ \
                           --data_path data_resize2.npy \
                           --mask_path mask_resize2.npy \
                           --angle_path angles01.npy \
                           --save_results True \
                           --save_path \
                           --calc_flow True \
                           --dyn_plot True \
                           --max_iter 100 \
                           --lamda 1e-1 \
                           --z 300 \
                           --crop 512 \
                           --col_incr 300 \
                           --tilt_axis_ang 0.9 \
                           --cg_init True \
                           --cg_iter 10 \
                           
