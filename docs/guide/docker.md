# Running Docker in LXC Containers

This guide explains how to run Docker inside LXC containers using the fuse-overlayfs storage driver. This is necessary because LXC containers cannot use Docker's default overlay2 storage driver due to kernel limitations.

::: warning Prerequisites
- LXC container with FUSE support enabled
- Root or sudo access inside the container
- Basic understanding of Docker and systemctl
:::

## Background: Why fuse-overlayfs?

Docker's default `overlay2` storage driver requires kernel-level permissions that LXC containers don't have. When you try to use overlay2 inside an LXC container, Docker fails because:

1. LXC mounts its filesystem using overlay, and the kernel doesn't allow overlay-on-overlay mounting
2. The container lacks permissions to create kernel-level overlay filesystems

Without proper configuration, Docker falls back to the `vfs` driver, which creates full copies of each filesystem layer instead of using efficient copy-on-write. This can consume massive amounts of disk space.

## Prerequisites Check

### 1. Verify FUSE Support

First, check if your container has FUSE support:

```bash
ls -la /dev/fuse
```

If `/dev/fuse` doesn't exist, contact your system administrator to enable FUSE support for your container.

::: tip Enabling FUSE in Proxmox
If using Proxmox, set `features: fuse=1` in the LXC config or check "FUSE" under Options in the web interface. Restart the container after making this change.
:::

### 2. Install Required Packages

First, install Docker following the official installation guide:

