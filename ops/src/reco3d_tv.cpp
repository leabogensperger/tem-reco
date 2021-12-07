#include <torch/extension.h>
#include <vector>


// CUDA forward declarations
void cuda_primal_update_step(
    const torch::Tensor &u,
    const torch::Tensor &p,
    const torch::Tensor &ATq,
    const float tau , //const torch::Tensor &tau, //
    const float hz);

// CUDA forward declarations
void cuda_dual_update_step(
    const torch::Tensor &p,
    const torch::Tensor &u,
    const torch::Tensor &sigma,
    const float hz,
    const float lamda);

void cuda_prox_l2(
    const torch::Tensor &q,
    const torch::Tensor &sigma);

torch::Tensor cuda_nabla2d_cd_forward(
    const torch::Tensor &b);

// C++ interface
#define CHECK_CUDA(x) TORCH_CHECK(x.device().type() == torch::kCUDA, #x " must be a CUDA tensor")
#define CHECK_CONTIGUOUS(x) TORCH_CHECK(x.is_contiguous(), #x " must be contiguous")
#define CHECK_INPUT(x) CHECK_CUDA(x); CHECK_CONTIGUOUS(x)

void primal_update_step(
    const torch::Tensor &u,
    const torch::Tensor &p,
    const torch::Tensor &ATq,
    const float tau, //const torch::Tensor &tau, /
    const float hz)
{
  CHECK_INPUT(p);
  CHECK_INPUT(u);
  CHECK_INPUT(ATq);
  //CHECK_INPUT(tau);

  return cuda_primal_update_step(u, p, ATq, tau, hz);
}

void dual_update_step(
    const torch::Tensor &p,
    const torch::Tensor &u,
    const torch::Tensor &sigma,
    const float hz,
    const float lamda)
{
  CHECK_INPUT(p);
  CHECK_INPUT(u);

  return cuda_dual_update_step(p, u, sigma, hz, lamda);
}

void prox_l2(
    const torch::Tensor &q,
    const torch::Tensor &sigma)
{
  CHECK_INPUT(q);

  return cuda_prox_l2(q, sigma);
}

torch::Tensor nabla2d_cd_forward(
    const torch::Tensor &b)
{
  CHECK_INPUT(b);

  return cuda_nabla2d_cd_forward(b);
}


// python interface
PYBIND11_MODULE(TORCH_EXTENSION_NAME, m)
{
  m.def("primal_step", &primal_update_step, "Update step for primal variable u");
  m.def("dual_step", &dual_update_step, "Update step for dual variable p");
  m.def("prox_l2", &prox_l2, "Proximal operator for L2 function");
  m.def("nabla2d_cd_forward", &nabla2d_cd_forward, "2D central differences differences for projection data");
}
