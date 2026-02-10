# Running Docker in LXC Containers

This guide explains how to run Docker inside LXC containers using the fuse-overlayfs storage driver. This is necessary because LXC containers cannot use Docker's default overlay2 storage driver due to kernel limitations.

::: warning Prerequisites
- LXC container with FUSE support enabled and nested containers allowed
- Root or sudo access inside the container
- Basic understanding of Docker and systemctl
:::

## Background: Why fuse-overlayfs?

Docker's default `overlay2` storage driver requires kernel-level permissions that LXC containers don't have. When you try to use overlay2 inside an LXC container, Docker fails because:

1. LXC mounts its filesystem using overlay, and the kernel doesn't allow overlay-on-overlay mounting
2. The container lacks permissions to create kernel-level overlay filesystems

Without proper configuration, Docker falls back to the `vfs` driver, which creates full copies of each filesystem layer instead of using efficient copy-on-write. This can consume massive amounts of disk space.

## Understanding Docker 29.0's Storage Driver Detection

::: tip Key Insight - Docker's "Prior Driver" Mechanism
Docker 29.0 introduced stricter storage driver validation. However, there's an important exception: if Docker detects that a storage driver was **previously used** (by checking existing data directories), it will skip the strict validation and continue using that driver. This is called the "prior storage driver" path.

**This means**: We DON'T explicitly configure the storage driver in `daemon.json`. Instead, we create the necessary directory structure that makes Docker think fuse-overlayfs was already in use.
:::

**Why this matters:**
- **Explicit configuration** (`"storage-driver": "fuse-overlayfs"` in daemon.json) → triggers strict validation → fails in LXC
- **Prior driver detection** (directories exist) → skips strict validation → works perfectly

You'll see this log when it works: `[graphdriver] using prior storage driver: fuse-overlayfs`

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

## Initial Setup: Creating the "Prior Driver" Structure

::: danger Critical Step - Do NOT Skip
This step is **essential** for Docker 29.0+ in LXC containers. We create directory structure that makes Docker think fuse-overlayfs was previously used, allowing it to bypass strict validation.
:::

### For New Docker Installations

If you're setting up Docker for the first time, follow these steps **before** starting Docker for the first time:

```bash
# Stop Docker if it's running
sudo systemctl stop docker docker.socket 2>/dev/null || true

# Create the fuse-overlayfs driver directory structure
sudo mkdir -p /var/lib/docker/fuse-overlayfs/l

# Create image metadata directories
sudo mkdir -p /var/lib/docker/image/fuse-overlayfs/imagedb/content/sha256
sudo mkdir -p /var/lib/docker/image/fuse-overlayfs/imagedb/metadata/sha256
sudo mkdir -p /var/lib/docker/image/fuse-overlayfs/layerdb/sha256
sudo mkdir -p /var/lib/docker/image/fuse-overlayfs/layerdb/mounts
sudo mkdir -p /var/lib/docker/image/fuse-overlayfs/distribution

# Create empty repositories.json
echo '{"Repositories":{}}' | sudo tee /var/lib/docker/image/fuse-overlayfs/repositories.json > /dev/null

# Set correct permissions
sudo chmod 710 /var/lib/docker/fuse-overlayfs
sudo chmod 700 /var/lib/docker/fuse-overlayfs/l
sudo chmod -R 700 /var/lib/docker/image/fuse-overlayfs/imagedb
sudo chmod -R 755 /var/lib/docker/image/fuse-overlayfs/layerdb
```

::: tip What This Does
This creates the minimum directory structure that Docker's storage driver detection looks for. When Docker starts, it will:
1. Scan `/var/lib/docker/` for existing driver directories
2. Find `fuse-overlayfs/l/` (non-empty due to subdirectory)
3. Log: `[graphdriver] using prior storage driver: fuse-overlayfs`
4. Skip strict validation and use fuse-overlayfs successfully
:::

### For Existing Docker Installations

If you already have Docker installed with a different storage driver and want to switch to fuse-overlayfs:

::: warning Data Loss Warning
Switching storage drivers will make your existing images and containers inaccessible. Back up any important data before proceeding.
:::

```bash
# Stop Docker
sudo systemctl stop docker docker.socket

# Backup existing data (optional but recommended)
sudo mv /var/lib/docker /var/lib/docker.backup

# Create the fuse-overlayfs structure (use the commands from above)
sudo mkdir -p /var/lib/docker/fuse-overlayfs/l
# ... (repeat all mkdir and echo commands from above)

# Start Docker
sudo systemctl start docker
```

## Configuration: Keep daemon.json Minimal

::: tip Important - Storage Driver Configuration
**Do NOT add `storage-driver` to daemon.json**. Let Docker auto-detect from the directory structure we created above.
:::

