#!/usr/bin/env python3
"""
ABI Sync Script for Valyra Monorepo

This script synchronizes contract ABI JSON files from the contracts package
to the backend application.

Source: packages/contracts/deployment/abi/*.json
Destination: apps/backend/app/abi/

Usage:
    python3 scripts/sync_abis.py
    pnpm sync-abis
"""

import json
import shutil
import sys
from pathlib import Path
from typing import List, Tuple


# Color codes for terminal output
class Colors:
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BLUE = '\033[94m'
    RESET = '\033[0m'
    BOLD = '\033[1m'


def get_project_root() -> Path:
    """
    Get the project root directory by finding the directory containing pnpm-workspace.yaml.
    This ensures the script works regardless of where it's called from.
    """
    current = Path(__file__).resolve().parent
    
    # Go up from scripts/ to project root
    while current != current.parent:
        if (current / 'pnpm-workspace.yaml').exists():
            return current
        current = current.parent
    
    raise RuntimeError("Could not find project root (pnpm-workspace.yaml not found)")


def validate_json_file(file_path: Path) -> Tuple[bool, str]:
    """
    Validate that a file contains valid JSON.
    
    Args:
        file_path: Path to the JSON file
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            json.load(f)
        return True, ""
    except json.JSONDecodeError as e:
        return False, f"Invalid JSON: {e}"
    except Exception as e:
        return False, f"Error reading file: {e}"


def sync_abis() -> int:
    """
    Main function to sync ABI files from contracts to backend.
    
    Returns:
        Exit code (0 for success, 1 for error)
    """
    try:
        # Get project root
        project_root = get_project_root()
        print(f"{Colors.BLUE}📂 Project root: {project_root}{Colors.RESET}\n")
        
        # Define source and destination paths
        source_dir = project_root / 'packages' / 'contracts' / 'deployment' / 'abi'
        dest_dir = project_root / 'apps' / 'backend' / 'app' / 'abi'
        
        # Check if source directory exists
        if not source_dir.exists():
            print(f"{Colors.RED}❌ Error: Source directory not found:{Colors.RESET}")
            print(f"   {source_dir}")
            print(f"\n{Colors.YELLOW}💡 Hint: Make sure contract ABIs have been generated.{Colors.RESET}")
            return 1
        
        # Create destination directory if it doesn't exist
        dest_dir.mkdir(parents=True, exist_ok=True)
        
        # Find all JSON files in source directory
        json_files = list(source_dir.glob('*.json'))
        
        if not json_files:
            print(f"{Colors.YELLOW}⚠️  Warning: No JSON files found in source directory:{Colors.RESET}")
            print(f"   {source_dir}")
            print(f"\n{Colors.BLUE}ℹ️  This is expected if contracts haven't been deployed yet.{Colors.RESET}")
            return 0
        
        print(f"{Colors.BOLD}🔄 Syncing ABI files...{Colors.RESET}\n")
        print(f"   Source: {source_dir.relative_to(project_root)}")
        print(f"   Destination: {dest_dir.relative_to(project_root)}\n")
        
        # Track results
        synced_files: List[str] = []
        failed_files: List[Tuple[str, str]] = []
        
        # Process each JSON file
        for source_file in json_files:
            file_name = source_file.name
            dest_file = dest_dir / file_name
            
            # Validate JSON
            is_valid, error_msg = validate_json_file(source_file)
            
            if not is_valid:
                print(f"{Colors.RED}❌ {file_name}: {error_msg}{Colors.RESET}")
                failed_files.append((file_name, error_msg))
                continue
            
            # Copy file
            try:
                shutil.copy2(source_file, dest_file)
                synced_files.append(file_name)
                print(f"{Colors.GREEN}✓ {file_name}{Colors.RESET}")
            except Exception as e:
                error_msg = f"Failed to copy: {e}"
                print(f"{Colors.RED}❌ {file_name}: {error_msg}{Colors.RESET}")
                failed_files.append((file_name, error_msg))
        
        # Print summary
        print(f"\n{Colors.BOLD}{'='*60}{Colors.RESET}")
        print(f"{Colors.BOLD}Summary:{Colors.RESET}")
        print(f"  {Colors.GREEN}✓ Synced: {len(synced_files)} file(s){Colors.RESET}")
        
        if failed_files:
            print(f"  {Colors.RED}✗ Failed: {len(failed_files)} file(s){Colors.RESET}")
            print(f"\n{Colors.RED}Failed files:{Colors.RESET}")
            for file_name, error in failed_files:
                print(f"  - {file_name}: {error}")
        
        print(f"{Colors.BOLD}{'='*60}{Colors.RESET}\n")
        
        # Return appropriate exit code
        if failed_files:
            print(f"{Colors.RED}❌ Sync completed with errors{Colors.RESET}")
            return 1
        else:
            print(f"{Colors.GREEN}✅ Sync completed successfully{Colors.RESET}")
            return 0
            
    except Exception as e:
        print(f"\n{Colors.RED}❌ Fatal error: {e}{Colors.RESET}")
        return 1


if __name__ == '__main__':
    exit_code = sync_abis()
    sys.exit(exit_code)
