# Getting Started with CSE Shared Servers

## Overview

After the containerization migration, the CSE shared servers are now under the management of the RoseLab. The CSE shared servers (north, south, east, and west) also provide a containerized environment for research and development. Each user has their own isolated container with dedicated resources and sudo access.

## Hardware

north: Supermicro SYS-4029GP-TRT: 2x Intel(R) Xeon(R) Gold 6230 CPU,  384 GB RAM, 6 TB data SSD + 4 TB home SSD, 8x Nvidia Geforce RTX 2080Ti GPU
south: Supermicro SYS-4029GP-TRT: 2x Intel(R) Xeon(R) Gold 6230 CPU,  384 GB RAM, 6 TB data SSD + 4 TB home SSD, 8x Nvidia Geforce RTX 2080Ti GPU
east:  Supermicro SYS-4029GP-TRT: 2x Intel(R) Xeon(R) Gold 6246R CPU, 384 GB RAM, 6 TB data SSD + 4 TB home SSD, 8x Nvidia Geforce RTX 2080Ti GPU
west:  Supermicro SYS-4029GP-TRT: 2x Intel(R) Xeon(R) Gold 6246R CPU, 384 GB RAM, 6 TB data SSD + 4 TB home SSD, 8x Nvidia Geforce RTX 2080Ti GPU

## Key Differences from RoseLab

1. **Fixed Server Assignment**: Unlike RoseLab, you cannot move between machines. Your container is fixed to the assigned server. Your data directory is `/data/<username>` instead of `/data` (due to the backward compatibility with the previous setup). Your data directory is not synced between servers.

2. **No Common Utilities**: The shared servers do not have access to the common utilities available in RoseLab for managing containers or port mappings.

3. **Limited Software**: The shared servers come with a basic setup. Additional software installations are the responsibility of the user.

4. **Shared Conda**: A shared Conda installation is mounted by default to reduce storage usage. However, you are free to install your own Conda environment. You can disable the default shared Conda activation by removing the corresponding line from your `.bashrc` file.

5. **No Hosted Services**: The shared servers do not host any services (e.g., MiniO, WandB). Users are responsible for setting up their own services.

## Accessing Your Container

### SSH Access

To access your container via SSH, following the same steps as in RoseLab:

```bash
ssh ubuntu@[server].ucsd.edu -p [your-ssh-port] -i path/to/your/private-key
```

The credential email is similar to the RoseLab email, with the private key attached but without any credentials (since there is no service account). You are expected to set up your own password by running `sudo passwd ubuntu` after logging in.

## Resource Allocation

Each user container is allocated:
- 10 CPU cores
- 128 GB RAM
- 128 GB root drive
- Unlimited data drive (mounted at `/data/<username>`)

Check your allocated resources using similar commands as in RoseLab.

## File System

- Your home directory is located at `/home/ubuntu`
- Your data drive is mounted at `/data/<username>`
- Shared public data is accessible at `/data/public`

## Best Practices

1. **Data Storage**: Store large datasets and project files in your `/data/<username>` directory to preserve space on the root drive.

2. **File Sharing**: Use the `/data/public` folder for sharing files with other users.

3. **Port Usage**: Be mindful of the port mappings when setting up services. Use the provided host ports for external access.

4. **Resource Management**: Monitor your resource usage to ensure you stay within the allocated limits.

::: tip
If the data drive is full, you (or your PI) would need to purchase your own additional storage, since Roselab admins cannot delete users' files on their behalf. Roselab admins can only provide guidance on mounting your storage and mapping it to your container. Contact the RoseLab admins for more information.
:::

## Support

Roselab admins provide only limited support for the shared servers. Remember to keep your access credentials secure and do not share them with others. 
