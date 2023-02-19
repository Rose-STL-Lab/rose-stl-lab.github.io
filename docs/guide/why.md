# Why Roselab

## Problems

Before Roselab servers were available, students run their machine learning projects on either the Nautilus cluster or CSE shared servers. The two options were at extreme ends of the virtualization spectrum. Nautilus provided complete virtualization in an ephemeral application container while the shared servers offered no virtualization. The actual machine learning development falls between the two. Student developers aimed to protect their computing resources and data from disruption by others. Also, they needed a persistent development environment that would not disappear after every run.

Attempts to resolve these issues through the use of Linux user permission and [persistent storage](https://kubernetes.io/docs/concepts/storage/persistent-volumes/) were made, but these solutions still had their limitations. Linux user permission provided isolation for each user's environment. However, it lacks network isolation, requires a significant amount of conventional rules, and makes the installation of dependencies difficult. Although persistent storage allows for a persistent environment in the container, the storage was network mounted and spatially distant from the running server, resulting in slower read and write speeds compared to ephemeral storage.

Roselab servers aims to address these issues by leveraging advanced technology such as [ZFS](https://en.wikipedia.org/wiki/ZFS) and [Linux Containers](https://linuxcontainers.org/). These servers offer a sufficient level of storage, CPU, memory, and network isolation, while maintaining minimal performance costs. Each user has root and desktop access to the server as if it were their personal workstation.

## Security and Privacy

In ideal conditions, Kubernetes clusters or bare metal servers can provide high levels of security. However, due to their implementation, the Nautilus cluster and CSE shared servers present non-trivial security risks.

The Nautilus cluster manages user credentials on a namespace basis, which means that all users in the same namespace can potentially access sensitive information, such as:

- SSH into anyone's running containers
- Stop anyone's batch jobs
- Inspect anyone's stored secrets
- Delete anyone's persistent volumes 

Additionally, if a developer carelessly stores a Github SSH key with write access in the Nautilus secrets, others could potentially delete all their Github repositories.

The CSE shared servers offer many users sudo access, without designating an administrator. This gives many accounts the permission to perform any actions mentioned above. Additionally, many users use short, explicit passwords instead of SSH to log in, further increasing the security risk. Although the CSE shared servers are currently secured under the UCSD intranet, if a device with lesser protection in the CSE server room is compromised, the CSE shared servers is vulnerable.

Roselab servers have a single adminstrator. Only this administrator has full access to all containers. By default, all containers require an SSH private key for login. Thanks to the isolation between the containers, every user cannot access others' resources. Even if one container were to become compromised due to leaking SSH key, the others would remain invulnerable. 

## Usability

We list a few use cases where Roselab servers would make your life much easier.

### Big Data Transfer

The Nautilus system has gained a reputation for its sluggish dataset transfer speeds, due to its network-mounted persistent storage. The CSE shared servers have faster speeds but limited storage. Each server has up to 4 TB disk space with no virtualization technology, leaving them vulnerable to disk failure.

On the other hand, the RoseLab servers offer a massive 120 TB data server with the reliable [RAID-Z](https://www.raidz-calculator.com/raidz-types-reference.aspx) technology that can continue functioning after one disk failure. Because RoseLab is located in the CSE building, uploading data is quick and efficient. Students can also directly plug in an external hard drive to transfer data by contacting the administrator.

### Remote GUI Desktop

The ability to use a remote desktop is essential for some machine learning tasks, such as OpenAI Gym, and for quickly inspecting generated videos or images. However, setting up a remote desktop on the CSE shared servers often requires elevated permissions and can interfere with other services due to a lack of network isolation. Using a remote desktop on Nautilus can also result in high latency if the assigned server is far away, and requires manual creation of a pod with a limited lifespan.

Fortunately, the RoseLab servers offer seamless remote desktop support for all users, without interfering with each other. The remote desktop connection is always available, providing a reliable and convenient solution for monitoring machine learning tasks.

### Network Access

Nautilus may sometimes have stability issues because of the large volume of nodes and requests. For instance, it could encounter DNS resolution failures.

```bash
Downloading http://yann.lecun.com/exdb/mnist/train-images-idx3-ubyte.gz
Downloading http://yann.lecun.com/exdb/mnist/train-images-idx3-ubyte.gz to ./data/MNIST/raw/train-images-idx3-ubyte.gz
Failed to download (trying next):
<urlopen error [Errno -3] Temporary failure in name resolution>
```

While the CSE shared servers have a more reliable internet connection, they also have many outbound firewall rules in place. These rules can limit access to commonly used development websites, like github.com.

```bash
$ ping github.com
PING github.com (140.82.114.4) 56(84) bytes of data.
^C
--- github.com ping statistics ---
5 packets transmitted, 0 received, 100% packet loss, time 4103ms
```

In contrast, RoseLab does not enforce outbound firewall rules, leaving network security responsibilities in the hands of individual users. Nevertheless, the servers still have a comprehensive list of inbound rules that are strictly enforced, providing strong protection against malware and cyber attacks.
