import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UseFormRegister, FieldError, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { CreateListingFormData } from '../../lib/validationSchemas';
import { 
  validateFiles, 
  formatFileSize, 
  getFilePreviewUrl, 
  uploadFilesToIPFS,
  UploadProgress 
} from '../../services/ipfsService';

interface FileUploadProps {
  name: keyof CreateListingFormData;
  label: string;
  register: UseFormRegister<CreateListingFormData>;
  setValue: UseFormSetValue<CreateListingFormData>;
  watch: UseFormWatch<CreateListingFormData>;
  error?: FieldError;
  helperText?: string;
  required?: boolean;
  maxFiles?: number;
}

interface FileWithPreview {
  file: File;
  previewUrl?: string | null;
  ipfsCid?: string;
  uploadStatus?: 'pending' | 'uploading' | 'completed' | 'error';
  uploadProgress?: number;
  uploadError?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  name,
  label,
  register,
  setValue,
  watch,
  error,
  helperText,
  required = false,
  maxFiles = 20,
}) => {
  const currentFiles = (watch(name) as File[]) || [];
  const [filesWithPreview, setFilesWithPreview] = useState<FileWithPreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      console.warn('Some files were rejected:', rejectedFiles);
    }

    // Validate files
    const validation = validateFiles([...currentFiles, ...acceptedFiles]);
    if (!validation.valid) {
      alert(validation.errors.join('\n'));
      return;
    }

    // Check max files limit
    if (currentFiles.length + acceptedFiles.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Add new files
    const newFiles = [...currentFiles, ...acceptedFiles];
    setValue(name, newFiles as any);

    // Create preview objects
    const newFilesWithPreview: FileWithPreview[] = acceptedFiles.map(file => ({
      file,
      previewUrl: getFilePreviewUrl(file),
      uploadStatus: 'pending'
    }));

    setFilesWithPreview(prev => [...prev, ...newFilesWithPreview]);
  }, [currentFiles, setValue, name, maxFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'text/plain': ['.txt'],
      'text/csv': ['.csv']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true
  } as any);

  const removeFile = (index: number) => {
    const newFiles = currentFiles.filter((_, i) => i !== index);
    setValue(name, newFiles as any);

    setFilesWithPreview(prev => {
      const newPreview = prev.filter((_, i) => i !== index);
      // Clean up preview URLs
      if (prev[index]?.previewUrl) {
        URL.revokeObjectURL(prev[index].previewUrl!);
      }
      return newPreview;
    });
  };

  const uploadToIPFS = async () => {
    if (currentFiles.length === 0) return;

    setIsUploading(true);

    try {
      await uploadFilesToIPFS(currentFiles, (progressArray: UploadProgress[]) => {
        // Update progress for each file
        setFilesWithPreview(prev => prev.map((item, index) => {
          const progress = progressArray[index];
          if (progress) {
            return {
              ...item,
              uploadStatus: progress.status,
              uploadProgress: progress.progress,
              uploadError: progress.error
            };
          }
          return item;
        }));
      });

      // All files uploaded successfully
      setFilesWithPreview(prev => prev.map(item => ({
        ...item,
        uploadStatus: 'completed' as const,
        uploadProgress: 100
      })));

      alert('All files uploaded to IPFS successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word')) return '📝';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
    return '📎';
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-900">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
        <span className="float-right text-xs text-gray-500">
          {currentFiles.length}/{maxFiles} files
        </span>
      </label>

      {/* Hidden input for form registration */}
      <input
        type="hidden"
        {...register(name)}
        value={currentFiles.length}
      />

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${error ? 'border-red-300' : ''}
        `}
      >
        <input {...getInputProps() as any} />
        
        <div className="space-y-2">
          <div className="text-4xl">📁</div>
          {isDragActive ? (
            <p className="text-blue-600 font-medium">Drop files here...</p>
          ) : (
            <>
              <p className="text-gray-600">
                Drag & drop files here, or <span className="text-blue-600 font-medium">click to browse</span>
              </p>
              <p className="text-xs text-gray-500">
                Supports PDF, DOC, DOCX, XLS, XLSX, images, and text files (max 10MB each)
              </p>
            </>
          )}
        </div>
      </div>

      {/* File List */}
      {currentFiles.length > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium text-gray-900">
              Selected Files ({currentFiles.length})
            </h4>
            <button
              type="button"
              onClick={uploadToIPFS}
              disabled={isUploading || filesWithPreview.every(f => f.uploadStatus === 'completed')}
              className={`
                px-3 py-1 text-xs rounded-md font-medium
                ${isUploading || filesWithPreview.every(f => f.uploadStatus === 'completed')
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                }
              `}
            >
              {isUploading ? 'Uploading...' : 'Upload to IPFS'}
            </button>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {currentFiles.map((file, index) => {
              const fileWithPreview = filesWithPreview[index];
              const hasPreview = fileWithPreview?.previewUrl || undefined;

              return (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50"
                >
                  {/* File Icon/Preview */}
                  <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                    {hasPreview ? (
                      <img
                        src={fileWithPreview.previewUrl || ''}
                        alt={file.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      <span className="text-2xl">{getFileIcon(file.type)}</span>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>

                    {/* Upload Progress */}
                    {fileWithPreview?.uploadStatus === 'uploading' && (
                      <div className="mt-1">
                        <div className="w-full bg-gray-200 rounded-full h-1">
                          <div
                            className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                            style={{ width: `${fileWithPreview.uploadProgress || 0}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Upload Status */}
                    {fileWithPreview?.uploadStatus && (
                      <div className="mt-1">
                        {fileWithPreview.uploadStatus === 'completed' && (
                          <span className="text-xs text-green-600">✅ Uploaded</span>
                        )}
                        {fileWithPreview.uploadStatus === 'error' && (
                          <span className="text-xs text-red-600">
                            ❌ {fileWithPreview.uploadError || 'Upload failed'}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="flex-shrink-0 text-red-600 hover:text-red-800 p-1"
                    title="Remove file"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {helperText && !error && (
        <p className="text-xs text-gray-600">{helperText}</p>
      )}
      
      {error && (
        <p className="text-xs text-red-600">{error.message}</p>
      )}
    </div>
  );
};