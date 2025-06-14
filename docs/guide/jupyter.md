# Jupyter Lab

:::tip Note
This guide is applicable only to those who requested Jupyter Lab. The examples use roselab1, but the same principles apply to roselab2~4.
:::

## Quick Start

### Setting Up Permanent Port Mapping

To set up a permanent HTTPS port mapping for JupyterLab using the common utilities:

1. Navigate to the common utilities directory:
   ```bash
   cd /utilities/
   ```

2. Run the client script:
   ```bash
   python common-utilities.py
   ```

3. Choose option 1: "Add or delete port mapping"

4. Select "Add a new port mapping"

5. When prompted, enter the following details:
   - Source port: Choose an available port within your assigned port range (e.g., 25308, if your range is 25300-25399)
   - Destination port: 8888 (JupyterLab's default port)
   - Protocol: HTTPS

6. Confirm your choices when prompted

After setting up the HTTPS mapping, you can access JupyterLab securely via `https://roselab1.ucsd.edu:25308` (replace 25308 with your chosen port number).

:::tip Note
HTTPS mapping adds a security layer and is more browser-friendly, but it only supports hosted HTTP web services.
:::

### SSH Port Forwarding

If you didn't request port mapping, you'll need to use SSH port forwarding to access your Jupyter service. After confirming successful SSH access to the server:

1. If you've configured your `.ssh/config` file:

   ```bash
   laptop$ ssh -fN -L 8888:localhost:8888 roselab1
   ```

2. If you haven't configured `.ssh/config`:

   ```bash
   laptop$ ssh -fN -L 8888:localhost:8888 ubuntu@roselab1.ucsd.edu -p <ssh-port> -i path/to/keyfile
   ```

These commands initiate a background connection forwarding your local port 8888 to the remote Jupyter service. Access your server at `http://localhost:8888`. You may need to rerun the command if the network environment changes.

### Using Visual Studio Code

If you're using Visual Studio Code with the Remote SSH extension:

1. Connect to your RoseLab server.
2. Go to the "Ports" view in the left or bottom sidebar.
3. Click on "Forward a Port" and enter 8888.
4. Access Jupyter Lab at `http://localhost:8888`.

## Troubleshooting Port Occupancy

If you encounter a "port already in use" error:

For macOS/Linux:
```bash
sudo lsof -i :8888
```

For Windows (PowerShell):
```powershell
Get-NetTCPConnection -LocalPort 8888
```

These commands will show processes using port 8888. You can then close the conflicting process or choose a different port.

## Configuration

Jupyter Lab runs as a service on `localhost:8888`, configured in `/etc/systemd/system/jupyterlab.service`. If killed, it will restart within seconds.

To change the default password, edit `~/.jupyter/jupyter_lab_config.py`:

```py
c.ServerApp.token = 'your-new-password'
```

Save the file and run `sudo systemctl restart jupyterlab` to apply changes.

:::warning
Use a strong password, especially for publicly accessible services. Jupyter Lab will remember your login.
:::

## Adding Environments

Jupyter Lab uses the Anaconda *base* environment. To add a new environment:

```bash
(base)$ conda create -n py38 python=3.8
(base)$ conda activate py38
(py38)$ conda install -c anaconda ipykernel
(py38)$ python -m ipykernel install --user --name=py38
```

To remove an environment's kernel configuration:

```bash
rm -rf /home/ubuntu/.local/share/jupyter/kernels/py38
```

## Debugging

If Jupyter Lab malfunctions, check the service log:

```bash
$ journalctl -u jupyterlab -n 100
```

Common issues include out-of-memory errors. Monitor your GPU and memory usage regularly at [Grafana](http://roselab1.ucsd.edu/).

:::tip Note
Replace roselab1 with your assigned server (roselab2, roselab3, or roselab4) in all examples.
:::