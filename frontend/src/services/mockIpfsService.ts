// Mock IPFS service for local testing without external dependencies
import { FileUploadResult, UploadProgress } from './ipfsService';

// Simple hash function to generate mock CIDs that mimic real IPFS CIDv0 format
const generateMockCID = (file: File): string => {
  const timestamp = Date.now().toString();
  const fileName = file.name.replace(/[^a-zA-Z0-9]/g, '');
  const size = file.size.toString();
  
  // Generate a hash and ensure it only contains valid base58 characters for IPFS
  let hash = btoa(timestamp + fileName + size)
    .replace(/[^a-zA-Z0-9]/g, '')
    .replace(/[0OIl]/g, ''); // Remove characters not in base58 alphabet
  
  // Pad with valid base58 characters if needed
  const base58chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  while (hash.length < 44) {
    hash += base58chars[Math.floor(Math.random() * base58chars.length)];
  }
  
  // Ensure exactly 44 characters after Qm prefix (total 46)
  return `Qm${hash.substring(0, 44)}`;
};

// Mock delay to simulate upload time
const simulateUploadDelay = (_file: File, onProgress?: (progress: number) => void): Promise<void> => {
  return new Promise((resolve) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 20;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        onProgress?.(100);
        setTimeout(resolve, 100);
      } else {
        onProgress?.(progress);
      }
    }, 200);
  });
};

/**
 * Mock version of uploadFileToIPFS for local testing
 */
export const mockUploadFileToIPFS = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<FileUploadResult> => {
  console.log('📁 Mock IPFS: Starting upload for', file.name);
  
  // Simulate upload progress
  await simulateUploadDelay(file, onProgress);
  
  const mockCID = generateMockCID(file);
  
  console.log('✅ Mock IPFS: Upload completed for', file.name, 'CID:', mockCID);
  
  return {
    cid: mockCID,
    filename: file.name,
    size: file.size,
    url: `https://ipfs.io/ipfs/${mockCID}`
  };
};

/**
 * Mock version of uploadFilesToIPFS for local testing
 */
export const mockUploadFilesToIPFS = async (
  files: File[],
  onProgress?: (fileProgress: UploadProgress[]) => void
): Promise<FileUploadResult[]> => {
  console.log('📁 Mock IPFS: Starting batch upload for', files.length, 'files');
  
  const results: FileUploadResult[] = [];
  const progressTracker: UploadProgress[] = files.map(file => ({
    filename: file.name,
    progress: 0,
    status: 'pending' as const
  }));

  const updateProgress = (index: number, progress: number, status: UploadProgress['status'], error?: string) => {
    progressTracker[index] = {
      filename: files[index].name,
      progress,
      status,
      error
    };
    onProgress?.(progressTracker);
  };

  // Upload files sequentially for better progress tracking in mock
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    try {
      updateProgress(i, 0, 'uploading');
      
      const result = await mockUploadFileToIPFS(file, (progress) => {
        updateProgress(i, progress, 'uploading');
      });
      
      results[i] = result;
      updateProgress(i, 100, 'completed');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      updateProgress(i, 0, 'error', errorMessage);
      throw error;
    }
  }

  console.log('✅ Mock IPFS: Batch upload completed for', results.length, 'files');
  return results;
};

/**
 * Mock version of uploadFileArchive for local testing
 */
export const mockUploadFileArchive = async (
  files: File[],
  archiveName: string = 'documents',
  onProgress?: (progress: number) => void
): Promise<FileUploadResult> => {
  console.log('📁 Mock IPFS: Creating archive', archiveName, 'with', files.length, 'files');
  
  onProgress?.(10);
  
  // Simulate archive creation time
  await new Promise(resolve => setTimeout(resolve, 500));
  onProgress?.(50);
  
  // Simulate upload time based on total file size
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  const uploadTime = Math.min(2000, totalSize / 1000); // Max 2 seconds
  
  await new Promise(resolve => setTimeout(resolve, uploadTime));
  onProgress?.(90);
  
  // Generate mock directory CID with proper base58 encoding
  const timestamp = Date.now().toString();
  const fileList = files.map(f => f.name).join('');
  
  let hash = btoa(timestamp + archiveName + fileList)
    .replace(/[^a-zA-Z0-9]/g, '')
    .replace(/[0OIl]/g, ''); // Remove characters not in base58 alphabet
  
  // Pad with valid base58 characters if needed
  const base58chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  while (hash.length < 44) {
    hash += base58chars[Math.floor(Math.random() * base58chars.length)];
  }
  
  const mockDirectoryCID = `Qm${hash.substring(0, 44)}`;
  
  onProgress?.(100);
  
  console.log('✅ Mock IPFS: Archive created successfully, CID:', mockDirectoryCID);
  
  return {
    cid: mockDirectoryCID,
    filename: `${archiveName}.tar`,
    size: totalSize,
    url: `https://ipfs.io/ipfs/${mockDirectoryCID}`
  };
};

/**
 * Check if we should use mock IPFS (when no credentials are configured)
 */
export const shouldUseMockIPFS = (): boolean => {
  const hasCredentials = import.meta.env.VITE_IPFS_PROJECT_ID && 
                        import.meta.env.VITE_IPFS_PROJECT_SECRET;
  const isLocal = import.meta.env.VITE_ENVIRONMENT === 'local';
  
  return isLocal || !hasCredentials;
};