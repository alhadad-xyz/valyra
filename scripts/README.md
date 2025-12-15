# ABI Sync Scripts

This directory contains scripts for synchronizing smart contract ABIs across the Valyra monorepo.

## 📋 Overview

The ABI sync process ensures that the backend application always has access to the latest compiled smart contract ABIs. This is critical for the backend to interact with deployed contracts correctly.

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│  packages/contracts/deployment/abi/                         │
│  ├── Escrow.json                                            │
│  ├── Marketplace.json                                       │
│  └── ... (other contract ABIs)                              │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │  sync_abis.py
                 │  • Validates JSON
                 │  • Copies files
                 │  • Reports status
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  apps/backend/app/abi/                                      │
│  ├── Escrow.json                                            │
│  ├── Marketplace.json                                       │
│  └── ... (synced ABIs)                                      │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 When ABIs Are Synced

ABIs are automatically synchronized in the following scenarios:

### 1. **After Contract Build** (Automatic)
When you build the contracts package, ABIs are automatically synced:
```bash
cd packages/contracts
pnpm build
# ABIs are automatically synced via postbuild hook
```

### 2. **Pre-commit Hook** (Automatic)
When you commit changes to contract files, ABIs are synced before the commit:
```bash
git add packages/contracts/
git commit -m "update contracts"
# Pre-commit hook runs sync automatically
```

### 3. **CI/CD Pipeline** (Automatic)
GitHub Actions runs the sync script when:
- Pushing to `main` or `develop` branches
- Opening/updating PRs that modify `packages/contracts/`
- Manual workflow dispatch

### 4. **Manual Execution** (On-demand)
You can manually run the sync script anytime:
```bash
# From project root
pnpm sync-abis

# Or directly with Python
python3 scripts/sync_abis.py
```

## 📝 Script Details

### `sync_abis.py`

**Purpose**: Synchronizes contract ABI JSON files from the contracts package to the backend application.

**Features**:
- ✅ Validates JSON syntax before copying
- ✅ Idempotent (safe to run multiple times)
- ✅ Colored terminal output for easy reading
- ✅ Detailed error reporting
- ✅ Automatic project root detection

**Source**: `packages/contracts/deployment/abi/*.json`  
**Destination**: `apps/backend/app/abi/`

**Exit Codes**:
- `0`: Success (all files synced)
- `1`: Error (validation failed or copy failed)

## 🛠️ Troubleshooting

### Issue: "Source directory not found"

**Cause**: Contract ABIs haven't been generated yet.

**Solution**: Build the contracts first:
```bash
cd packages/contracts
pnpm build
```

### Issue: "Invalid JSON" error

**Cause**: One or more ABI files contain malformed JSON.

**Solution**: 
1. Check the error message for the specific file
2. Validate the JSON using a tool like `jq`:
   ```bash
   jq . packages/contracts/deployment/abi/YourContract.json
   ```
3. Fix the JSON syntax and re-run the sync

### Issue: "No JSON files found"

**Cause**: This is expected if contracts haven't been deployed yet.

**Solution**: This is not an error. The script will exit with code 0. Deploy contracts to generate ABIs.

### Issue: Pre-commit hook is slow

**Cause**: The hook runs on every commit, even if contracts didn't change.

**Solution**: The hook uses `lint-staged` to only run when contract files change. If it's still too slow, you can skip the hook for a specific commit:
```bash
git commit --no-verify -m "your message"
```

### Issue: CI/CD workflow fails

**Cause**: Multiple possible reasons (missing dependencies, permission issues, etc.)

**Solution**:
1. Check the GitHub Actions logs for specific errors
2. Ensure the workflow has write permissions to commit changes
3. Verify Python 3.x is available in the CI environment

## 📂 Directory Structure

```
valyra/
├── packages/
│   └── contracts/
│       └── deployment/
│           └── abi/              # Source: Compiled contract ABIs
│               ├── Escrow.json
│               └── Marketplace.json
├── apps/
│   └── backend/
│       └── app/
│           └── abi/              # Destination: Synced ABIs for backend
│               ├── Escrow.json
│               └── Marketplace.json
├── scripts/
│   ├── sync_abis.py             # Main sync script
│   └── README.md                # This file
└── .github/
    └── workflows/
        └── sync-abis.yml        # CI/CD workflow
```

## 🔧 Configuration

### Modifying Source/Destination Paths

If you need to change where ABIs are synced from/to, edit `scripts/sync_abis.py`:

```python
# Line 82-83
source_dir = project_root / 'packages' / 'contracts' / 'deployment' / 'abi'
dest_dir = project_root / 'apps' / 'backend' / 'app' / 'abi'
```

### Disabling Auto-sync

To disable automatic syncing:

1. **Disable pre-commit hook**: Remove `.husky/pre-commit`
2. **Disable build hook**: Remove `postbuild` from `packages/contracts/package.json`
3. **Disable CI/CD**: Delete `.github/workflows/sync-abis.yml`

## 📚 Related Documentation

- [Technical Design Document](../docs/tdd.md) - Smart contract architecture
- [Product Requirements](../docs/prd.md) - Overall product specification
- [GitHub Issue #71](https://github.com/alhadad-xyz/valyra/issues/71) - Original implementation issue

## 🤝 Contributing

When modifying the sync script:

1. Ensure backward compatibility
2. Update this README if behavior changes
3. Test all sync scenarios (manual, build, pre-commit, CI/CD)
4. Maintain colored output for better UX

## ❓ Questions?

If you encounter issues not covered here, please:
1. Check the [GitHub Issues](https://github.com/alhadad-xyz/valyra/issues)
2. Review the script source code for inline documentation
3. Open a new issue with detailed error logs
