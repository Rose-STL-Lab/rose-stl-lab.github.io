# Remote Desktop

:::tip Note
This guide is applicable only to users who requested Remote Desktop. Examples use roselab1, but the same principles apply to roselab2~4.
:::

## Quick Start

### Setting Up Permanent Port Mapping

To set up a permanent TCP port mapping for Remote Desktop using the common utilities:

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
   - Source port: Choose an available port (e.g., 25309, if your range is 25300-25399)
   - Destination port: 3389 (RDP's default port)
   - Protocol: TCP

6. Confirm your choices when prompted

After setting up the TCP mapping, you can connect to your Remote Desktop directly using the address `rdp://roselab1.ucsd.edu:25309` (replace 25309 with your chosen port number if different). This is the only option for mobile devices that don't support SSH forwarding.

:::tip Note
Remember to use a strong password for your RDP connection, especially when using direct port mapping.
:::

### SSH Port Forwarding

If you don't like the less secure permanent mapping, use SSH port forwarding to access your Remote Desktop service:

1. If you've configured your `.ssh/config` file:

   ```bash
   laptop$ ssh -fN -L 3389:localhost:3389 roselab1
   ```

2. If you haven't configured `.ssh/config`:

   ```bash
   laptop$ ssh -fN -L 3389:localhost:3389 ubuntu@roselab1.ucsd.edu -p <ssh-port> -i path/to/keyfile
   ```

These commands initiate a background connection forwarding your local port 3389 to the remote display server. Connect to the desktop at `rdp://localhost:3389` using compatible software. You may need to rerun the command if the network environment changes.

### Using Visual Studio Code

If you're using Visual Studio Code with the Remote SSH extension:

1. Connect to your RoseLab server.
2. Go to the "Ports" view in the left sidebar.
3. Click on "Forward a Port" and enter 3389.
4. Connect to the desktop at `rdp://localhost:3389`.

## Troubleshooting Port Occupancy

If you encounter a "port already in use" error:

For macOS/Linux:
```bash
sudo lsof -i :3389
```

For Windows (PowerShell):
```powershell
Get-NetTCPConnection -LocalPort 3389
```

These commands will show processes using port 3389. You can then close the conflicting process or choose a different port.

## Verified Clients

Connect to RDP using these clients by saving your given credentials as a new user account and adding the appropriate link.

:::warning
The RDP account and password are your Ubuntu account and password. Change the password with `sudo passwd ubuntu`. Use a strong password, especially for publicly accessible services.
:::

### Mac OS

[Microsoft Remote Desktop](https://apps.apple.com/us/app/microsoft-remote-desktop/id1295203466?mt=12)

### iOS

[Microsoft Remote Desktop](https://apps.apple.com/us/app/remote-desktop-mobile/id714464092)

### Windows

[Microsoft Remote Desktop](https://apps.microsoft.com/store/detail/microsoft-remote-desktop/9WZDNCRFJ3PS?hl=en-us&gl=us&rtc=1)

### Linux

[Remmina](https://ubuntu.com/tutorials/access-remote-desktop#1-overview) 

Feel free to suggest additional options for this list.

## Common Troubleshooting

### xRDP shows only black screen after authentication windows

This issue often occurs when [you've logged into the machine through RDP for multiple sessions](https://c-nergy.be/blog/?p=16682). 

#### Solution 1

1. Check your xrdp sessions:
   ```bash
   ps aux | grep xrdp
   ```
   You should see multiple running `xOrg` processes.

2. Kill all sessions:
   ```bash
   sudo pkill -9 xrdp
   sudo pkill -9 Xorg
   ```

3. Restart the xrdp service:
   ```bash
   sudo systemctl restart xrdp
   ```

#### Solution 2

If Solution 1 doesn't work, run `reboot` to restart your container, then try connecting again.

### Enabling multiple concurrent xRDP sessions

Follow [Workaround 3 in this article](https://c-nergy.be/blog/?p=16698):

1. Open `/etc/xrdp/startwm.sh`:
   ```bash
   sudo nano /etc/xrdp/startwm.sh
   ```

2. Locate `test -x /etc/X11/Xsession && exec /etc/X11/Xsession` and add above it:
   ```bash
   unset DBUS_SESSION_BUS_ADDRESS
   unset XDG_RUNTIME_DIR
   ```

3. Save the file and restart the xrdp service:
   ```bash
   sudo systemctl restart xrdp
   ```

Note: This workaround may cause some software to complain if already in use in existing sessions.

### Adding more software and features

For a more feature-rich development environment (e.g., with PyCharm), install additional software:

```bash
sudo apt install gnome-software
sudo snap install snap-store
sudo apt install ubuntu-restricted-extras
```

Consider trying other desktop environments like KDE Plasma Desktop and customizing your setup.

:::tip Note
Replace roselab1 with your assigned server (roselab2, roselab3, or roselab4) in all examples.
:::