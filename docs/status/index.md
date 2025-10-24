# System Status

::: tip Real-Time Monitoring
For real-time system metrics, visit our [Grafana Dashboard](http://roselab1.ucsd.edu/grafana/)
:::

## Current Status

**Last Updated**: October 24, 2025

### Server Status

| Server | Status | Notes |
|--------|--------|-------|
| roselab1 | 🟢 Online | All systems operational |
| roselab2 | 🟢 Online | All systems operational |
| roselab3 | 🟢 Online | All systems operational |
| roselab4 | 🟢 Online | All systems operational |
| roselab5 | 🟢 Online | All systems operational |
| rosedata | 🔴 Offline | Down for data recovery |

Legend: 🟢 Online, 🟡 Degraded Performance, 🔴 Offline, 🔵 Maintenance

### Storage Status

::: warning Storage Capacity Alert
Our 120TB HDD cluster is currently at **98% capacity**. We are actively researching and deleting outdated data. Please avoid saving new large datasets to `/data` until additional storage is provisioned.
:::

| Storage Pool | Total | Used | Available | Usage |
|--------------|-------|------|-----------|-------|
| 120TB HDD Cluster | 120TB | ~118TB | ~2TB | 98% |
| Per-user `/data` | 5TB | Varies | Varies | Check with `df -h /data` |
| Per-user `/public` | 5TB (shared) | Varies | Varies | Check with `df -h /public` |

**Recommendations during storage crunch**:
1. Avoid saving new large datasets to `/data`
2. Archive or compress old datasets
3. Move cold data to local servers or external storage temporarily
4. Clean up intermediate experiment results
5. Contact admin for data cleanup assistance

### Current NVIDIA Driver Version

**Version**: 580.95.05

::: danger Important
Do **NOT** install nvidia-driver through your package manager (apt, yum, etc.). This will break GPU passthrough in containers.

If you accidentally corrupt your NVIDIA driver, use `/utilities/nvidia-upgrade.sh` and `sudo reboot` to fix it.
:::

## Recent System Updates

### October 4, 2025
- **Server Status**: roselab2 and roselab3 are back online. All five roselab servers are now operational.
- **NVIDIA Driver Upgrade**: All NVIDIA drivers have been upgraded to version **580.95.05**
  - Users should NOT install nvidia-driver through package managers
  - Recovery tool available: `/utilities/nvidia-upgrade.sh`
- **Storage Alert**: 120TB HDD cluster at 98% capacity
  - Admin is actively researching and deleting outdated data
  - Waiting for approval to order additional disks
  - Temporary workaround: Some containers removed to free up space

### [Add previous updates chronologically]

## Scheduled Maintenance

::: tip No Scheduled Maintenance
There is currently no scheduled maintenance. This page will be updated if maintenance is planned.
:::

<!--
### Example Future Maintenance Entry:
### November 15, 2025 - roselab3 Maintenance
- **Date**: November 15, 2025, 9:00 AM - 5:00 PM PST
- **Affected Server**: roselab3
- **Reason**: Hardware upgrade (additional RAM installation)
- **Impact**: roselab3 will be completely offline during this period
- **Action Required**:
  - Save all work and commit to Git before November 15
  - Consider migrating active containers to other servers using `/utilities/common-utilities.py`
  - All data in `/data` will remain accessible from other servers
-->

## Known Issues

### Storage Space Limitations

**Issue**: 120TB cluster approaching capacity
**Status**: 🔴 Active Issue
**Impact**: Users may not be able to save new large datasets
**Workaround**:
- Use local SSD for active work when possible
- Archive old data
- Contact admin for cleanup assistance
**ETA**: Pending hardware procurement approval

### rosedata Server Down

**Issue**: rosedata storage server offline for data recovery
**Status**: 🔴 Active Issue
**Impact**: S3/MinIO services may be limited
**Workaround**: Use `/data` for storage
**ETA**: To be determined

<!--
### Example Resolved Issue:
### ~~Driver Version Mismatch~~ (Resolved)

**Issue**: Some containers showed "Driver/library version mismatch" error
**Status**: ✅ Resolved (October 4, 2025)
**Solution**: All drivers upgraded to 580.95.05
-->

## Service Status

| Service | Status | URL | Notes |
|---------|--------|-----|-------|
| Grafana | 🟢 Online | [roselab1.ucsd.edu/grafana](http://roselab1.ucsd.edu/grafana/) | Real-time metrics |
| Seafile | 🟢 Online | [roselab1.ucsd.edu/seafile](http://roselab1.ucsd.edu/seafile) | File sharing |
| MinIO | 🟡 Degraded | [rosedata.ucsd.edu](https://rosedata.ucsd.edu) | Limited due to rosedata offline |
| HedgeDoc | 🟢 Online | [roselab1.ucsd.edu/hedgedoc](https://roselab1.ucsd.edu/hedgedoc) | Markdown collaboration |
| WandB | 🟢 Online | [rosewandb.ucsd.edu](https://rosewandb.ucsd.edu) | Experiment tracking |
| RoseLibreChat | 🟢 Online | [roselab1.ucsd.edu:3407](https://roselab1.ucsd.edu:3407/) | ChatGPT frontend |

## Monitoring Your Resources

### Check Your Container Status

```bash
# Check CPU usage
htop

# Check GPU usage
nvidia-smi

# Check storage usage
df -h /
df -h /data

# Check network storage speed
dd if=/dev/zero of=/data/testfile bs=1M count=1024
# Should see ~300+ MB/s write speed
rm /data/testfile
```

### Grafana Dashboards

Visit [Grafana](http://roselab1.ucsd.edu/grafana/) to monitor:
- GPU utilization per container
- CPU and memory usage
- Network throughput
- Storage I/O

## Reporting Issues

If you encounter any issues:

1. **Check this status page** first for known issues
2. **Check Grafana** for resource utilization
3. **Contact the admin**: Zihao Zhou (ziz244@ucsd.edu)

When reporting issues, please include:
- Your container name
- The server(s) affected (roselab1-5)
- Error messages (if any)
- Steps to reproduce the issue
- Output of relevant commands (`nvidia-smi`, `df -h`, etc.)

## Subscribe to Updates

::: tip Stay Informed
Important system updates are posted in the lab Slack channel **#server**. Make sure you're subscribed to receive notifications about:
- Scheduled maintenance
- System outages
- Driver updates
- Storage alerts
:::

## Historical Status

### 2025

**October 2025**:
- Oct 4: roselab2, roselab3 back online; Driver upgrade to 580.95.05; Storage at 98%

**September 2025**:
- Sep 25: roselab2, roselab3 offline for maintenance
- Sep 10: rosedata taken offline for data recovery

[Add more historical entries as needed]

---

::: tip Page Maintenance
This page is manually updated by the RoseLab admin. For the most current real-time metrics, always check [Grafana](http://roselab1.ucsd.edu/grafana/).

If you notice this page is out of date, please contact the admin.
:::
