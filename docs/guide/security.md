# Password and Security

## Update Your Password

:::warning

If you choose to change the password, please use a strong password, especially if your service is publicly accessible. 
:::

To update your password for various accounts, follow these steps:

| Account                 | How to update password                                       |
| ----------------------- | ------------------------------------------------------------ |
| System / Remote Desktop | Enter `sudo passwd ubuntu` in the command line               |
| Jupyter Lab             | Edit the file `~/.jupyter/jupyter_lab_config.py` and change the value of `c.ServerApp.token` |
| Seafile                 | Navigate to [Settings - Private Seafile](http://roselab1.ucsd.edu/seafile/profile/#update-user-passwd) |
| SSH                     | Change the `~/.ssh/authorized_keys` file to include your new public key |
| HedgeDoc                | Currently unsupported                                        |
| MinIO                   | Currently unsupported                                        |

## Require Password for Sudo

By default, the user account `ubuntu` does not require a password to run sudo commands. 

```bash
(base) ubuntu@test:~$ sudo ls
Desktop  Documents  Downloads  Music  Pictures  Public  Templates  Videos  miniconda3  thinclient_drives
```

While convenient, some users may find this behavior insecure. To require a password for sudo commands, follow these steps:

1. Run `sudo vim /etc/sudoers.d/90-cloud-init-users`.
2. Comment out the line `ubuntu ALL=(ALL) NOPASSWD:ALL`.
3. Save the file.

Now, sudo is required for running elevated commands:

```bash
(base) ubuntu@test:~$ sudo ls
[sudo] password for ubuntu: 
sudo: a password is required
```

:::warning
Before saving the settings, double-check that you remember your password, or you will lose sudo access.
:::

## UsePAM

The `UsePAM` option (the Pluggable Authentication Module) is enabled by default in LXC images to support the user's first SSH login. However, this option allows [locked users to enter](https://arlimus.github.io/articles/usepam/), making the container less secure with new users. If you are going to create and lock new users in your container, you can disable `UsePAM` by following these steps:

1. Open the `/etc/ssh/sshd_config` file.
2. Comment out the line `UsePAM yes`.
3. Save the file.
4. Restart the SSHD daemon by `sudo systemctl restart sshd`.

```bash
# /etc/ssh/sshd_config

# Set this to 'yes' to enable PAM authentication, account processing,
# and session processing. If this is enabled, PAM authentication will
# be allowed through the KbdInteractiveAuthentication and
# PasswordAuthentication.  Depending on your PAM configuration,
# PAM authentication via KbdInteractiveAuthentication may bypass
# the setting of "PermitRootLogin without-password".
# If you just want the PAM account and session checks to run without
# PAM authentication, then enable this but set PasswordAuthentication
# and KbdInteractiveAuthentication to 'no'.

UsePAM yes  # Comment this out
```

