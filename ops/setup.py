from setuptools import setup
from torch.utils.cpp_extension import BuildExtension, CUDAExtension, library_paths

library_dirs = [v +"/" for v in library_paths()]

setup(
    name='reco3d_tv',
    ext_package='reco3d_tv_cuda_ext',
    ext_modules=[
        CUDAExtension('reco3d_tv',
            sources=['src/reco3d_tv.cpp', 'src/reco3d_tv_kernel.cu'],
            runtime_library_dirs = library_dirs,
            extra_compile_args={'cxx': [], 'nvcc': ['-O3']}),
    ],
    cmdclass={
        'build_ext': BuildExtension
    })
