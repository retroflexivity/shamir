#!/usr/bin/env node

/**
 * Incremental deployment script that only syncs changed files
 * Compares local files with remote files using checksums
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DEPLOY_HOST = process.env.DEPLOY_HOST;
const DEPLOY_USER = process.env.DEPLOY_USER;
const DEPLOY_SSH_KEY = process.env.DEPLOY_SSH_KEY;
const DEPLOY_PORT = process.env.DEPLOY_PORT || '22';
const DEPLOY_REMOTE_PATH = process.env.DEPLOY_REMOTE_PATH;
const DIST_DIR = process.env.DIST_DIR || 'dist';

if (!DEPLOY_HOST || !DEPLOY_USER || !DEPLOY_SSH_KEY || !DEPLOY_REMOTE_PATH) {
  console.error('Missing required environment variables');
  process.exit(1);
}

// Write SSH key to temporary file
// GitHub secrets may have issues with newlines, so we ensure proper formatting
const sshKeyPath = path.join(__dirname, '.deploy_key');

// Normalize the SSH key: trim whitespace, normalize line endings, ensure trailing newline
let formattedKey = DEPLOY_SSH_KEY.trim();
// Replace Windows line endings with Unix line endings
formattedKey = formattedKey.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
// Ensure the key ends with a newline (required for SSH)
if (!formattedKey.endsWith('\n')) {
  formattedKey += '\n';
}

// Write the key file with proper permissions
fs.writeFileSync(sshKeyPath, formattedKey, { mode: 0o600, encoding: 'utf8' });

// Verify the key file was written correctly
if (!fs.existsSync(sshKeyPath)) {
  console.error('Failed to create SSH key file');
  process.exit(1);
}

// Verify file permissions (should be 600)
const stats = fs.statSync(sshKeyPath);
const mode = stats.mode & parseInt('777', 8);
if (mode !== 0o600) {
  // Try to fix permissions
  fs.chmodSync(sshKeyPath, 0o600);
}

// Clean up on exit
process.on('exit', () => {
  try {
    if (fs.existsSync(sshKeyPath)) {
      fs.unlinkSync(sshKeyPath);
    }
  } catch (error) {
    // Ignore cleanup errors
  }
});

// Escape shell arguments for use in single-quoted strings
function shellEscape(arg) {
  // Replace single quotes with '\'' and wrap in single quotes
  return "'" + arg.replace(/'/g, "'\\''") + "'";
}

// SSH key path should be safe, but escape it just in case
const escapedSshKeyPath = sshKeyPath.replace(/'/g, "'\\''");
const sshOptions = `-i '${escapedSshKeyPath}' -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -p ${DEPLOY_PORT}`;
const sshCmd = (command) => {
  // Use single quotes for the command and escape any single quotes in it
  const escapedCommand = command.replace(/'/g, "'\\''");
  return `ssh ${sshOptions} ${DEPLOY_USER}@${DEPLOY_HOST} '${escapedCommand}'`;
};
const scpCmd = (source, target) => {
  const escapedSource = source.replace(/'/g, "'\\''");
  const escapedTarget = target.replace(/'/g, "'\\''");
  return `scp ${sshOptions} '${escapedSource}' ${DEPLOY_USER}@${DEPLOY_HOST}:'${escapedTarget}'`;
};

// Calculate MD5 checksum of a file
function getFileChecksum(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('md5').update(content).digest('hex');
}

// Get all files recursively from a directory
function getAllFiles(dir, baseDir = dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(baseDir, fullPath);
    
    if (entry.isDirectory()) {
      files.push(...getAllFiles(fullPath, baseDir));
    } else {
      files.push(relativePath);
    }
  }
  
  return files;
}

// Get remote file checksums via SSH
function getRemoteFileChecksums() {
  try {
    const escapedPath = DEPLOY_REMOTE_PATH.replace(/'/g, "'\\''");
    const command = `find '${escapedPath}' -type f -exec md5sum {} \\; 2>/dev/null | sed "s|${escapedPath}/||"`;
    const output = execSync(sshCmd(command), { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'], shell: '/bin/bash' });
    
    const checksums = {};
    const lines = output.trim().split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      const match = line.match(/^([a-f0-9]{32})\s+(.+)$/);
      if (match) {
        const [, checksum, filePath] = match;
        checksums[filePath] = checksum;
      }
    }
    
    return checksums;
  } catch (error) {
    // If directory doesn't exist or is empty, return empty object
    return {};
  }
}

// Test SSH connection
function testSSHConnection() {
  try {
    const command = sshCmd('echo "SSH connection test successful"');
    execSync(command, { stdio: 'pipe', shell: '/bin/bash', timeout: 10000 });
    return true;
  } catch (error) {
    console.error('SSH connection test failed:', error.message);
    if (error.stderr) {
      const stderr = error.stderr.toString();
      console.error('SSH error output:', stderr);
      if (stderr.includes('Load key')) {
        console.error('\nThe SSH key file appears to be invalid or corrupted.');
        console.error('Please verify that DEPLOY_SSH_KEY secret contains the complete private key.');
        console.error('The key should start with "-----BEGIN" and end with "-----END".');
      }
      if (stderr.includes('Permission denied')) {
        console.error('\nSSH authentication failed. Please verify:');
        console.error('1. The SSH key is correct and matches the server');
        console.error('2. The user has permission to access the server');
        console.error('3. The key is not encrypted with a passphrase');
      }
    }
    return false;
  }
}

// Ensure remote directory exists
function ensureRemoteDirectory() {
  try {
    const escapedPath = DEPLOY_REMOTE_PATH.replace(/'/g, "'\\''");
    const command = sshCmd(`mkdir -p '${escapedPath}'`);
    execSync(command, { stdio: 'pipe', shell: '/bin/bash' });
  } catch (error) {
    console.error('Failed to create remote directory:', error.message);
    const escapedPath = DEPLOY_REMOTE_PATH.replace(/'/g, "'\\''");
    const command = sshCmd(`mkdir -p '${escapedPath}'`);
    console.error('Command was:', command);
    if (error.stdout) console.error('stdout:', error.stdout.toString());
    if (error.stderr) console.error('stderr:', error.stderr.toString());
    process.exit(1);
  }
}

// Upload a single file
function uploadFile(localPath, remotePath) {
  const remoteDir = path.dirname(remotePath);
  const remoteFullPath = path.join(DEPLOY_REMOTE_PATH, remotePath);
  
  // Ensure remote directory exists
  if (remoteDir !== '.') {
    try {
      const dirPath = path.join(DEPLOY_REMOTE_PATH, remoteDir);
      const escapedPath = dirPath.replace(/'/g, "'\\''");
      execSync(sshCmd(`mkdir -p '${escapedPath}'`), { stdio: 'pipe', shell: '/bin/bash' });
    } catch (error) {
      console.error(`Failed to create remote directory for ${remotePath}:`, error.message);
      return false;
    }
  }
  
  try {
    execSync(scpCmd(localPath, remoteFullPath), { stdio: 'pipe', shell: '/bin/bash' });
    return true;
  } catch (error) {
    console.error(`Failed to upload ${remotePath}:`, error.message);
    return false;
  }
}

// Delete a remote file
function deleteRemoteFile(remotePath) {
  const remoteFullPath = path.join(DEPLOY_REMOTE_PATH, remotePath);
  try {
    const escapedPath = remoteFullPath.replace(/'/g, "'\\''");
    execSync(sshCmd(`rm -f '${escapedPath}'`), { stdio: 'pipe', shell: '/bin/bash' });
    return true;
  } catch (error) {
    console.error(`Failed to delete ${remotePath}:`, error.message);
    return false;
  }
}

// Main deployment logic
async function main() {
  console.log('Starting incremental deployment...');
  
  if (!fs.existsSync(DIST_DIR)) {
    console.error(`Directory ${DIST_DIR} does not exist`);
    process.exit(1);
  }
  
  // Test SSH connection first
  console.log('Testing SSH connection...');
  if (!testSSHConnection()) {
    console.error('SSH connection test failed. Aborting deployment.');
    process.exit(1);
  }
  console.log('SSH connection successful!\n');
  
  ensureRemoteDirectory();
  
  // Get local files and their checksums
  console.log('Scanning local files...');
  const localFiles = getAllFiles(DIST_DIR);
  const localChecksums = {};
  
  for (const file of localFiles) {
    const fullPath = path.join(DIST_DIR, file);
    localChecksums[file] = getFileChecksum(fullPath);
  }
  
  console.log(`Found ${localFiles.length} local files`);
  
  // Get remote file checksums
  console.log('Fetching remote file checksums...');
  const remoteChecksums = getRemoteFileChecksums();
  console.log(`Found ${Object.keys(remoteChecksums).length} remote files`);
  
  // Determine what needs to be uploaded, updated, or deleted
  const toUpload = [];
  const toUpdate = [];
  const toDelete = [];
  
  // Check local files
  for (const file of localFiles) {
    const localChecksum = localChecksums[file];
    const remoteChecksum = remoteChecksums[file];
    
    if (!remoteChecksum) {
      toUpload.push(file);
    } else if (localChecksum !== remoteChecksum) {
      toUpdate.push(file);
    }
  }
  
  // Check for files that need to be deleted
  for (const remoteFile of Object.keys(remoteChecksums)) {
    if (!localChecksums[remoteFile]) {
      toDelete.push(remoteFile);
    }
  }
  
  console.log(`\nFiles to upload: ${toUpload.length}`);
  console.log(`Files to update: ${toUpdate.length}`);
  console.log(`Files to delete: ${toDelete.length}`);
  
  if (toUpload.length === 0 && toUpdate.length === 0 && toDelete.length === 0) {
    console.log('\nNo changes detected. Deployment skipped.');
    return;
  }
  
  // Upload new files
  if (toUpload.length > 0) {
    console.log(`\nUploading ${toUpload.length} new files...`);
    for (const file of toUpload) {
      const localPath = path.join(DIST_DIR, file);
      if (uploadFile(localPath, file)) {
        console.log(`  ✓ ${file}`);
      }
    }
  }
  
  // Update changed files
  if (toUpdate.length > 0) {
    console.log(`\nUpdating ${toUpdate.length} changed files...`);
    for (const file of toUpdate) {
      const localPath = path.join(DIST_DIR, file);
      if (uploadFile(localPath, file)) {
        console.log(`  ✓ ${file}`);
      }
    }
  }
  
  // Delete removed files
  if (toDelete.length > 0) {
    console.log(`\nDeleting ${toDelete.length} removed files...`);
    for (const file of toDelete) {
      if (deleteRemoteFile(file)) {
        console.log(`  ✓ ${file}`);
      }
    }
  }
  
  // Clean up empty directories on remote
  console.log('\nCleaning up empty directories...');
  try {
    const escapedPath = DEPLOY_REMOTE_PATH.replace(/'/g, "'\\''");
    execSync(sshCmd(`find '${escapedPath}' -type d -empty -delete 2>/dev/null || true`), { stdio: 'pipe', shell: '/bin/bash' });
  } catch (error) {
    // Ignore errors
  }
  
  console.log('\nDeployment completed successfully!');
}

main().catch(error => {
  console.error('Deployment failed:', error);
  process.exit(1);
});
