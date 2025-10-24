---
layout: doc
---

# Config

**Last Updated**: October 24, 2025

## Software Info

| Name                             | Version   | Installation Method                                          | Location                                                     | Uninstall Method                                             |
| -------------------------------- | --------- | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| Nvidia driver (root + container) |  580.95.05   | [Run file](https://us.download.nvidia.com/XFree86/Linux-x86_64/580.95.05/NVIDIA-Linux-x86_64-580.95.05.run), with Vulkan support, DKMS for root, no-kernel for container | Devices mount rule: `/etc/udev/rules.d/70-nvidia.rules`, <br />Module loaded on boot: `/etc/modules-load.d/modules.conf` | (not recommended)<br /> `driver.run --uninstall`             |
| CUDA                             | 11.8.0    | [Run file](https://developer.download.nvidia.com/compute/cuda/11.8.0/local_installers/cuda_11.8.0_520.61.05_linux.run) | `/usr/local/cuda/` → `/usr/local/cuda-11.8`                  | (not recommended)<br />`/usr/local/cuda/bin/cuda-uninstaller` |
| CUDNN                            | 8.6.0.163 | Local Debian Package (Require Nvidia account)                | DyLib: `/usr/lib/x86_64-linux-gnu/libcudnn*`<br />Header: `/usr/include/cudnn*` | `dpkg -r`                                                    |
| TensorRT                         | 8.5.3.1   | Uncompress TAR (Require Nvidia account)                      | Dylib: `/usr/lib/x86_64-linux-gnu/libfakeroot/libnvinfer*`<br />Header: `/usr/include/cuda/NvInfer*` | Manual deletion                                              |
| Tensorflow                       | 2.17.0    | PIP | `/home/ubuntu/miniconda3/lib/python3.10/site-packages/tensorflow/` | `pip uninstall`                                              |
| Miniconda3                       | 24.7.1    | [Shell Script](https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh) | `/home/ubuntu/miniconda3`                                    | `rm -rf` the folder                                          |
| PyTorch                          | 2.4.0+cu121    | Miniconda                                                    | `/home/ubuntu/miniconda3/lib/python3.10/site-packages/torch` | `conda remove`                                               |
| JupyterLab                       | 4.2.5     | Miniconda                                                    | `/home/ubuntu/miniconda3/lib/python3.10/site-packages/jupyter.py` | `conda remove`                                               |
| XRDP                             | 0.9.17    | APT                                                          | Dylib: `/usr/lib/x86_64-linux-gnu/xrdp*`, <br />Header: `/usr/include/xrdp*` | `apt autoremove`                                             |
| LXD (root)                       | 5.0.3     | SNAP                                                         | `/snap/lxd`                                                  | `snap remove --purge`                                        |
| ZFS (root)                       | 2.1.5     | APT                                                          | ` /usr/sbin/zfs` `/etc/zfs` `/usr/share/zfs`                 | `apt autoremove`                                             |