For most users, `daemon.json` should be **empty** or contain only minimal settings:

```bash
# Option 1: No daemon.json at all (recommended for new installs)
# Don't create /etc/docker/daemon.json

# Option 2: Empty daemon.json
echo '{}' | sudo tee /etc/docker/daemon.json
```

::: warning NVIDIA Runtime Users Only
If you need NVIDIA container runtime, this is the ONLY thing that should be in daemon.json:
```json
{
  "runtimes": {
    "nvidia": {
      "args": [],
      "path": "nvidia-container-runtime"
    }
  }
}
```
**Do NOT add** `storage-driver` alongside this.
:::

## Starting Docker

Now start Docker and verify it's using fuse-overlayfs:

```bash
# Enable and start Docker
sudo systemctl daemon-reload
sudo systemctl enable docker
sudo systemctl start docker

# Verify the storage driver
sudo docker info | grep "Storage Driver"
# Should output: Storage Driver: fuse-overlayfs

# Check the logs for confirmation
sudo journalctl -u docker -n 50 | grep "storage driver"
# Should see: [graphdriver] using prior storage driver: fuse-overlayfs
```

## Common Issues and Solutions

### AppArmor Permission Denied (Docker 28.0+)

::: danger Common Issue with Docker 28.0+
Docker 28.0+ introduced security changes that cause permission denied errors when checking AppArmor profiles in LXC containers. The error occurs because Docker tries to read `/sys/kernel/security/apparmor/profiles`, which is not accessible from within LXC.
:::

**Symptoms:**
```bash
# Containers fail with permission errors:
docker run hello-world
# Error response from daemon: Could not check if docker-default AppArmor profile was loaded:
# open /sys/kernel/security/apparmor/profiles: permission denied
```

**Solution: Tell Docker It's Running in a Container (Recommended)**

Create a systemd override that sets `container=lxc` environment variable. This tells Docker to skip AppArmor profile checks entirely:

```bash
sudo mkdir -p /etc/systemd/system/docker.service.d
cat <<EOF | sudo tee /etc/systemd/system/docker.service.d/lxc-apparmor-fix.conf
[Service]
Environment=container=lxc
EOF
sudo systemctl daemon-reload
sudo systemctl restart docker
```

After this, containers work without any extra flags:
```bash
docker run --rm hello-world  # Just works!
```

::: tip Why This Works
When Docker detects `container=lxc` in its environment, it knows it's running inside a container and skips the AppArmor integration entirely. This is the cleanest solution because:
- One-time setup, no per-container configuration needed
- Works with all `docker run` and `docker-compose` commands
- No need to modify existing docker-compose.yml files
:::

**Alternative: Per-Container AppArmor Override**

If you prefer not to modify systemd, you can add `--security-opt apparmor=unconfined` to each container:

```bash
docker run --rm --security-opt apparmor=unconfined hello-world
```

For Docker Compose, add to each service:
```yaml
services:
  web:
    image: myimage
    security_opt:
      - apparmor=unconfined
```

::: warning
This alternative requires adding the option to every container, which is tedious and easy to forget. The systemd override approach above is strongly recommended.
:::

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

### Docker Won't Start After Configuration Changes

**Symptom**: Docker fails to start after editing `daemon.json`

**Common causes:**

1. **You added forbidden settings to daemon.json**
   ```bash
   # Check your configuration
   cat /etc/docker/daemon.json

   # Remove these if present:
   # - "storage-driver": "fuse-overlayfs"      ← Triggers strict validation
   # - "default-security-opt": [...]           ← Causes validation failures in LXC

   # The correct configuration should be empty or only contain:
   # - NVIDIA runtime (if needed)
   # - Registry mirrors, log settings, etc.

   # Simplest fix: make it empty
   echo '{}' | sudo tee /etc/docker/daemon.json
   ```

2. **Syntax error in daemon.json**
   ```bash
   # Validate JSON syntax
   python3 -m json.tool /etc/docker/daemon.json
   # Should output formatted JSON if valid
   ```

3. **Prior driver structure is missing**
   ```bash
   # Verify the directories exist
   ls -la /var/lib/docker/fuse-overlayfs/l/
   ls -la /var/lib/docker/image/fuse-overlayfs/

   # If missing, recreate them (see Initial Setup section)
   ```

### Multiple Storage Drivers Detected

**Error**: `contains several valid graphdrivers: overlay2, fuse-overlayfs`

**Cause**: Multiple non-empty driver directories exist in `/var/lib/docker/`

**Solution**:
```bash
# List all driver directories
ls -la /var/lib/docker/ | grep -E 'overlay|fuse'

# Keep only fuse-overlayfs, remove or rename others
sudo mv /var/lib/docker/overlay2 /var/lib/docker/overlay2.old

# Restart Docker
sudo systemctl restart docker
```

