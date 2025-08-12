import { create } from 'kubo-rpc-client';

// IPFS client configuration
const IPFS_GATEWAY_URL = import.meta.env.VITE_IPFS_GATEWAY || 'https://ipfs.io/ipfs/';
const IPFS_API_URL = import.meta.env.VITE_IPFS_API || 'https://ipfs.infura.io:5001/api/v0';
const IPFS_PROJECT_ID = import.meta.env.VITE_IPFS_PROJECT_ID;
const IPFS_PROJECT_SECRET = import.meta.env.VITE_IPFS_PROJECT_SECRET;

// Create IPFS client
let ipfsClient: any = null;

const getIPFSClient = () => {
  if (!ipfsClient) {
    const auth = IPFS_PROJECT_ID && IPFS_PROJECT_SECRET 
      ? `Basic ${btoa(`${IPFS_PROJECT_ID}:${IPFS_PROJECT_SECRET}`)}`
      : undefined;

    ipfsClient = create({
      url: IPFS_API_URL,
      headers: auth ? { authorization: auth } : undefined,
    });
  }
  return ipfsClient;
};

export interface FileUploadResult {
  cid: string;
  filename: string;
  size: number;
  url: string;
}

export interface UploadProgress {
  filename: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

/**
 * Uploads a single file to IPFS
 */
export const uploadFileToIPFS = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<FileUploadResult> => {
  try {
    const client = getIPFSClient();
    
    // Create file object for IPFS
    const fileData = {
      path: file.name,
      content: file
    };

    onProgress?.(10);

    // Add file to IPFS
    const result = await client.add(fileData, {
      progress: (bytes: number) => {
        const progress = Math.min(90, (bytes / file.size) * 80 + 10);
        onProgress?.(progress);
      },
      wrapWithDirectory: false,
      pin: true, // Pin the file to keep it available
    });

    onProgress?.(100);

    return {
      cid: result.cid.toString(),
      filename: file.name,
      size: file.size,
      url: `${IPFS_GATEWAY_URL}${result.cid}`
    };
  } catch (error) {
    console.error('Error uploading file to IPFS:', error);
    throw new Error(`Failed to upload ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Uploads multiple files to IPFS in parallel
 */
export const uploadFilesToIPFS = async (
  files: File[],
  onProgress?: (fileProgress: UploadProgress[]) => void
): Promise<FileUploadResult[]> => {
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

  // Upload files in parallel with concurrency limit
  const MAX_CONCURRENT = 3;
  const uploadPromises: Promise<void>[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const index = i;

    const uploadPromise = async () => {
      try {
        updateProgress(index, 0, 'uploading');
        
        const result = await uploadFileToIPFS(file, (progress) => {
          updateProgress(index, progress, 'uploading');
        });
        
        results[index] = result;
        updateProgress(index, 100, 'completed');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        updateProgress(index, 0, 'error', errorMessage);
        throw error;
      }
    };

    uploadPromises.push(uploadPromise());

    // Wait if we've reached the concurrency limit
    if (uploadPromises.length >= MAX_CONCURRENT) {
      await Promise.race(uploadPromises);
    }
  }

  // Wait for all uploads to complete
  const uploadResults = await Promise.allSettled(uploadPromises);
  
  // Check for any failures
  const failures = uploadResults
    .map((result, index) => result.status === 'rejected' ? index : -1)
    .filter(index => index !== -1);

  if (failures.length > 0) {
    const failedFiles = failures.map(index => files[index].name).join(', ');
    throw new Error(`Failed to upload files: ${failedFiles}`);
  }

  return results.filter(result => result !== undefined);
};

/**
 * Creates a compressed archive of multiple files and uploads to IPFS
 * Useful for due diligence document packages
 */
export const uploadFileArchive = async (
  files: File[],
  archiveName: string = 'documents',
  onProgress?: (progress: number) => void
): Promise<FileUploadResult> => {
  try {
    onProgress?.(10);

    // For simplicity, we'll upload files individually and return a directory CID
    // In a production environment, you might want to use JSZip to create an actual archive
    const client = getIPFSClient();
    
    const fileObjects = files.map(file => ({
      path: `${archiveName}/${file.name}`,
      content: file
    }));

    onProgress?.(30);

    const results = [];
    for await (const result of client.addAll(fileObjects, {
      progress: (bytes: number) => {
        const totalSize = files.reduce((sum, file) => sum + file.size, 0);
        const progress = Math.min(90, (bytes / totalSize) * 60 + 30);
        onProgress?.(progress);
      },
      wrapWithDirectory: true,
      pin: true,
    })) {
      results.push(result);
    }

    onProgress?.(100);

    // The last result is the directory CID
    const directoryCID = results[results.length - 1];
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);

    return {
      cid: directoryCID.cid.toString(),
      filename: `${archiveName}.tar`,
      size: totalSize,
      url: `${IPFS_GATEWAY_URL}${directoryCID.cid}`
    };
  } catch (error) {
    console.error('Error creating file archive:', error);
    throw new Error(`Failed to create archive: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Validates file type and size
 */
export const validateFile = (file: File): { valid: boolean; error?: string } => {
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'text/plain',
    'text/csv'
  ];

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File "${file.name}" is too large. Maximum size is 10MB.`
    };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `File "${file.name}" has unsupported type. Allowed types: PDF, DOC, DOCX, XLS, XLSX, images, and text files.`
    };
  }

  return { valid: true };
};

/**
 * Validates multiple files
 */
export const validateFiles = (files: File[]): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (files.length === 0) {
    return { valid: false, errors: ['Please select at least one file'] };
  }

  if (files.length > 20) {
    return { valid: false, errors: ['Maximum 20 files allowed'] };
  }

  files.forEach(file => {
    const validation = validateFile(file);
    if (!validation.valid && validation.error) {
      errors.push(validation.error);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Get file preview URL for supported file types
 */
export const getFilePreviewUrl = (file: File): string | null => {
  if (file.type.startsWith('image/')) {
    return URL.createObjectURL(file);
  }
  return null;
};

/**
 * Format file size in human readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};