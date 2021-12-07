#!/bin/bash

cd reco
python prealign.py --base_dir /home/lea/Projects/midas/Tiltseries Tomography/data/497-9C_NOD_Ctrl/trial01/ \
                   --mrc_file 497_9C_trial01_3500x.mrc \
                   --factor 4 \
                   --save_data True \
                   --interp_order 3 \
                   --save_name prealign_test
                   
