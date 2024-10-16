# Troubleshooting

This sections provide solutions to some common problems. You are welcome to contribute more Q&A's to the section.

## SSH Local Forwarding

The SSH forwarding command is successful if it directly returns without any output.

```bash
$ ssh -fN -L 3389:localhost:3389 ubuntu@roselab1.ucsd.edu -p port -i /path/to/keyfile
$ # No output
```

If it hangs, it means that you cannot log in to your SSH shell. Double-check that you have entered the correct hostname, port, and key path.

```bash
$ ssh -fN -L 3389:localhost:3389 ubuntu@roselab1.ucsd.edu -p wrong-port -i /path/to/keyfile
# Hanging
```

If it returns with the following message, there is already a service running on the local port. You can identify the service by using `lsof`.

```bash
$ ssh -fN -L 3389:localhost:3389 ubuntu@roselab1.ucsd.edu -p port -i /path/to/keyfile
bind [127.0.0.1]:3389: Address already in use
channel_setup_fwd_listener_tcpip: cannot listen to port: 3389
Could not request local forwarding.
$ lsof -i :3389
COMMAND     PID      USER   FD   TYPE             DEVICE 
OtherApp    815      user   20u  IPv4 0xb8238ac165eb1fd3
$ kill -9 815  # Kill the process
```

If you don't want to kill the process, you can forward another local port to the remote port.

```bash
$ ssh -fN -L 3389:localhost:3340 ubuntu@roselab1.ucsd.edu -p port -i /path/to/keyfile
$ # You can then connect to RDP at rdp://localhost:3340
```

## Docker in Container

You may see the following error when trying to pull a Docker image in your container:

```bash
Pulling netflow  ... extracting (100.0%)
ERROR: failed to register layer: Error ...
```

This is because the Docker's latest overlay2 storage driver does not work well with LXC. However, the legacy `overlay` driver has been removed from Docker 2.4.0. You can downgrade Docker to 2.3.0 to use the `overlay` driver. 

#### Solution

First, remove your existing Docker installation.

```bash
sudo systemctl stop docker
sudo apt-get remove docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

Then, install Docker 2.3.0.

```bash
sudo apt-get update
sudo apt-get install docker-ce=5:23.0.0-1~ubuntu.22.04~jammy docker-ce-cli=5:23.0.0-1~ubuntu.22.04~jammy containerd.io docker-buildx-plugin docker-compose-plugin
```

Start the Docker service and verify the installation.

```bash
sudo systemctl start docker
docker --version
```

Pin the package version to prevent automatic upgrades:

```bash
sudo apt-mark hold docker-ce docker-ce-cli
```

Now you can pull Docker images in your container.

## Machine Learning Threshold

We recommend the our users to regularly inspect their [resource usage](http://roselab1.ucsd.edu) during GPU tasks to optimize their tasks.

### CPU Threshold

When you are assigned more cores than you need, you may see the following patterns:

* High CPU usage
* The system (kernel) is busier than the user
* Low GPU utility, which fluctuates over time

This is because of a [well-known problem](https://discuss.pytorch.org/t/cpu-usage-far-too-high-and-training-inefficient/57228/3) of PyTorch:  it tries to use as many CPU cores as possible. All cores have almost nothing to do, but the overhead of communication (in kernel mode) becomes very high. GPU utility is heavily reduced because it needs to wait for the CPU.

#### Solution

You may manually limit the number of cores to use by using `torch.set_num_threads`. If you don't want to modify your scripts every time, you can contact the admin to limit the number of cores available to you. The image below shows the improved performance after limiting the number of cores from 56 to 12.

![example](/troubleshoot-1.png)

![example](/troubleshoot-2.png)

![example](/troubleshoot-3.png)

### Disk Threshold

When running machine learning tasks, large datasets are often loaded from disk. But you should generally expect your disk I/O usage to be relatively low, because most data is prefetched into memory. If you notice that both CPU and GPU utilizations are low, it likely means that both CPU and GPU are waiting for data to be loaded from disk.

#### Solution

PyTorch has a build-in data prefetching mechanism. While the GPU is training a batch, `torch.utils.data.DataLoader` will load the data for next batch. By default, there is a total of 2 * `num_workers` batches prefetched across all workers. The `num_workers` is by default 0. If you face slow disk reading speed, consider increasing the number of workers.



