# Jupyter Lab

:::tip Note
This guide is applicable only to who requested Jupyter Lab.
:::

## Quick Start

If you did not request port mapping, you will need to use an SSH reverse proxy to access your Jupyter service. After confirming that you can successfully SSH into the server, run the following command:

```bash
laptop$ ssh -fN -L 8888:localhost:8888 ubuntu@roselab1.ucsd.edu -p ssh-port -i path/to/keyfile
```

This command initiates a background connection that forwards all your connections to `localhost:8888` to your remote Jupyter service. You can then access your server at `http://localhost:8888`. Please note that you may need to rerun the command if the network environment changes.

If your requested port mapping, you can access your Jupyter service directly at `http://roselab1.ucsd.edu:<jupyter-port>`. SSH forwarding provides an extra layer of security, as you can see. 

## Configuration

Jupyter Lab is set up as a service running at `localhost:8888` and is configured in `/etc/systemd/system/jupyterlab.service`. If you accidentally kill the service, it will restart in a few seconds.

By default, Jupyter Lab comes with a strong fixed password. To change the password, edit the file `~/.jupyter/jupyter_lab_config.py` and look for the line:

```py
c.ServerApp.token = 'your-current-token'
```

Change the token to your desired password and save the file. Then, run `sudo systemctl restart jupyterlab` to apply the changes.

:::warning

If you choose to change the password, please use a strong password, especially if your service is publicly accessible. You won't need to repeatedly enter the password since Jupyter Lab will remember your login.
:::

## Adding Environment

Jupyter Lab is installed in the Anaconda *base* environment. The recommended way to add a new environment is through Anaconda. Here's an example of adding a Python 3.8 environment:

```bash
# Starting with the base environment
# Change "py38" to your env name and "3.8" to your Python version
(base)$ conda create -n py38 python=3.8  # Create a new "py38" environment
(base)$ conda activate py38  # Activate the new environment
(py38)$ conda install -c anaconda ipykernel  # Install ipykernel support
(py38)$ python -m ipykernel install --user --name=py38  # Add new kernel config
```

You should now be able to see the new kernel in Jupyter Lab. If you remove an environment, run the following command to remove the kernel configuration:

```bash
# Change py38 to your env name
rm -rf /home/ubuntu/.local/share/jupyter/kernels/py38  
```



## Debugging

If Jupyter Lab shuts down unexpectedly or doesn't accept your connection, run the following command to see the service log:

```bash
$ journalctl -u jupyterlab -n 100  # Show last 100 lines of the log
...
Feb 15 23:44:33 user systemd[1]: jupyterlab.service: A process of this unit has been killed by the OOM killer.
Feb 15 23:44:33 user jupyter: [ServerApp] received signal 15, stopping
Feb 15 23:44:33 user jupyter: [ServerApp] Shutting down 3 extensions
Feb 15 23:44:33 user jupyter: [ServerApp] Shutting down 2 terminals
Feb 15 23:44:35 user systemd[1]: jupyterlab.service: Failed with result 'oom-kill'.
```

A common reason for an unexpected shutdown is out-of-memory. Please often track your GPU and memory usage at [Grafana](http://roselab1.ucsd.edu/).
