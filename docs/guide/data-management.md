# Data Management Best Practices

## Overview

RoseLab servers provide two types of storage with different characteristics. Understanding when and how to use each type is crucial for optimal performance and efficient resource utilization.

## Storage Types

### System SSD (Local Storage)

- **Size**: ~256 GB available per container
- **Performance**: High-speed NVMe SSD
- **Scope**: Local to each machine (not synchronized)
- **Best for**: Active development, environments, code, and frequently accessed small files

### `/data` Directory (Network HDD)

- **Size**: 5 TB per user (private, accessible only to you)
- **Performance**: Network-mounted HDD over 100Gbps connection
- **Scope**: Synchronized across all RoseLab servers (roselab1-5)
- **Best for**: Large datasets, checkpoints, archived data

::: warning Storage Capacity
The lab's shared storage is at high utilization. New drives are on the way to expand capacity. In the meantime, please be mindful of storage usage and clean up unnecessary data regularly. Contact the admin if you need assistance with storage management.
:::

### `/public` Directory (Shared Network HDD)

- **Size**: 5 TB total (shared among all users)
- **Performance**: Network-mounted HDD over 100Gbps connection
- **Scope**: Synchronized across all servers, accessible to all users
- **Best for**: Shared datasets, collaborative data

## Best Practices by File Type

### ❌ Never Put on `/data`

**Development Environments and Package Caches**

Do **NOT** store these on `/data`:
- Python virtual environments (`venv`, `conda` environments)
- Package manager caches (`pip`, `conda`, `npm`)
- Compiled code and bytecode (`.pyc` files, `__pycache__` directories)
- Build artifacts

**Why?** Loading thousands of small files through the network causes significant performance degradation. Even with a 100Gbps connection, the latency of accessing numerous small files adds up quickly.

**Example of what to avoid:**
```bash
# ❌ BAD: Creating conda environment on /data
conda create -p /data/envs/myenv python=3.10

# ✅ GOOD: Keep environments on local SSD
conda create -n myenv python=3.10
```

### ✅ Always Put on `/data`

**Large Model Checkpoints**

Checkpoints should be stored on `/data` because:
- They are typically single large files (GBs each)
- Loading a single large file over network is efficient
- They benefit from cross-server synchronization
- They don't need to be duplicated across servers

**Example:**
```python
# ✅ GOOD: Save checkpoints directly to /data
torch.save(model.state_dict(), '/data/experiments/project1/checkpoint_epoch_50.pt')

# Loading is also efficient
model.load_state_dict(torch.load('/data/experiments/project1/checkpoint_epoch_50.pt'))
```

**Archived or Cold Datasets**

Move datasets to `/data` when:
- You've completed a project but want to keep the data
- You're doing intermediate preprocessing
- The dataset is not actively used in training

### ⚖️ Conditional: Active Datasets

The decision depends on dataset characteristics:

#### Small to Medium Datasets (< 500 GB, consolidated files)

**Strategy**: Keep a hot copy on local SSD, archive to `/data`

```bash
# Keep active copy on local SSD
/home/ubuntu/projects/active-project/data/

# Archive completed datasets to /data
/data/datasets/project1/
```

#### Large Consolidated Datasets (> 500 GB, few large files)

**Strategy**: Load directly from `/data`

If your dataset consists of a few large files (e.g., HDF5, Parquet, or compressed archives), loading from `/data` is acceptable:

```python
# ✅ Acceptable: Loading large consolidated files from /data
import h5py
with h5py.File('/data/datasets/large_dataset.h5', 'r') as f:
    data = f['train'][:]
```

#### Large Scattered Datasets (> 500 GB, millions of small files)

**Strategy**: Create a continuous copy for `/data` storage

If you have millions of small files (e.g., ImageNet with individual JPG files):

1. **For active use**: Keep on local SSD if space permits
2. **For archival**: Create a single consolidated file

```bash
# Create a tar archive for efficient storage/loading from /data
tar -czf /data/datasets/imagenet.tar.gz /home/ubuntu/datasets/imagenet/

# Or use HDF5 to consolidate
# Python example:
import h5py
import os
from PIL import Image
import numpy as np

with h5py.File('/data/datasets/imagenet.h5', 'w') as f:
    images_group = f.create_group('images')
    for img_path in image_paths:
        img = np.array(Image.open(img_path))
        images_group.create_dataset(img_path, data=img)
```

3. **Alternative**: Use a dataloader that supports streaming from tar archives:
```python
import webdataset as wds

# Stream from tar archive on /data
dataset = wds.WebDataset('/data/datasets/imagenet.tar')
```

