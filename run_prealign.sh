#!/bin/bash

cd reco
python prealign.py --base_dir  \
                   --mrc_file  \
                   --angle_file  \
                   --factor  \
                   --save_data True \
                   --interp_order 3 \
                   
