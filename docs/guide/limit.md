# Limitations

Linux container works like you own a bare metal machine. However, there are occasions when you notice something does not work as intended. Here list some common cases. You are welcomed to contribute more to this section. 

## GPU Passthrough

<small>Contributed by Ray</small>

After running a python CUDA script, the processes cannot be seen in the output of `nvidia-smi`. 

```bash
ubuntu@account$ nvidia-smi
...                                                                         
+-----------------------------------------------------------------------------+
| Processes:                                                                  |
|  GPU   GI   CI        PID   Type   Process name                  GPU Memory |
|        ID   ID                                                   Usage      |
|=============================================================================|
+-----------------------------------------------------------------------------+
```

This is because we utilize the LXC passthrough to pass every GPU to multiple containers. Read this [article](https://theorangeone.net/posts/lxc-nvidia-gpu-passthrough/) for details. Your `/dev/nvidia*` are host devices, and `nvidia-smi` cannot show processes running on the host's kernel. The admin can view the running processes.

```bash
ubuntu@admin$ nvidia-smi
...
+-----------------------------------------------------------------------------+
| Processes:                                                                  |
|  GPU   GI   CI        PID   Type   Process name                  GPU Memory |
|        ID   ID                                                   Usage      |
|=============================================================================|
|    0   N/A  N/A   3835077      C   python3                          4898MiB |
|    0   N/A  N/A   3835078      C   python3                          4898MiB |
...
```

:::tip Trivia

NVIDIA limits their consumer GPUs to be passed to a maximum of three concurrent containers. However, our GPUs are professional GPUs that do not have such a limit.

:::

### Monitor GPU Process

To view the status of your GPU processes, you can visit the Grafana [GPU processes](http://roselab1.ucsd.edu/grafana/d/0eS-pV1Vk/gpu-usage-by-container?orgId=1) page. The page visualizes the information fetched from the host, and allows you to monitor your memory and computation usage without `nvidia-smi`. It also enables you to track your previous runs. For instance, by selecting **To=now-4h**, you can view the processes that were running four hours ago.

![example](/limit-1.png)

### Kill GPU Process

Even though you cannot see the running processes in `nvidia-smi`, you can still locate them in `ps aux`. For example, to kill all your python processes, run

```bash
kill $(ps aux | grep '[p]ython' | awk '{print $2}')
```

:::warning

The same process's PID on the container OS and on the host OS has no correlation due to [implementation complication](https://github.com/lxc/lxd/issues/3485), so you cannot kill a process by its PID shown on Grafana. Killing all `python` processes will also restart your Jupyter Lab. A better approach is to use `ps aux | grep '[p]ython' ` to identify the PID first.

```bash
ubuntu@account$ ps aux | grep '[p]ython'
ubuntu 1266303 ... python3 run.py ...
ubuntu@account$ kill -9 1266303
```

:::

## Nested Container

It is technically feasible to create a Docker container inside your container, but it is not allowed by default. Most Docker containers require intercepting and emulating system calls, which cannot be executed in default unprivileged containers. While the host can grant such permission, a privileged server is not always root-safe. In other words, if a privileged container is compromised, a hacker may escape from the container and breach the host OS.

> LXC upstream's position is that those containers aren't and cannot be root-safe. They are still valuable in an environment where you are running trusted workloads or where no untrusted task is running as root in the container. —— [Linux Containers - LXC - Security](https://linuxcontainers.org/lxc/security/)

Our position is Docker-based development should be deployed to the Nautilus cluster. However, you may request privilege on a short term basis with valid reason (e.g., to build a Docker image for your accepted paper).



## Firewall

Your container resides on the internal network managed by the host OS. When you host a web service, such as Jupyter Lab at `localhost:8888`, it is not directly accessible from the outside. The host OS listens the requests on a external port (for example, `roselab1.ucsd.edu:18888`) and forwards the requests to the container. 

As a result, when you run a service that listen only on localhost, you may be surprised to discover that the service is still accessible everywhere.

```bash
# ip=0.0.0.0 means the server will accept request from anywhere
# ip=localhost means that the server only accept requests from the server
$ jupyter notebook --ip=localhost 
Jupyter Notebook is running at: http://localhost:8888
# Able to see it at roselab1.ucsd.edu:18888
```

This is because the request made by an outsider, after being forwarded by the host, appears to be a request from the host. While LXC supports the [PROXY protocol](http://www.haproxy.org/download/1.9/doc/proxy-protocol.txt) to allow a service to view the source IP address, the Jupyter service does not respect this protocol. Similarily, most firewall services [cannot](https://access.redhat.com/discussions/3194752) inspect the source IP as well.

As a result, it is not recommended to establish your own firewall inside the container. If you want to control access to your service, for example, only allowing your work PC to access your Jupyter Lab, please contact the admin to add a firewall rule to the host OS.





