import { FC, useState } from 'react';
import { Input, Button } from 'ui';
import { toast } from 'sonner';
import { useSellStore, AssetType } from '../../stores/useSellStore';

export const StepBasicInfo: FC = () => {
    const { title, description, websiteUrl, assetType, includeDomain, includeCode, includeCustomerData, images, setField } = useSellStore();
    const [isUploading, setIsUploading] = useState(false);

    return (
        <div className="bg-white dark:bg-background-dark-elevated rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 relative overflow-hidden">
            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6 justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-[24px]">description</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-text-main dark:text-white">Project Details</h3>
                            <p className="text-text-muted text-sm">Provide the core information about your asset.</p>
                        </div>
                    </div>

                </div>



                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 mb-6 space-y-6">


                    {/* Image Gallery */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-text-main dark:text-white">Project Images</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {/* Existing Images */}
                            {images.map((img, idx) => (
                                <div key={idx} className="relative aspect-video rounded-lg overflow-hidden group border border-gray-200 dark:border-gray-700">
                                    <img src={img} alt={`Project ${idx}`} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button
                                            onClick={() => {
                                                const newImages = images.filter((_, i) => i !== idx);
                                                setField('images', newImages);
                                            }}
                                            className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">delete</span>
                                        </button>
                                    </div>
                                    {idx === 0 && (
                                        <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur rounded text-[10px] font-bold text-white uppercase">
                                            Cover
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Upload Button */}
                            <label className="aspect-video rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-primary dark:hover:border-primary hover:bg-white dark:hover:bg-gray-800 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    className="hidden"
                                    onChange={async (e) => {
                                        if (!e.target.files?.length) return;
                                        setIsUploading(true);

                                        try {
                                            const newImages = [...images];

                                            // Process all files
                                            for (let i = 0; i < e.target.files.length; i++) {
                                                const file = e.target.files[i];

                                                // Client-side validation
                                                if (file.size > 10 * 1024 * 1024) {
                                                    toast.error(`File size limit exceeded: ${file.name} (Max 10MB).`);
                                                    continue;
                                                }

                                                const formData = new FormData();
                                                formData.append('file', file);

                                                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/upload/`, {
                                                    method: 'POST',
                                                    body: formData,
                                                });

                                                if (!response.ok) throw new Error('Upload failed');

                                                const data = await response.json();
                                                // If backend returns .url, use it. If it returns IPFS gateway URL, verify it works.
                                                // The backend matches return { url: ... }
                                                newImages.push(data.url);
                                            }

                                            setField('images', newImages);
                                            toast.success('Images successfully uploaded.');
                                        } catch (err) {
                                            console.error(err);
                                            toast.error('Unable to upload one or more images.');
                                        } finally {
                                            setIsUploading(false);
                                            // Reset input
                                            e.target.value = '';
                                        }
                                    }}
                                />
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                    {isUploading ? (
                                        <span className="material-symbols-outlined text-[24px] animate-spin">progress_activity</span>
                                    ) : (
                                        <span className="material-symbols-outlined text-[24px]">add_photo_alternate</span>
                                    )}
                                </div>
                                <span className="text-xs font-medium text-text-muted group-hover:text-primary transition-colors">
                                    {isUploading ? 'Uploading...' : 'Add Images'}
                                </span>
                            </label>
                        </div>
                        <p className="text-xs text-text-muted">
                            Recommended: 1920x1080px (16:9). Max 10MB per image. First image will be the cover.
                        </p>
                    </div>

                    {/* Title & URL */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-text-main dark:text-white">Project Title</label>
                            <Input
                                placeholder="e.g. AI Content Generator SaaS"
                                value={title}
                                onChange={(e) => setField('title', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-text-main dark:text-white">Website URL</label>
                            <Input
                                placeholder="https://valyra.xyz"
                                value={websiteUrl}
                                onChange={(e) => setField('websiteUrl', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Asset Type */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-text-main dark:text-white">Business Model</label>
                        <div className="relative">
                            <select
                                className="w-full h-10 px-3 rounded-md border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-background-dark dark:border-gray-700 dark:text-white appearance-none pr-10"
                                value={assetType}
                                onChange={(e) => setField('assetType', e.target.value as AssetType)}
                            >
                                <option value="saas">SaaS (Software as a Service)</option>
                                <option value="ecommerce">E-commerce</option>
                                <option value="content">Content / Media</option>
                                <option value="community">Community / Membership</option>
                                <option value="other">Other</option>
                            </select>
                            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 text-[20px]">expand_more</span>
                        </div>
                    </div>

                    {/* Included Assets */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-text-main dark:text-white">Assets Included in Sale</label>
                        <div className="flex flex-wrap gap-4">
                            <label className="flex items-center gap-2 cursor-pointer bg-white dark:bg-background-dark px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary transition-colors">
                                <input
                                    type="checkbox"
                                    checked={includeDomain}
                                    onChange={(e) => setField('includeDomain', e.target.checked)}
                                    className="rounded text-primary focus:ring-primary"
                                />
                                <span className="text-sm font-medium">Domain Name</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer bg-white dark:bg-background-dark px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary transition-colors">
                                <input
                                    type="checkbox"
                                    checked={includeCode}
                                    onChange={(e) => setField('includeCode', e.target.checked)}
                                    className="rounded text-primary focus:ring-primary"
                                />
                                <span className="text-sm font-medium">Source Code & IP</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer bg-white dark:bg-background-dark px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary transition-colors">
                                <input
                                    type="checkbox"
                                    checked={includeCustomerData}
                                    onChange={(e) => setField('includeCustomerData', e.target.checked)}
                                    className="rounded text-primary focus:ring-primary"
                                />
                                <span className="text-sm font-medium">User/Customer Data</span>
                            </label>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-text-main dark:text-white">Project Description</label>
                        <textarea
                            className="w-full min-h-[150px] rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            placeholder="Provide a detailed overview of your business, key features, technology stack, and growth opportunities..."
                            value={description}
                            onChange={(e) => setField('description', e.target.value)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
