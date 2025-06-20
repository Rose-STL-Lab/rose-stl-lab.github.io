# Moving between Machines

The RoseLab environment provides a powerful utility for managing and migrating your containers across different servers. This tool allows you to copy your full environment between servers in less than 10 minutes, making it easy to balance workloads and access new resources.

## Accessing the Utility

1. On any RoseLab container, navigate to `/utilities/`
2. Run the command: `python common-utilities.py`. You might need to install Python 3.8+ and libraries like `requests` and `json`.

## Key Features

The utility offers several options:

1. Add or delete port mapping
2. Copy container
3. Start container
4. Stop container
5. Remove container
6. Create new container

## Container Migration Process

To migrate your container to another server:

1. Use option 2 to copy your environment to another server
2. Use option 3 to start your copied container on the new server

## Creating New Containers

Use option 6 to create a new container from preset images on any available server.

## Benefits of Using This Utility

- Access to multiple servers (roselab1~4) independently
- Quick replication of your environment on another server when your primary server is overloaded
- Easy synchronization of environments across multiple servers
- Set up external access to JupyterLab, TCP services, or web services without SSH forwarding
- Restart containers that were accidentally shut down
- Delete and recreate containers in case of environment corruption
- Backup containers before risky operations
- Immediate access to new RoseLab servers as they come online

## Migration Time

Migration speed depends on container size. With few concurrent migrations, the transfer speed exceeds 300MB/s. A 128 GB container takes approximately 6 minutes to copy.

## Differences Between Copied and Original Containers

Copied containers are nearly identical to the originals, with only these differences:
- The hostname changes from roselabX.ucsd.edu to roselabY.ucsd.edu
- Potential hardware variations (CPU, GPU)

Software configurations remain the same. For example, a website available at roselabX.ucsd.edu:55555 will also be accessible at roselabY.ucsd.edu:55555, provided your port mappings are applied across all servers.

## Port Mapping

The utility allows you to manage TCP and HTTPS port mappings:
- TCP mapping (e.g., roselabX.ucsd.edu:55555 → container:8888 for JupyterLab) makes your service available via http://roselabX.ucsd.edu:55555
- HTTPS mapping makes it available via https://roselabX.ucsd.edu:55555

HTTPS adds a security layer and is more browser-friendly but only supports hosted HTTP web services, not TCP services like FTP or SSH.

## Limitations

- Master students may have restricted cross-server copying permissions. Contact Rose for expanded access.
- You can have only one container per host. To create or copy a new container, you must first remove your old one.
- The script requires additional confirmation before container removal. Exercise extreme caution to prevent data loss.
- It's recommended to access this utility from your "main" container, as you can't delete an active container.

## Automation

You can create scripts for frequent or scheduled synchronization. The current inter-server bandwidth is 25Gbps, with plans to upgrade to 100Gbps. The 300MB/s data transfer rate is well within these limits.

## Security Measures

The utility implements strict security measures:
- It only accepts connections from the RoseLAN intranet.
- Users can only manage containers under their own name.
- You cannot modify other users' port mappings.
- The /utilities/ folder is only visible to the ubuntu user, not even to root.
- Non-ubuntu container users (unless with sudo or API key) cannot shut down or delete containers using this utility.

::: warning
If you accidentally share the API key from the client, notify the admin immediately so it can be updated.
:::

By utilizing this tool, you can efficiently manage your containers across the RoseLab servers, optimizing your workflow and making the most of the available resources.