## Storage Management Strategies

### Symlinks for Data Access

Use symbolic links to maintain clean project structure while storing data on `/data`:

```bash
# Instead of hardcoding paths like /data/project1/samples...
# Create a symlink in your project directory
cd /home/ubuntu/projects/my-project/
ln -s /data/project1/ ./data

# Now you can use relative paths in your code
# ./data/samples/sample1.pt
```

This approach allows you to:
- Keep code and data logically together
- Easily switch between different data locations
- Move projects between servers without changing code

### Hot/Cold Data Management

**Active Projects (Hot Data)**:
- Store on local SSD for best performance
- Keep code, environments, and active datasets local
- Use `/data` only for checkpoints and large files

**Completed Projects (Cold Data)**:
- Move entire project data to `/data`
- Keep only code on local SSD (or use Git)
- This frees up SSD space for new active projects

**Example workflow:**
```bash
# During active development
/home/ubuntu/projects/active-research/
├── code/
├── data/ -> /data/active-research/data/  # symlink to /data for large files
├── checkpoints/ -> /data/active-research/checkpoints/  # symlink
└── env/  # local conda environment

# After project completion
# Move everything to /data, remove local copy
mv /home/ubuntu/projects/active-research /data/archived-projects/
# Keep only the code in git, remove local files
```

### Monitoring Storage Usage

Regularly check your storage usage:

```bash
# Check local SSD usage
df -h /

# Check /data usage
df -h /data

# Find large directories
du -h --max-depth=1 /home/ubuntu/ | sort -hr | head -10
du -h --max-depth=1 /data/ | sort -hr | head -10
```

### When Storage is Full

If you encounter storage capacity issues:

1. **Check for unnecessary files**:
   ```bash
   # Find large files
   find /home/ubuntu -type f -size +1G -exec ls -lh {} \;

   # Clean conda/pip caches
   conda clean --all
   pip cache purge

   # Or use the common utility to clean pip cache with temporary quota lift
   python /utilities/common-utilities.py
   # Select the "Clean pip cache" option
   ```

2. **Move cold data to `/data`**:
   - Archive completed projects
   - Move old checkpoints
   - Compress large log files

3. **Remove redundant data**:
   - Delete duplicate datasets across servers (keep one copy in `/data`)
   - Remove intermediate experiment results
   - Clean up old Docker images if using Docker-in-LXC

4. **Contact admin** if `/data` is full - additional storage may need to be provisioned

## Performance Considerations

### Network Mounted Storage Performance

While `/data` is connected via 100Gbps network, performance depends on access patterns:

- **Good**: Sequential reads of large files (300+ MB/s)
- **Acceptable**: Random reads of medium files
- **Poor**: Random access to thousands of small files

### Loading Large Checkpoints

Loading large checkpoints from `/data` is efficient:

```python
# This is fine - single large file transfer
checkpoint = torch.load('/data/models/large_model_5GB.pt')
```

### Accessing Many Small Files

Avoid patterns like this:

```python
# ❌ BAD: Loading many small files from /data during training
class MyDataset(Dataset):
    def __getitem__(self, idx):
        # Each call loads a small file from network - very slow!
        return torch.load(f'/data/samples/sample_{idx}.pt')
```

Instead:

```python
# ✅ GOOD: Consolidate small files or cache locally
class MyDataset(Dataset):
    def __init__(self):
        # Load entire dataset once from /data
        self.data = torch.load('/data/dataset/consolidated.pt')

    def __getitem__(self, idx):
        return self.data[idx]
```

## Summary

| File Type | Local SSD | /data | /public |
|-----------|-----------|-------|---------|
| Code, scripts | ✅ | ❌ | ❌ |
| Conda/venv environments | ✅ | ❌ | ❌ |
| Python cache (`__pycache__`) | ✅ | ❌ | ❌ |
| Active small datasets | ✅ | ❌ | ❌ |
| Large model checkpoints | 🟡 | ✅ | ❌ |
| Archived datasets | ❌ | ✅ | 🟡 |
| Shared datasets | ❌ | ❌ | ✅ |
| Logs (active) | ✅ | ❌ | ❌ |
| Logs (archived) | ❌ | ✅ | ❌ |

Legend: ✅ Recommended, 🟡 Acceptable, ❌ Not recommended

## Additional Resources

- [Getting Started Guide](./index) - Basic storage overview
- [Moving between Machines](./cluster) - Container migration
- [Troubleshooting](./troubleshooting) - Performance issues