## Performance Considerations

::: warning Performance Impact
fuse-overlayfs operates in userspace and has performance overhead compared to kernel-based overlay2. However, it's significantly more efficient than the vfs fallback:
- **vfs**: Creates full copies of filesystem layers (can use 3-4x more space)
- **fuse-overlayfs**: Uses copy-on-write like overlay2 but with ~10-20% performance overhead
- **overlay2**: Native kernel driver (not available in LXC)
:::

## Verification

### Check Storage Driver

Verify Docker is using fuse-overlayfs via the "prior driver" mechanism:

```bash
# Check storage driver
sudo docker info | grep "Storage Driver"
# Should output: Storage Driver: fuse-overlayfs

# Verify it's using prior driver detection (not explicit config)
sudo journalctl -u docker --no-pager | grep "storage driver"
# Should see: [graphdriver] using prior storage driver: fuse-overlayfs
```

### Test Container Execution

Test with a simple container:

```bash
sudo docker run --rm hello-world
```

If you get an AppArmor permission denied error, apply the systemd fix described in the [AppArmor section](#apparmor-permission-denied-docker-28-0).

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

### About Rootless Docker

::: tip Rootless Docker: Possible but Not Recommended
**Rootless Docker can work in LXC containers**, but it requires the exact same "prior driver" directory structure setup as rootful Docker.

**Why not use rootless?**
- Originally, rootless Docker was expected to default to fuse-overlayfs automatically
- In reality, it **does not default** to fuse-overlayfs in LXC
- You still need to create the magic directory structure manually
- Since you need manual configuration anyway, rootful Docker is simpler and more straightforward

**Recommendation**: Use rootful Docker with the configuration described in this guide. The LXC container already provides process isolation, so running Docker as root inside the container is acceptable and avoids unnecessary complexity.
:::

### Alternative Storage Drivers

::: warning Not Recommended
While Docker supports other storage drivers (vfs, devicemapper), they are not recommended:
- **vfs**: Extremely inefficient (3-4x disk space usage)
- **devicemapper**: Requires complex setup and has performance issues

Stick with fuse-overlayfs for LXC containers.
:::

## Related Documentation

- [Container Limitations](./limit.md#nested-container) - General limitations of nested containers
- [Troubleshooting Guide](./troubleshooting.md#docker-in-container) - Additional Docker troubleshooting steps
- [Security Considerations](./security.md) - Security implications of running Docker in LXC

## Summary

### Key Takeaways

Running Docker 29.0+ inside LXC containers requires a specific approach:

1. **Storage Driver Setup**:
   - Create directory structure that makes Docker auto-detect fuse-overlayfs
   - Never explicitly configure `storage-driver` in `daemon.json`
   - Look for log: `[graphdriver] using prior storage driver: fuse-overlayfs`

2. **AppArmor Configuration** (if you get permission denied errors):
   - Create systemd override with `Environment=container=lxc`
   - This tells Docker to skip AppArmor checks entirely
   - One-time setup, no per-container flags needed

3. **What NOT to Do**:
   - Don't explicitly set `storage-driver` in daemon.json (triggers strict validation → fails)
   - Don't use vfs or devicemapper (inefficient alternatives)
   - Rootless Docker works but needs same setup (no advantage, use rootful instead)

4. **LXC Container Requirements** (configured by admin):
   - `security.nesting=true` (for nested containers)
   - `/dev/fuse` device access (for fuse-overlayfs)

### Quick Setup Checklist

```bash
# 1. Install prerequisites
sudo apt install docker.io fuse-overlayfs

# 2. Create "prior driver" structure
sudo mkdir -p /var/lib/docker/fuse-overlayfs/l
sudo mkdir -p /var/lib/docker/image/fuse-overlayfs/{imagedb,layerdb}/{content,metadata,sha256,mounts,distribution}/sha256
echo '{"Repositories":{}}' | sudo tee /var/lib/docker/image/fuse-overlayfs/repositories.json

# 3. Fix AppArmor (skip if docker run hello-world already works)
sudo mkdir -p /etc/systemd/system/docker.service.d
cat <<EOF | sudo tee /etc/systemd/system/docker.service.d/lxc-apparmor-fix.conf
[Service]
Environment=container=lxc
EOF

# 4. Start Docker
sudo systemctl daemon-reload
sudo systemctl start docker

# 5. Verify
sudo docker info | grep "Storage Driver"  # Should show: fuse-overlayfs
sudo docker run --rm hello-world  # Should work without any extra flags
```

While fuse-overlayfs has ~10-20% performance overhead compared to native overlay2, it's the only reliable solution for Docker in LXC containers and is vastly superior to the vfs fallback.