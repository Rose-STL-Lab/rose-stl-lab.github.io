# Getting Started with CSE Shared Servers

## Overview

After the containerization migration, the CSE shared servers are now under the management of the RoseLab. The CSE shared servers (north, south, east, and west) also provide a containerized environment for research and development. Each user has their own isolated container with dedicated resources and sudo access.

## Hardware

1. north: Supermicro SYS-4029GP-TRT: 2x Intel(R) Xeon(R) Gold 6230 CPU,  384 GB RAM, 6 TB data SSD + 4 TB home SSD, 8x Nvidia Geforce RTX 2080Ti GPU
2. south: Supermicro SYS-4029GP-TRT: 2x Intel(R) Xeon(R) Gold 6230 CPU,  384 GB RAM, 6 TB data SSD + 4 TB home SSD, 8x Nvidia Geforce RTX 2080Ti GPU
3. east:  Supermicro SYS-4029GP-TRT: 2x Intel(R) Xeon(R) Gold 6246R CPU, 384 GB RAM, 6 TB data SSD + 4 TB home SSD, 8x Nvidia Geforce RTX 2080Ti GPU
4. west:  Supermicro SYS-4029GP-TRT: 2x Intel(R) Xeon(R) Gold 6246R CPU, 384 GB RAM, 6 TB data SSD + 4 TB home SSD, 8x Nvidia Geforce RTX 2080Ti GPU

## Key Differences from RoseLab

1. **Fixed Server Assignment**: Unlike RoseLab, you cannot move between machines. Your container is fixed to the assigned server. Your data directory is `/data/<username>` instead of `/data` (due to the backward compatibility with the previous setup). Your data directory is not synced between servers.

2. **No Common Utilities**: The shared servers do not have access to the common utilities available in RoseLab at `/utilities/` for managing containers or port mappings.

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

## Understanding Shared Resources: Storage and Sustainability

### How the Shared Servers Work

The CSE shared servers operate on a **collaborative infrastructure model**:

- **Compute resources** (CPUs, GPUs, RAM) are shared among all users
- **Base storage** (4TB home, 6TB shared data) was established through initial lab contributions
- **Additional storage** is provided by individual labs purchasing their own drives
- **Administration** is provided on a volunteer basis

**Key principle**: Disks don't come from nowhere. When your lab needs storage, your lab provides storage.

### Storage You Can Count On

When you or your PI purchases storage for your lab:
- **Dedicated access**: Only your lab members can use the space you bought
- **Better performance**: Your own SSD means no I/O contention with other users
- **Guaranteed availability**: The storage you purchase is yours, not subject to shared resource pressure
- **Admin support**: We'll mount and configure it for your lab's exclusive use

When you don't purchase storage:
- **Limited quota**: Shared pool provides 128GB per user (subject to availability)
- **Performance degradation**: Shared disks can reach 100% I/O utilization during peak usage
- **No guarantees**: Shared storage may become full, blocking your work

### What You Need

**Compatible hardware**: 2.5" NVMe SSD with **U.2 or U.3 connector** (strongly preferred over SATA for performance)

**Recommended options**:

**Consumer grade** (best price/performance for most users):
- Samsung 870 QVO/EVO 4TB: ~$250-300
- Samsung 870 QVO/EVO 8TB: ~$500-600
- Budget option: Refurbished consumer SSDs on eBay

**Enterprise grade** (higher endurance and performance):
- Samsung PM983/PM9A3 series (U.2): 4TB ~$300-400, 8TB ~$600-800
- Micron 7450/9400 series (U.2/U.3): 4TB ~$350-450, 8TB ~$700-900
- Intel D7 series (U.2/U.3): Similar pricing to Micron
- Budget option: Refurbished enterprise drives on eBay (~30-50% discount)

**Capacity guide**:
- Single user with typical datasets: 4TB minimum
- Multiple lab members or large datasets: 8TB recommended
- Heavy I/O workloads: Consider enterprise NVMe for better endurance

### Acknowledging Contributors

We're grateful to the labs that have invested in the shared infrastructure:

- **Rose Lab** - for significant infrastructure investments and ongoing administrative support
- **Berg-Kirkpatrick Lab** - for storage contributions

These contributions have made high-quality GPU computing accessible to dozens of researchers across CSE.

### Why This Matters

The shared servers serve 45+ users across multiple labs. As usage grows, so does the demand for storage and I/O bandwidth.

**This creates a choice**:
- **Contribute when you benefit**: Labs that use the servers can purchase storage proportional to their needs
- **Everyone benefits**: Your investment gives your lab guaranteed resources while reducing pressure on shared storage

Without ongoing contributions, the system faces resource exhaustion - leading to full disks, degraded performance, and blocked research for everyone.

### Getting Storage for Your Lab

If you need more storage than the base allocation:

1. **Discuss with your PI**: Explain your storage needs and the benefits of dedicated drives
2. **Purchase compatible SSD**: Any 2.5" SATA/NVMe drive works (see recommendations above)
3. **Contact RoseLab admins**: We'll mount the drive and configure it for your lab's exclusive access

::: info Email Template for Your PI
Subject: Storage Purchase Request for CSE Shared GPU Servers

Dear Prof. [PI Name],

I'm using the CSE shared GPU servers for [project name] and have encountered storage limitations. The server admin suggests our lab purchase dedicated storage.

**Details**:
- Required: 2.5" NVMe SSD with U.2 or U.3 connector
- Recommended capacity: 4-8TB
- Consumer option: Samsung 870 QVO/EVO 4TB (~$250-300) or 8TB (~$500-600)
- Enterprise option: Samsung PM9A3 or Micron 7450 series (~$300-900 depending on capacity)

**Benefits**:
- Exclusive use by our lab only
- Better I/O performance than shared storage
- Admin handles mounting and configuration

Could we discuss this? The storage bottleneck is currently affecting [specific task].

Best regards,
[Your Name]
:::

## Support

Roselab admins provide only limited support for the shared servers. Remember to keep your access credentials secure and do not share them with others. 
