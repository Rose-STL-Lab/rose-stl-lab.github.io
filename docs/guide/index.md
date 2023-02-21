# Getting Started

## Overview

The RoseLab servers are the primary machine learning servers owned and managed by the UCSD CSE [Rose Lab](https://roseyu.com). These servers offer a versatile platform for machine learning researchers to develop and run their models within [Linux Containers](https://linuxcontainers.org/). In addition, RoseLab servers provide access to [Grafana](http://roselab1.ucsd.edu/grafana/) for real-time machine metrics tracking and [Seafile](http://roselab1.ucsd.edu/seafile) for convenient data sharing. Further web applications are planned to be added in the future to support the needs of researchers.

### Hardware

The RoseLab servers are located in Rack C05 of the CSE server room 1215 and consist of two primary components:

1. Gigabyte G292 **4x A100** GPU server
2. Supermicro 12-bay Storage server, equipped with **6x 20TB** hard drives.

::: tip Note
Please note that the RoseLab servers are still in the early stages of development and any feedback regarding the user experience is highly appreciated. More hardwares are planned for the future. For more information about the rationale behind the servers, please refer to the [Why RoseLab](./why) section.
:::

## Quick Start

You shall apply for a Roselab server container using the [Account Request Form](https://docs.google.com/forms/d/e/1FAIpQLSdKIzsrn1DulFZEW8esUrMVuYtKyMMxax1foBDrDM7OqMb58A/viewform?usp=pp_url). 

* Don't worry too much about your selections, as port mappings and resource quota can be easily adjusted
* You will have root permission to install or remove any software other than the nvidia driver
* If you need to switch to a different software image, such as for a new project on reinforcement learning, you can request migration. However, this process requires you to back up all personal files to `/data`.

::: warning
Please be aware that the host and container nvidia driver version must match, because your GPU tasks within the container will communicate with the host driver kernel module. If you see the message `Failed to initialize NVML: Driver/library version mismatch`, please contact the admin.
:::

Once your request is approved, you will receive an email containing two tables:

> <id\> is a 3-digit number.
> 
> | Container Port →               | Host Port |
> | ------------------------------ | --------- |
> | 22 (SSH)                       | <id\>00   |
> | 3389 (RDP)                     | <id\>01   |
> | 5900 (VNC)                     | <id\>02   |
> | 80 (HTTP)                      | <id\>03   |
> | 443 (HTTPS)                    | <id\>04   |
> | 8080 (Web server, e.g. Tomcat) | <id\>05   |
> | 8888 (Jupyter)                 | <id\>06   |
> | 8889 (Backup)                  | <id\>07   |
> | 8890 (Backup)                  | <id\>08   |
>
> | description            | account | password   |
>| ---------------------- | ------- | ---------- |
> | System, Remote Desktop | ubuntu  | <token1\>  |
> | Seafile                |         | <token2\>  |
> | SSH                    | ubuntu  | <keyfile\> |

You Jupyter token is at line 991 of `~/.jupyter/jupyter_lab_config.py`. Keep the tables in a secure place and do not share with others. 

::: tip Note
[OS-level virtualization](https://en.wikipedia.org/wiki/OS-level_virtualization) makes each isolated container look like a dedicated machine from inside, so everyone's username is `ubuntu` . Different containers differ by its hostname. It is *not recommended* to change the username, as you would have a lot of troubles with static configurations.
:::

### SSH Login

Move the downloaded private key file to your `~/.ssh` folder. Then, change the file permission such that it is not readable by others.

```bash
chmod 600 ~/.ssh/keyfile
```

Run the SSH command with your designated port (`-p`).

```bash
ssh ubuntu@roselab1.ucsd.edu -p [id]00 -i ~/.ssh/keyfile
(base) ubuntu@account:~$
```

### Know Your Container

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

```bash
$ df -H
Filesystem                   Size  Used Avail Use% Mounted on
zfs-pool/containers/account  290G   43G  248G  15% /
...
data/account-vol             5.0T  263k  5.0T   1% /data
data/public                  5.0T  263k  5.0T   1% /public
```

It is recommended to use soft links to access your data files on the `/data` HDD. For example, instead of downloading your data files to `/data/project1/sample...pt` and hard-coding their absolute paths, you can create a soft link under the code folder using the `ln -s /data/project1/ /home/ubuntu/project1/data/` command. Then, you can refer to the data files as if they and the code are in the same project structure.

::: tip

If your dataset is smaller than 200 GB, it is recommended to directly load the dataset from the system disk, as SSD is faster than HDD. You can use the HDD disk to store your completed projects' data.

:::

### Check Credentials

To check your webapp credentials and use the webapps, refer to the [Seafile](https://help.seafile.com/) and [HedgeDoc](https://docs.hedgedoc.org/) documentation. If you requested [Jupyter Lab](./jupyter) or [Remote Desktop](./rdp), refer to the corresponding pages to check if you can log in successfully.

### What's next?

Congratulations! You are ready to use your resource now. You may have noticed that using a Roselab container is like using a dedicated server. However, there is still some [difference](./limit) which you may want to take a look. You may want to use your own passwords and private key, following the guide in the [Security](./security) section. If you notice that your model is running slowly on the server, you can refer to the [Troubleshooting](./troubleshooting) section for possible solutions.

## Support

If you have questions or need help, reach out to the admin Zihao Zhou (ziz244@ucsd.edu).
