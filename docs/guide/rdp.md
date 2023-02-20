# Remote Desktop

:::tip Note
This guide is applicable only to users who requested Remote Desktop.
:::

## Quick Start

If you did not request port mapping, you will need to use an SSH reverse proxy to access your Remote Desktop service. After confirming that you can successfully SSH into the server, run the following command:

```bash
laptop$ ssh -fN -L 3389:localhost:3389 ubuntu@roselab1.ucsd.edu -p ssh-port -i path/to/keyfile
```

This command initiates a background connection that forwards all your connections to `localhost:3389` to your remote display server. You can then connect to the desktop at `rdp://localhost:3389` by compatible software. Please note that you may need to rerun the command if the network environment changes.

If you requested port mapping, you can directly access the desktop at `rdp://roselab1.ucsd.edu:<rdp-port>`. Note that on mobile devices that do not support SSH forwarding, port mapping is the only option.

## Verified Clients

Connecting to RDP using the following clients is usually straightforward. Just save your given credentials as a new user account and add the link above.

:::warning
The RDP account and password are essentially your Ubuntu account and password. You may change the password by `sudo passwd ubuntu`. If you decide to do so, please use a strong password, especially if your service is publicly accessible.
:::

### Mac OS

[Microsoft Remote Desktop](https://apps.apple.com/us/app/microsoft-remote-desktop/id1295203466?mt=12)

### iOS

[Microsoft Remote Desktop](https://apps.apple.com/us/app/remote-desktop-mobile/id714464092)

### Windows

[Microsoft Remote Desktop](https://apps.microsoft.com/store/detail/microsoft-remote-desktop/9WZDNCRFJ3PS?hl=en-us&gl=us&rtc=1)

### Linux

[Remmina](https://ubuntu.com/tutorials/access-remote-desktop#1-overview) 

You are welcome to add more options to this list.

## Common Troubleshooting

### xRDP shows only black screen after authentication windows

This is a common problem for Ubuntu xRDP. The usual cause is that [you logged in the machine through RDP and SSH simultaneously](https://c-nergy.be/blog/?p=16682). 

#### Solution 1

Log out of all other sessions, restart the xrdp service by using `systemctl restart xrdp`, and then try again.

#### Solution 2

If Solution 1 does not work, you can run `reboot` and try connecting again. It will restart your container.

### I want multiple concurrent xRDP sessions

The recommended way is the Workaround 3 in this [article](https://c-nergy.be/blog/?p=16698).

> Simply open the /etc/xrdp/startwm.sh with your favorite text editor..
>
> ```bash
> sudo nano /etc/xrdp/startwm.sh
> ```
>
> At the end of the file, locate the line **test -x /etc/X11/Xsession && exec /etc/X11/Xsession** and just above it add the following commands
>
> ```bash
> unset DBUS_SESSION_BUS_ADDRESS
> unset XDG_RUNTIME_DIR
> ```
>
> Save your file and restart the xrdp service by `systemctl restart xrdp`.

This workaround is not enabled by default because it has some limitations, such as causing some software or programs to complain if they are already in use in one of the existing sessions.

### I want more software and features

If you want to use your Ubuntu desktop for serious development (e.g., with PyCharm), you may find that the default desktop is too "clean" and lacks the necessary software and features. In this case, you can install additional software by running the following commands:

```bash
sudo apt remove ubuntu-desktop
sudo apt-get update
sudo apt install ubuntu-desktop --install-recommends
sudo reboot
```

You can also try using other desktop environments, such as the KDE Plasma Desktop, and customize your desktop to suit your needs.