::: tip Docker Installation
Follow the official [Docker Engine installation guide for Ubuntu](https://docs.docker.com/engine/install/ubuntu/) to install Docker from the official repository. This ensures you get the latest stable version with proper support.
:::

After installing Docker, install fuse-overlayfs:

```bash
sudo apt update
sudo apt install fuse-overlayfs
```

## Configuration Steps

### 1. Configure Docker Storage Driver

Create or edit the Docker daemon configuration:

```bash
sudo vim /etc/docker/daemon.json
```

Add the following configuration:

```json
{
    "storage-driver": "fuse-overlayfs"
}
```

::: warning NVIDIA Runtime
If you have NVIDIA container runtime installed, preserve it in the configuration:
```json
{
    "storage-driver": "fuse-overlayfs",
    "runtimes": {
        "nvidia": {
            "args": [],
            "path": "nvidia-container-runtime"
        }
    }
}
```
:::

### 2. Stop Existing Docker Service

Before applying changes, stop any running Docker service:

```bash
sudo systemctl stop docker
sudo systemctl stop docker.socket
```

### 3. Test Configuration

Test the Docker daemon with the new storage driver:

```bash
sudo dockerd --debug
```

Look for messages confirming fuse-overlayfs is being used. Press `Ctrl+C` to stop once verified.

::: tip Troubleshooting Startup
If you see an error about conflicting directives:
```
unable to configure the Docker daemon with file /etc/docker/daemon.json: 
the following directives are specified both as a flag and in the configuration file: 
storage-driver: (from flag: fuse-overlayfs, from file: overlay2)
```
This means there's a conflict in your configuration. Check `/etc/default/docker` or systemd service files for conflicting storage driver settings.
:::

### 4. Enable and Start Docker Service

Once configuration is verified:

```bash
sudo systemctl daemon-reload
sudo systemctl enable docker
sudo systemctl start docker
```

## Common Issues and Solutions

### AppArmor Permission Denied (Docker 29.0+)

::: danger Common Issue with Docker 29.0+
Docker 29.0 introduced security changes (CVE-2025-52881 fix) that may cause permission denied errors in LXC containers. If you encounter these errors, follow the solutions below.
:::

**Symptoms:**
```bash
# Docker service won't start
sudo systemctl status docker
# Shows: Failed to start Docker Application Container Engine

# Or containers fail with permission errors:
docker run hello-world
# Error: permission denied
```

**Solution 1: Add AppArmor Override When Running Containers (Recommended)**

Add `--security-opt apparmor=unconfined` to your Docker commands:

```bash
# Single container
docker run --rm --security-opt apparmor=unconfined hello-world

# With other options
docker run -d \
  --name myapp \
  --security-opt apparmor=unconfined \
  -p 3000:3000 \
  myimage:latest
```

**For Docker Compose**, add to your `docker-compose.yml`:
```yaml
version: '3.8'
services:
  web:
    image: myimage
    security_opt:
      - apparmor=unconfined
    ports:
      - "3000:3000"
```

**Solution 2: Set Global Docker Default**

To avoid adding `--security-opt` to every command, set it globally in Docker daemon config:

```bash
sudo vim /etc/docker/daemon.json
```

Add `default-security-opt`:
```json
{
  "storage-driver": "fuse-overlayfs",
  "default-security-opt": ["apparmor=unconfined"]
}
```

Restart Docker:
```bash
sudo systemctl restart docker

# Verify
docker info | grep -i apparmor
```

::: warning Security Note
Setting AppArmor to `unconfined` reduces container isolation. This is generally acceptable in LXC environments since the LXC container itself provides isolation. However, avoid running untrusted code without additional security measures.
:::

**If the above solutions don't work:**

Contact your system administrator (RoseLab users: ziz244@ucsd.edu) to verify that your LXC container is configured for nested container support.

### Permission Denied on Docker Socket

If you encounter:
```
permission denied while trying to connect to the Docker daemon socket at unix:///var/run/docker.sock
```

**Solution**: Run Docker commands with `sudo` or add your user to the docker group:
```bash
sudo usermod -aG docker $USER
# Log out and back in for changes to take effect
```

### Service Failed to Start

To debug Docker service issues:

```bash
# Check service status
sudo systemctl status docker

# View detailed logs
sudo journalctl -xeu docker.service

# Check Docker daemon directly
sudo dockerd --debug
```

Common causes:
- Syntax errors in `/etc/docker/daemon.json`
- Missing fuse-overlayfs package
- FUSE not enabled in container

### Storage Driver Conflicts

If Docker complains about conflicting storage drivers:

1. Check all configuration sources:
   ```bash
   cat /etc/docker/daemon.json
   cat /etc/default/docker
   systemctl cat docker.service
   ```

2. Remove any `--storage-driver` flags from systemd service files
3. Ensure only one storage driver is specified in `daemon.json`

## Performance Considerations

::: warning Performance Impact
fuse-overlayfs operates in userspace and has performance overhead compared to kernel-based overlay2. However, it's significantly more efficient than the vfs fallback:
- **vfs**: Creates full copies of filesystem layers (can use 3-4x more space)
- **fuse-overlayfs**: Uses copy-on-write like overlay2 but with ~10-20% performance overhead
- **overlay2**: Native kernel driver (not available in LXC)
:::

## Verification

Verify Docker is using the correct storage driver:

```bash
sudo docker info | grep "Storage Driver"
# Should output: Storage Driver: fuse-overlayfs
```

Test with a simple container:

```bash
sudo docker run hello-world
```

## Advanced Configuration

### Systemd Service Debugging

For persistent issues, create a systemd override:

```bash
sudo mkdir -p /etc/systemd/system/docker.service.d
sudo vim /etc/systemd/system/docker.service.d/override.conf
```

Add debugging options:
```ini
[Service]
ExecStart=
ExecStart=/usr/bin/dockerd --debug
```

### Alternative: Recent Kernel Support

::: tip Kernel 6.1.10+ Users
Recent kernels (6.1.10+) may support overlay2 in LXC containers natively, especially on ZFS. Test with:
```bash
sudo dockerd --storage-driver=overlay2
```
If this works, you may not need fuse-overlayfs.
:::

## Related Documentation

- [Container Limitations](./limit.md#nested-container) - General limitations of nested containers
- [Troubleshooting Guide](./troubleshooting.md#docker-in-container) - Additional Docker troubleshooting steps
- [Security Considerations](./security.md) - Security implications of running Docker in LXC

## Summary

Running Docker inside LXC containers requires using fuse-overlayfs as a storage driver due to kernel limitations. While this adds some performance overhead, it's a reliable solution that avoids the disk space issues of the vfs driver. Always ensure FUSE support is enabled in your container and carefully manage the Docker daemon configuration to avoid conflicts.