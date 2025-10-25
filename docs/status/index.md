# System Status

::: tip Real-Time Monitoring
For real-time system metrics, visit our [Grafana Dashboard](http://roselab1.ucsd.edu/grafana/)
:::

## Current Status

**Last Updated**: October 2025

### Server Status

| Server | Status | Notes |
|--------|--------|-------|
| roselab1 | 🟢 Online | All systems operational |
| roselab2 | 🟢 Online | All systems operational |
| roselab3 | 🟢 Online | All systems operational |
| roselab4 | 🟢 Online | All systems operational |
| roselab5 | 🟢 Online | All systems operational |
| rosedata | 🟢 Online | All systems operational |

Legend: 🟢 Online, 🟡 Degraded Performance, 🔴 Offline, 🔵 Maintenance

### Storage Status

::: info Storage Update
The lab's shared storage had previously been at high utilization. We've freed up approximately 20TB of space and new drives are on the way to expand capacity. Please continue to be mindful of storage usage.
:::

| Storage Pool | Total | Used | Available | Usage |
|--------------|-------|------|-----------|-------|
| Shared HDD Cluster | ~140TB | Varies | ~20TB+ | Manageable |
| Per-user `/data` | 5TB | Varies | Varies | Check with `df -h /data` |
| Per-user `/public` | 5TB (shared) | Varies | Varies | Check with `df -h /public` |

**Best practices for storage management**:
1. Store large datasets on `/data` (synchronized across servers)
2. Keep environments and code on local SSD
3. Archive or compress old datasets
4. Clean up intermediate experiment results regularly
5. Use `/utilities/common-utilities.py` to clean pip cache if needed

### Current NVIDIA Driver Version

**Version**: 580.95.05

::: danger Important
Do **NOT** install nvidia-driver through your package manager (apt, yum, etc.). This will break GPU passthrough in containers.

If you accidentally corrupt your NVIDIA driver, use `/utilities/nvidia-upgrade.sh` and `sudo reboot` to fix it.
:::

## Recent System Updates

### October 2025
- **Server Migration Complete**: All five roselab servers migrated to new network architecture
  - Server room move completed (wave 4, Oct 2)
  - Improved data loading speed between servers
  - Network upgraded to 100Gbps
  - roselab5 now has all 8x H200 GPUs online
- **roselab2 & roselab3 Back Online**: All NVIDIA drivers upgraded to version **580.95.05**
- **rosedata Recovered**: Storage server back online after data recovery
- **Storage Update**: Freed up ~20TB of space, new drives on the way

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

::: tip No Active Issues
There are currently no major known issues. All servers and services are operational.
:::

<!--
### Example Active Issue Format:

### Issue Name

**Issue**: Description
**Status**: 🔴 Active Issue / 🟡 Under Investigation / 🟢 Monitoring
**Impact**: What users experience
**Workaround**: Temporary solutions
**ETA**: Expected resolution time
-->

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
| MinIO | 🟢 Online | [rosedata.ucsd.edu](https://rosedata.ucsd.edu) | S3 object storage |
| HedgeDoc | 🟢 Online | [roselab1.ucsd.edu/hedgedoc](https://roselab1.ucsd.edu/hedgedoc) | Markdown collaboration |
| WandB | 🟢 Online | [rosewandb.ucsd.edu](https://rosewandb.ucsd.edu) | Experiment tracking |
| RoseLibreChat | 🟢 Online | [roselab1.ucsd.edu:3407](https://roselab1.ucsd.edu:3407/) | AI chat interface (API-based) |

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
- Oct 2-4: Server room migration (wave 4)
- Oct 4: roselab2, roselab3 back online; All systems operational
- Oct 11: Power outage for room finalization (mid-afternoon recovery)
- Driver upgrade to 580.95.05
- Network upgraded to 100Gbps
- roselab5 H200 GPUs online
- Storage freed up ~20TB

---

::: tip Page Maintenance
This page is manually updated by the RoseLab admin. For the most current real-time metrics, always check [Grafana](http://roselab1.ucsd.edu/grafana/).

If you notice this page is out of date, please contact the admin.
:::
