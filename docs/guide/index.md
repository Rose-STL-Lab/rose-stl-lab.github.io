# Getting Started with RoseLab Servers

## Overview
The RoseLab servers, owned and managed by the UCSD CSE [Rose Lab](https://roseyu.com), provide a robust platform for machine learning research. These servers offer:

- Development and execution of models within [Linux Containers](https://linuxcontainers.org/)
- Real-time machine metrics tracking via [Grafana](http://roselab1.ucsd.edu/grafana/)
- Data sharing and backup through [Seafile](http://roselab1.ucsd.edu/seafile)
- S3 dataset hosting with [MinIO](https://rosedata.ucsd.edu)
- Online markdown collaboration using [Hedgedoc](https://roselab1.ucsd.edu/hedgedoc)
- Self-hosted experiment tracking via [WandB](https://rosewandb.ucsd.edu) (contact admin for invitation email)
- Lab-shared ChatGPT service frontend [BetterGPT](https://roselab1.ucsd.edu/chat) (contact admin for backend API access)

Additional web applications are planned to support future research needs.

### Hardware

Located in Rack C05 of the CSE server room 1215, the RoseLab servers include:

1. roselab1: Gigabyte G292-Z40: 2x AMD EPYC 7453 CPU, 512 GB RAM, 4 TB home SSD, 2 x NVIDIA A100 80GB PCIe GPUs, 2 x NVIDIA A100 40GB PCIe GPUs
2. roselab2: Asus ESC8000A: 2x AMD EPYC 7282 CPU, 512 GB RAM, 4 TB home SSD, 8x NVIDIA GeForce RTX 4090 GPUs
3. roselab3: Asus ESC8000A: 2x AMD EPYC 7282 CPU, 512 GB RAM, 4 TB home SSD, 8x NVIDIA GeForce RTX 4090 GPUs
4. roselab4: Gigabyte G482-Z54: 2x AMD EPYC 7313 CPU, 1 TB RAM, 8 TB home SSD, 8 x NVIDIA L40S GPUs
5. rosedata: Supermicro 12-bay Storage server (6x 20TB hard drives)

Regarding the hardware difference, referring to the Lambda Labs [GPU benchmark](https://lambdalabs.com/gpu-benchmarks).

::: tip Note
The RoseLab servers are in early development. User feedback is appreciated. More hardware additions are planned. For information on the rationale behind the servers, see the [Why RoseLab](./why) section.
:::

## Quick Start

### 1. Apply for Access

Submit your request using the [Account Request Form](https://docs.google.com/forms/d/e/1FAIpQLSdKIzsrn1DulFZEW8esUrMVuYtKyMMxax1foBDrDM7OqMb58A/viewform?usp=pp_url). 

- Don't worry about preset image, port mappings, or resource quota; these can be adjusted later by contacting the admin.
- Don't worry about your initial machine assignment; you can create containers on other machines once you have access, as described in the [Moving between Machines](./cluster) guide.
- You'll have root permission to install or remove software (except the NVIDIA driver and kernel modules).

::: warning
The host and container NVIDIA driver versions must match. (You cannot change host driver versions, which are in the [config table](../config/)) If you see `Failed to initialize NVML: Driver/library version mismatch`, contact the admin.
:::

### 2. Access Your Container

Upon approval, you'll receive an email with two tables:

1. Port mappings table:

   `<id>` is a 3-digit number.

   | Container Port →               | Host Port |
   | ------------------------------ | --------- |
   | 22 (SSH)                       | `<id>`00  |
   | 3389 (RDP)                     | `<id>`01  |
   | 5900 (VNC)                     | `<id>`02  |
   | 80 (HTTP)                      | `<id>`03  |
   | 443 (HTTPS)                    | `<id>`04  |
   | 8080 (Web server, e.g. Tomcat) | `<id>`05  |
   | 8888 (Jupyter)                 | `<id>`06  |
   | 8889 (Backup)                  | `<id>`07  |
   | 8890 (Backup)                  | `<id>`08  |

2. Account credentials table:

   | description            | account  | password   |
   | ---------------------- | -------  | ---------- |
   | System, Remote Desktop | ubuntu   | `<token1>` |
   | S3 Object Storage      | `<name>` | `<token2>` |
   | Seafile                | `<email>`| `<token3>` |
   | Hedgedoc               | `<email>`| `<token4>` |
   | Jupyter                |          | `<token5>` |
   | SSH                    | ubuntu   | `<keyfile>`|

::: tip Note
- If Jupyter password is not provided, it is at line 991 of `~/.jupyter/jupyter_lab_config.py`. 
- If S3 credential is not provided, the name is the same as your container name, and the password is the same as Seafile. 
- Keep the tables in a secure place and do not share with others.
:::

::: tip Note
Each container appears as a dedicated machine from the inside. The default username is `ubuntu`. Changing this username is not recommended due to static configurations.
:::

### 3. SSH Login

Assuming access to `roselab1` (replace with your assigned machine if different):

#### For Unix-based systems (macOS/Linux):

1. Move the private key to `~/.ssh` and set permissions:
   ```bash
   mv path/to/keyfile ~/.ssh/
   chmod 600 ~/.ssh/keyfile
   ```

2. Connect via SSH:
   ```bash
   ssh ubuntu@roselab1.ucsd.edu -p <id>00 -i ~/.ssh/keyfile
   ```

#### For Windows:

1. If you're using PowerShell or Command Prompt:
   - Move the keyfile to a known location (e.g., `C:\Users\YourUsername\.ssh\`)
   - You may need to follow this [StackOverflow guide](https://stackoverflow.com/questions/64687271/how-to-avoid-permission-denied-publickey-ssh-key-windows) to set the correct permissions.

2. Connect via SSH:
   ```powershell
   ssh ubuntu@roselab1.ucsd.edu -p <id>00 -i C:\Users\YourUsername\.ssh\keyfile
   ```

3. If you're using PuTTY:
   - Convert the keyfile to PPK format using PuTTYgen
   - In PuTTY, set the hostname to `roselab1.ucsd.edu`, port to `<id>00`
   - Under Connection > SSH > Auth, browse to your PPK file
   - Click 'Open' to connect

::: tip Note
While the login does not require a VPN, the UCSD_GUEST network may block SSH. Please use a different network if you encounter issues.
:::

#### VSCode RemoteSSH (Recommended)

For a more integrated development experience:

1. Edit `~/.ssh/config`:
   ```
   Host roselab1
     HostName roselab1.ucsd.edu
     User ubuntu
     Port <id>00
     IdentityFile ~/.ssh/keyfile
   ```

2. Install the "Remote - SSH" VSCode extension.

3. Open the Command Palette (Ctrl+Shift+P or Cmd+Shift+P) and search for "Remote-SSH: Connect to Host".

4. Select "roselab1" from the list of configured SSH hosts.


#### Troubleshooting: SSH Known Host Issues

If you encounter an SSH connection failure with a message about host key verification, e.g.,

```
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@    WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!     @
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
IT IS POSSIBLE THAT SOMEONE IS DOING SOMETHING NASTY!
```

it's likely due to changes in the network architecture or server configuration. This is common when you delete your container and create a new one (see [Moving between Machines](./cluster)). To resolve this:

1. Remove the old host key from your known_hosts file:

   ```bash
   ssh-keygen -R [roselab1.ucsd.edu]:[id]00
   ```

   Replace `[id]00` with your assigned SSH port.

2. After removing the old key, try connecting again. You'll be prompted to add the new host key:

   ```
   The authenticity of host '[roselab1.ucsd.edu]:[id]00 ([IP_ADDRESS])' can't be established.
   ED25519 key fingerprint is SHA256:XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX.
   Are you sure you want to continue connecting (yes/no/[fingerprint])?
   ```

3. Type 'yes' to add the new key to your known_hosts file.

::: tip Note
If you're still experiencing connection issues after this step, please contact the RoseLab administrator for further assistance. There might be additional network or configuration changes that need to be addressed.
:::

### 4. Explore Your Container

Now let's check the resources assigned to you. First, use `lscpu` to check the CPU cores. Although the CPU indices may differ, you should see 12 online CPU cores. Here's an example output:

```bash
$ lscpu
...
CPU(s):                  56
  On-line CPU(s) list:   4,6,11,13,18,19,23,29,34,38,41,42
  Off-line CPU(s) list:  0-3,5,7-10,12,14-17,20-22,24-28,30-33,35-37,39,40,43-55
...
```

Next, you can inspect the memory assigned to you using the `/proc/meminfo` file. You should see around 128 GB of total RAM. 

```bash
$ cat /proc/meminfo
MemTotal:       125000000 kB
MemFree:        96093828 kB
MemAvailable:   96883860 kB
```

To see the file system, run `df -H` . You would see 

* the system SSD with around 256 GB of available space,
* a 5 TB private data HDD mounted under `/data` that is only accessible to you, and
* a 5 TB public data HDD mounted under `/public` that is accessible to everyone.

::: tip Note
The system SSD is faster but has limited space and is local to the machine. The HDD is synchronized between machines and is suitable for large datasets. When you modify files in `/data` in one container, the changes will be reflected in your containers on all other machines. Use the HDD for larger or archived project data.
:::

```bash
$ df -H
Filesystem                   Size  Used Avail Use% Mounted on
zfs-pool/containers/account  290G   43G  248G  15% /
...
data/account-vol             5.0T  263k  5.0T   1% /data
data/public                  5.0T  263k  5.0T   1% /public
```

It is recommended to use soft links to access your data files on the `/data` HDD. For example, instead of downloading your data files to `/data/project1/sample...pt` and hard-coding their absolute paths, you can create a soft link under the code folder using the `ln -s /data/project1/ /home/ubuntu/project1/data/` command. Then, you can refer to the data files as if they and the code are in the same project structure.

### 5. Verify Web Application Access

Refer to the documentation for [Seafile](https://help.seafile.com/), [HedgeDoc](https://docs.hedgedoc.org/), and [MinIO](https://min.io/docs/minio/linux/index.html) to access these services. For [Jupyter Lab](./jupyter) or [Remote Desktop](./rdp), check the respective pages for login instructions.

## What's Next?

Congratulations on setting up your RoseLab container! Here are some next steps:

1. Create additional containers on other machines referring to the [Moving between Machines](./cluster) guide.
2. Review the [differences](./limit) between containers and dedicated servers.
3. Enhance your [security](./security) by updating passwords and keys.
4. If you encounter performance issues, consult the [Troubleshooting](./troubleshooting) section.

## Support

For questions or assistance, contact the admin Zihao Zhou (ziz244@ucsd.edu).