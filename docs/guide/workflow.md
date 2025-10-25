# Multi-Server Workflow Guide

## Overview

RoseLab provides five servers (roselab1-5) that you can use simultaneously. This guide helps you develop an efficient workflow to manage your containers across multiple servers while avoiding common pitfalls.

## Core Principles

### 1. The "Main Server" Concept

**Recommendation**: Designate one server as your "main" or "primary" server where your most up-to-date code always resides.

**Why?** When you develop across multiple servers without a clear strategy, you may encounter situations like:
- "Where is my latest dataset implementation? Oh, it's on a different server."
- "I thought I fixed this bug already... did I do it on roselab2 or roselab3?"
- "Which server has my newest experimental results?"

::: tip Server Selection Guidelines
The lab maintains a [Server Selection Spreadsheet](https://docs.google.com/spreadsheets/d/1aTKbCNTq0guwF144nnNwXgWHBZ8lwyzOLQC5vKHU6mk/edit?usp=sharing) where you should claim your main server. This helps:
- Avoid interruptions when someone runs heavy jobs
- Prevent bottlenecks by balancing load across servers
- Match your workload to the right GPU type (4090 vs A100 vs L40S vs H200)

Review the guidelines in the spreadsheet to choose the most appropriate server for your typical workload.
:::

**Example Strategy**:
```
roselab1: Main development server (always has latest code)
roselab2: Copy of roselab1 for parallel experiments
roselab4: Copy of roselab1 for GPU-intensive tasks
roselab3: Completely different project (separate codebase)
```

### 2. Controlled Branching

**Some branching is acceptable and beneficial**, but it should be intentional:

✅ **Good Branching Examples**:
- Completely different environments for different projects
  - roselab1 & roselab2: Project A (PyTorch 2.4, identical environments)
  - roselab3 & roselab4: Project B (TensorFlow, identical environments)
- Specialized server configurations
  - roselab1: Development and testing
  - roselab4: Production model training (always synced from roselab1)

❌ **Bad Branching Examples**:
- Same project with slightly different code on different servers
- Random development across multiple servers without tracking
- Forgetting which server has which version of the code

### 3. Version Control Integration

**GitHub/Git is your safety net**. With good Git practices, you can be more flexible with server branching because:
- All code is recoverable from version control
- You can safely delete containers knowing code is backed up
- Moving between servers becomes trivial (`git clone` or `git pull`)

## Recommended Workflows

### Workflow A: Single Project, Multiple Servers

**Use case**: You have one main project but need resources from multiple servers

**Setup**:
```
roselab1 (Main):
  - Primary development
  - Latest code always here
  - Regularly commit to Git

roselab2, roselab4 (Replicas):
  - Copied from roselab1 using common-utilities.py
  - Used for parallel experiments
  - Pull latest code from Git before experiments
  - Push results/checkpoints to /data
```

**Daily workflow**:
```bash
# On roselab1 (main server) - morning
cd ~/projects/my-research
git pull  # Get any remote changes
# ... do development work ...
git add .
git commit -m "Add new feature X"
git push

# On roselab2 (replica) - when starting experiments
cd ~/projects/my-research
git pull  # Get latest changes from roselab1
# ... run experiments ...
# Save checkpoints to /data (accessible from all servers)
```

**Benefits**:
- Always know where the latest code is (roselab1 + Git)
- Can run parallel experiments on different servers
- Easy recovery if one server goes down

### Workflow B: Multiple Projects, Partitioned Servers

**Use case**: You work on several independent projects

**Setup**:
```
roselab1:
  - Project A (active development)
  - Project B (maintenance mode)

roselab2:
  - Copy of roselab1 (for Project A parallel experiments)

roselab3:
  - Project C (completely independent)
  - Different environment (different PyTorch version, etc.)

roselab4:
  - Copy of roselab3 (for Project C parallel experiments)
```

**Benefits**:
- Clear separation between projects
- Can have different software stacks
- Main + replica pattern maintained for each project

### Workflow C: Git-Centric (Advanced)

**Use case**: You have excellent Git habits and want maximum flexibility

**Setup**:
```
All servers (roselab1-5):
  - Lightweight containers with just environments
  - All code managed through Git
  - No "main" server needed
  - Data/checkpoints in /data (shared across servers)
```

**Daily workflow**:
```bash
# On any server
cd ~/projects/my-research
git pull  # Always pull first
# ... make changes ...
git add .
git commit -m "Update model architecture"
git push

# Switch to another server
ssh roselab4
cd ~/projects/my-research
git pull  # Get the changes you just pushed
# Continue working seamlessly
```

**Requirements**:
- Disciplined Git usage (commit and push frequently)
- Good branch management
- Understanding of merge conflicts

**Benefits**:
- Ultimate flexibility - work on any server
- No container coupling
- Easy to recover from any server failure

## Server Maintenance and Migration

### When Servers Go Down for Maintenance

Having a clear server organization helps during maintenance:

**Scenario**: roselab2 needs maintenance and will be offline for a week.

**With good organization**:
```bash
# You know roselab2 is a replica of roselab1
# Strategy 1: Just use roselab1 (main server is still available)
# Strategy 2: Copy roselab1 to roselab5 for extra compute
python /utilities/common-utilities.py
# Select: 2. Copy container
# Source: roselab1, Destination: roselab5

# You can safely delete roselab2 if needed to free up resources
# All code is in Git, all data is in /data (accessible from other servers)
```

**With poor organization**:
```
# Panic: "Wait, did I have important code only on roselab2?"
# Scramble: "Which server has my latest experiment code?"
# Worry: "Can I safely delete roselab2 without losing work?"
```

### Container Copying Strategy

Use the `/utilities/common-utilities.py` tool strategically:

**When to copy**:
- Creating a replica for parallel experiments
- Backing up before risky operations
- Moving to a new server due to resource needs
- Preparing for scheduled maintenance

**Container copying example**:
```bash
# Create a backup before major environment changes
python /utilities/common-utilities.py
# 1. Select: 2. Copy container
# 2. Source: roselab1, Destination: roselab5
# 3. Wait ~6 minutes for 128GB container

# Now safe to experiment on roselab1
# If something breaks, can always restore from roselab5
```

### When to Delete Containers

You should be confident deleting a container when:
- ✅ All code is committed and pushed to Git
- ✅ All important data is in `/data` (checked with `ls /data`)
- ✅ All experiment results are backed up
- ✅ You have a copy on another server (if needed)

You should hesitate if:
- ❌ Uncommitted code changes
- ❌ Environment has custom configurations not documented
- ❌ Uncertain about what data is on local storage vs `/data`

## Best Practices Summary

### Do's ✅

1. **Designate a main server** for each project (unless using Git-centric workflow)
2. **Commit to Git frequently** - at least daily, ideally after every meaningful change
3. **Document your server organization** - keep notes on which server has what
4. **Use `/data` for cross-server data** - leverage the synchronized storage
5. **Test your recovery process** - occasionally try restoring from Git to verify
6. **Keep environments synchronized** - if roselab1 and roselab2 are replicas, keep them identical
7. **Communicate with the team** - let lab members know if you're monopolizing a server

### Don'ts ❌

1. **Don't randomly develop on different servers** without a clear strategy
2. **Don't forget to push code** before switching servers
3. **Don't store important code only locally** without Git backup
4. **Don't create too many branches** - keep it simple (1-2 replicas max per project)
5. **Don't monopolize all servers** if you only need one or two
6. **Don't store everything in local storage** - use `/data` for shareable/large files

## Troubleshooting Common Issues

### "I can't remember which server has my latest code"

**Prevention**: Use Git as single source of truth
```bash
# On each server, check Git status
git status
git log -1  # See last commit

# If uncommitted changes exist
git diff  # Review changes
git add . && git commit -m "WIP on serverX"
git push
```

**Solution**: Make it a habit to push every time you finish a work session

### "My servers have diverged and I have different code on each"

**Solution**:
```bash
# On each server, commit local changes
git add .
git commit -m "Changes from roselab1"
git push

# If conflicts occur when pushing from second server
git pull --rebase
# Resolve conflicts
git push

# Or merge locally
git pull
# Resolve conflicts
git push
```

### "Server X is down and I need my code"

**If you used Git**:
```bash
# On any other server
git clone <your-repo-url>
cd <repo-name>
# Back in business
```

**If you didn't use Git**:
- Contact admin to see if container backup is available
- Lesson learned: Always use Git

### "I'm not sure if I can safely delete a container"

**Checklist before deletion**:
```bash
# 1. Check Git status
git status  # Should show "working tree clean"
git log -1  # Verify recent commits are pushed

# 2. Check local data
du -sh /home/ubuntu/*  # What's stored locally?
ls -lh /data  # Is everything important in /data?

# 3. Check running processes
ps aux  # Any long-running jobs?
screen -ls  # Any screen sessions?
tmux ls  # Any tmux sessions?

# 4. Document environment if custom
conda env export > /data/environment.yml
pip freeze > /data/requirements.txt
```

## Example: Complete Migration Workflow

**Scenario**: Moving active development from roselab1 to roselab4 due to GPU needs

```bash
# === On roselab1 (source) ===

# 1. Ensure all code is in Git
git status
git add .
git commit -m "Checkpoint before migration"
git push

# 2. Save important results to /data
cp -r ~/experiments/results /data/project_results/
cp -r ~/models/checkpoints /data/checkpoints/

# 3. Document environment
conda env export > /data/envs/project_env.yml

# === Use common-utilities.py ===
python /utilities/common-utilities.py
# Select: 2. Copy container
# From: roselab1 → To: roselab4
# Wait ~6 minutes

# === On roselab4 (destination) ===

# 1. Verify everything copied correctly
ls /home/ubuntu/
ls /data/  # /data should be accessible

# 2. Update Git (get any changes made during migration)
cd ~/projects/my-research
git pull

# 3. Verify environment
conda activate myenv
python -c "import torch; print(torch.cuda.is_available())"

# 4. Continue working
# All set! Can now use roselab4's L40S GPUs
```

## Tools and Commands Reference

### Git Quick Reference
```bash
# Daily workflow
git pull                    # Start of day
git add .                   # Stage changes
git commit -m "message"     # Commit
git push                    # Share with other servers

# Check status
git status                  # What's changed?
git log --oneline -5        # Recent commits
git diff                    # What changed since last commit?

# Branch management (if using)
git branch                  # List branches
git checkout -b exp-v2      # Create experiment branch
git merge exp-v2            # Merge experiment back
```

### Container Management
```bash
# Copy containers between servers
python /utilities/common-utilities.py
# Option 2: Copy container

# Check container resources
lscpu                       # CPU allocation
nvidia-smi                  # GPU allocation
df -h                       # Storage usage
```

### Storage Management
```bash
# Check where your data is
du -sh /home/ubuntu/*       # Local storage usage
du -sh /data/*              # Network storage usage

# Find large files
find /home/ubuntu -type f -size +1G

# Clean up
conda clean --all
pip cache purge
```

## Additional Resources

- [Moving between Machines](./cluster) - Container migration details
- [Data Management](./data-management) - Storage best practices
- [Getting Started](./index) - Basic setup
- [Troubleshooting](./troubleshooting) - Common issues
