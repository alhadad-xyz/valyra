import { FC, useState } from 'react';
import { Button, Input, Badge } from 'ui';
import { useSellStore } from '../../stores/useSellStore';

export const StepTech: FC = () => {
    const {

        techStack, setField,
        customerCount, repoUrl
    } = useSellStore();

    const [newTag, setNewTag] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verified' | 'failed'>('idle');
    const [verificationMsg, setVerificationMsg] = useState('');

    const handleAddTag = () => {
        if (newTag.trim() && !techStack.includes(newTag.trim())) {
            setField('techStack', [...techStack, newTag.trim()]);
            setNewTag('');
        }
    };

    const handleVerifyRepo = async () => {
        if (!repoUrl) return;
        setIsVerifying(true);
        setVerificationStatus('idle');
        setVerificationMsg('');

        try {
            const response = await fetch('http://localhost:8000/api/v1/verification/verify-repo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ repo_url: repoUrl })
            });
            const data = await response.json();

            if (response.ok && data.is_verified) {
                setVerificationStatus('verified');
                setVerificationMsg('Repository verified via GitHub API.');
            } else {
                setVerificationStatus('failed');
                setVerificationMsg(data.message || 'Verification failed. Make sure the repo is public.');
            }
        } catch (error) {
            setVerificationStatus('failed');
            setVerificationMsg('Network error connecting to verification service.');
        } finally {
            setIsVerifying(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag();
        }
    };

    const removeTag = (tagToRemove: string) => {
        setField('techStack', techStack.filter(tag => tag !== tagToRemove));
    };

    // Pre-defined popular stacks for quick adding
    const popularStacks = ["React", "Next.js", "Python", "Node.js", "PostgreSQL", "Solidity", "AWS", "Vercel"];

    const addPopular = (tag: string) => {
        if (!techStack.includes(tag)) {
            setField('techStack', [...techStack, tag]);
        }
    };

    return (
        <div className="bg-white dark:bg-background-dark-elevated rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 relative overflow-hidden">
            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[24px]">code</span>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-text-main dark:text-white">Technology & Stats</h3>
                        <p className="text-text-muted text-sm">Details about your tech stack and user base.</p>
                    </div>
                </div>



                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 mb-6 space-y-6">
                    {/* GitHub Repo */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-text-main dark:text-white block">
                            GitHub Repository
                        </label>
                        <div className="flex gap-2">
                            <div className="flex-1 relative">
                                <Input
                                    placeholder="https://github.com/owner/repository"
                                    value={repoUrl || ''}
                                    onChange={(e) => setField('repoUrl', e.target.value)}
                                    className={`flex-1 ${verificationStatus === 'verified' ? 'border-green-500 focus:ring-green-500' : ''}`}
                                />
                                {verificationStatus === 'verified' && (
                                    <span className="material-symbols-outlined absolute right-3 top-2.5 text-green-500">check_circle</span>
                                )}
                            </div>
                            <Button
                                variant="secondary"
                                onClick={handleVerifyRepo}
                                loading={isVerifying}
                                disabled={isVerifying || !repoUrl}
                            >
                                Verify
                            </Button>
                        </div>
                        {verificationStatus === 'verified' && (
                            <p className="text-xs text-green-600 font-bold flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">verified</span>
                                {verificationMsg}
                            </p>
                        )}
                        {verificationStatus === 'failed' && (
                            <p className="text-xs text-red-500 flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">error</span>
                                {verificationMsg}
                            </p>
                        )}
                        <p className="text-xs text-text-muted">
                            Provide the URL to your project's public repository for asset verification.
                        </p>
                    </div>

                    {/* Tech Stack Input */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-text-main dark:text-white block">
                            Tech Stack
                        </label>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Add technology (e.g. React, Python)"
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="flex-1"
                            />
                            <Button onClick={handleAddTag} variant="secondary">Add</Button>
                        </div>

                        {/* Active Tags */}
                        {techStack.length > 0 && (
                            <div className="flex flex-wrap gap-2 min-h-[40px] p-4 bg-white dark:bg-background-dark border border-gray-200 dark:border-gray-700 rounded-lg">
                                {techStack.map(tag => (
                                    <Badge
                                        key={tag}
                                        variant="neutral"
                                        size="lg"
                                        onRemove={() => removeTag(tag)}
                                        className="border-gray-200 dark:border-gray-700"
                                    >
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        )}
                        {techStack.length === 0 && (
                            <div className="p-4 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-center">
                                <span className="text-sm text-text-muted italic">No technologies added yet. Type above and press Add.</span>
                            </div>
                        )}

                        {/* Popular Suggestions */}
                        <div>
                            <span className="text-xs text-text-muted font-bold uppercase tracking-wider mb-2 block">Popular</span>
                            <div className="flex flex-wrap gap-2">
                                {popularStacks.map(tag => (
                                    <button
                                        key={tag}
                                        onClick={() => addPopular(tag)}
                                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${techStack.includes(tag)
                                            ? 'bg-primary/10 border-primary text-primary cursor-default'
                                            : 'bg-white dark:bg-background-dark border-gray-200 dark:border-gray-700 text-text-muted hover:border-primary hover:text-primary'
                                            }`}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Customer Count */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-text-main dark:text-white block">
                            Customer/User Count
                        </label>
                        <Input
                            type="number"
                            placeholder="e.g. 1500"
                            value={customerCount}
                            onChange={(e) => setField('customerCount', e.target.value)}
                            helperText="Total number of registered users or customers."
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
