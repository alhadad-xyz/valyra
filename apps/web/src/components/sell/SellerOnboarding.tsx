"use client";

import { FC, useEffect, useState } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatUnits, parseUnits } from 'viem';
import { Button } from 'ui';
import { MARKETPLACE_ABI } from '@/abis/MarketplaceV1';
import { ERC20_ABI } from '@/abis/ERC20';

const MARKETPLACE_ADDRESS = process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS as `0x${string}`;
const IDRX_ADDRESS = process.env.NEXT_PUBLIC_IDRX_TOKEN_ADDRESS as `0x${string}`;

interface SellerOnboardingProps {
    onSuccess: () => void;
}

export const SellerOnboarding: FC<SellerOnboardingProps> = ({ onSuccess }) => {
    const { address } = useAccount();
    const [step, setStep] = useState<'check' | 'approve' | 'stake'>('check');

    // 1. Read Minimum Stake Amount
    const { data: minStake } = useReadContract({
        address: MARKETPLACE_ADDRESS,
        abi: MARKETPLACE_ABI,
        functionName: 'MINIMUM_SELLER_STAKE',
    });

    // 2. Read IDRX Balance
    const { data: balance, isLoading: isBalanceLoading } = useReadContract({
        address: IDRX_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
    });

    // 3. Read Allowance
    const { data: allowance, refetch: refetchAllowance, isLoading: isAllowanceLoading } = useReadContract({
        address: IDRX_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: address ? [address, MARKETPLACE_ADDRESS] : undefined,
    });

    // Write Hooks
    const { writeContract: writeApprove, data: approveHash, isPending: isApprovePending } = useWriteContract();
    const { writeContract: writeStake, data: stakeHash, isPending: isStakePending } = useWriteContract();
    const { writeContract: writeMint, data: mintHash, isPending: isMintPending } = useWriteContract();

    // Transaction Receipts
    const { isLoading: isApproveConfirming, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({
        hash: approveHash
    });
    const { isLoading: isStakeConfirming, isSuccess: isStakeSuccess } = useWaitForTransactionReceipt({
        hash: stakeHash
    });
    const { isLoading: isMintConfirming, isSuccess: isMintSuccess } = useWaitForTransactionReceipt({
        hash: mintHash
    });

    // Effect: Handle Approve Success
    useEffect(() => {
        if (isApproveSuccess) {
            refetchAllowance();
            setStep('stake');
        }
    }, [isApproveSuccess, refetchAllowance]);

    // Effect: Handle Stake Success
    useEffect(() => {
        if (isStakeSuccess) {
            onSuccess();
        }
    }, [isStakeSuccess, onSuccess]);

    // Determine Initial Step
    useEffect(() => {
        if (allowance !== undefined && minStake !== undefined) {
            // Only set step if data is loaded
            if (allowance >= minStake) {
                setStep('stake');
            } else {
                setStep('approve');
            }
        }
    }, [allowance, minStake]);

    // Handlers
    const handleApprove = () => {
        if (!minStake) return;
        writeApprove({
            address: IDRX_ADDRESS,
            abi: ERC20_ABI,
            functionName: 'approve',
            args: [MARKETPLACE_ADDRESS, minStake],
        });
    };

    const handleStake = () => {
        writeStake({
            address: MARKETPLACE_ADDRESS,
            abi: MARKETPLACE_ABI,
            functionName: 'stakeToSell',
        });
    };

    const handleMint = () => {
        if (!address) return;
        writeMint({
            address: IDRX_ADDRESS,
            abi: [...ERC20_ABI, {
                type: 'function',
                name: 'mint',
                inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }],
                outputs: [],
                stateMutability: 'nonpayable'
            }],
            functionName: 'mint',
            args: [address, parseUnits('1000000', 18)],
        });
    };

    const isDataLoading = isBalanceLoading || isAllowanceLoading;
    const isTransacting = isApprovePending || isApproveConfirming || isStakePending || isStakeConfirming || isMintPending || isMintConfirming;

    // Don't format if loading
    const balanceValue = balance ? Number(formatUnits(balance, 18)) : 0;
    const minStakeValue = minStake ? Number(formatUnits(minStake, 18)) : 0;
    const balanceFormatted = balanceValue.toLocaleString(undefined, { maximumFractionDigits: 0 });

    // Check insufficiency only if loaded
    const hasInsufficientBalance = !isBalanceLoading && balance !== undefined && minStake !== undefined && balance < minStake;

    const isApproveCompleted = step === 'stake';

    return (
        <div className="flex flex-col items-center justify-center p-4 md:p-10 min-h-[80vh]">
            <div className="flex flex-col max-w-[640px] w-full gap-6">
                {/* Breadcrumbs */}
                <div className="flex flex-wrap items-center gap-2 px-2">
                    <span className="text-text-muted text-sm font-medium leading-normal">Seller Onboarding</span>
                    <span className="material-symbols-outlined text-text-muted text-sm">chevron_right</span>
                    <span className="text-text-main dark:text-white text-sm font-medium leading-normal">Verification</span>
                </div>

                {/* Page Heading */}
                <div className="flex flex-col gap-3 px-2">
                    <h1 className="text-text-main dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">
                        Ready to Stake
                    </h1>
                    <p className="text-text-muted text-base font-normal leading-normal">
                        Your account is approved. Complete the refundable stake to list your business on the marketplace and gain access to premium buyers.
                    </p>
                </div>

                {/* Main Onboarding Card */}
                <div className="bg-white dark:bg-background-dark-elevated rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden">

                    {/* Financial Status Block */}
                    <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-text-muted text-xs font-bold uppercase tracking-wider">Financial Status</span>
                            <span className={`flex items-center gap-1 text-sm font-semibold ${hasInsufficientBalance ? 'text-red-500' : 'text-green-500'}`}>
                                <span className="material-symbols-outlined text-sm">
                                    {hasInsufficientBalance ? 'error' : 'check_circle'}
                                </span>
                                {hasInsufficientBalance ? 'Insufficient Funds' : 'Verified'}
                            </span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <p className="text-text-muted text-sm font-medium">Your Balance</p>
                            <p className={`text-3xl font-bold leading-tight ${hasInsufficientBalance ? 'text-red-500' : 'text-green-500'}`}>
                                {isBalanceLoading ? 'Loading...' : `${balanceFormatted} IDRX`}
                            </p>
                        </div>
                        {hasInsufficientBalance && (
                            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 text-xs rounded-lg">
                                Insufficient balance. You need at least {minStakeValue.toLocaleString()} IDRX to proceed.
                                <br />
                                <span className="opacity-75">(Testnet: Use Mint button below)</span>
                            </div>
                        )}
                    </div>

                    {/* Process Timeline */}
                    <div className="p-6 space-y-6">
                        {/* Step 1: Allowance */}
                        <div className="flex items-start gap-4">
                            <div className="flex flex-col items-center">
                                <div className={`flex items-center justify-center size-8 rounded-full ${isApproveCompleted
                                    ? 'bg-green-100 text-green-600'
                                    : 'bg-primary text-white shadow-lg shadow-primary/20'
                                    }`}>
                                    <span className="material-symbols-outlined text-sm">
                                        {isApproveCompleted ? 'check' : 'lock_open'}
                                    </span>
                                </div>
                                <div className="w-px h-10 bg-gray-200 dark:bg-gray-800 my-1"></div>
                            </div>
                            <div className="flex flex-col pt-1">
                                <p className={`text-base font-bold ${isApproveCompleted ? 'text-text-main dark:text-white' : 'text-primary'}`}>
                                    Allowance Approval
                                </p>
                                <p className="text-text-muted text-sm">
                                    {isApproveCompleted
                                        ? "Smart contract permission granted."
                                        : "Allow the marketplace to access your IDRX for staking."}
                                </p>
                            </div>
                        </div>

                        {/* Step 2: Stake */}
                        <div className="flex items-start gap-4">
                            <div className={`flex items-center justify-center size-8 rounded-full ${step === 'stake'
                                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                                }`}>
                                <span className="material-symbols-outlined text-sm">verified_user</span>
                            </div>
                            <div className="flex flex-col pt-1">
                                <p className={`text-base font-bold ${step === 'stake' ? 'text-primary' : 'text-text-muted'}`}>
                                    Stake & Verify Account
                                </p>
                                <p className="text-text-muted text-sm">
                                    Stake {minStakeValue.toLocaleString()} IDRX to finalize your verification.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Block */}
                    <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800">
                        {hasInsufficientBalance ? (
                            <Button
                                onClick={handleMint}
                                disabled={isDataLoading || isTransacting}
                                loading={isMintPending || isMintConfirming}
                                leftIcon={<span className="material-symbols-outlined">monetization_on</span>}
                                variant="secondary"
                                size="xl"
                                fullWidth
                                className="border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                                {isMintPending || isMintConfirming ? 'Minting Testnet Tokens...' : 'Mint 1,000,000 Demo IDRX'}
                            </Button>
                        ) : (
                            step === 'approve' ? (
                                <Button
                                    onClick={handleApprove}
                                    disabled={isDataLoading || isTransacting}
                                    loading={isApprovePending || isApproveConfirming}
                                    leftIcon={<span className="material-symbols-outlined">check</span>}
                                    size="xl"
                                    fullWidth
                                    className="shadow-lg shadow-primary/25"
                                >
                                    {isApprovePending || isApproveConfirming ? 'Approving...' : 'Approve Allowance'}
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleStake}
                                    disabled={isTransacting}
                                    loading={isStakePending || isStakeConfirming}
                                    leftIcon={<span className="material-symbols-outlined">verified_user</span>}
                                    size="xl"
                                    fullWidth
                                    className="shadow-lg shadow-primary/25"
                                >
                                    {isStakePending || isStakeConfirming ? 'Staking...' : 'Stake & Verify Account'}
                                </Button>
                            )
                        )}

                        <p className="mt-4 text-center text-text-muted text-xs leading-relaxed">
                            Your stake is <span className="font-bold text-text-main dark:text-white">100% refundable</span> upon account deactivation.
                            <br />This deposit helps ensure a high-quality, spam-free marketplace.
                        </p>
                    </div>
                </div>

                {/* Footer Help */}
                <div className="flex justify-between items-center px-2 py-4 border-t border-gray-200 dark:border-gray-800 mt-4">
                    <div className="flex gap-4">
                        <button className="text-text-muted text-sm font-medium hover:text-primary transition-colors">Support</button>
                        <button className="text-text-muted text-sm font-medium hover:text-primary transition-colors">FAQ</button>
                    </div>
                    <button className="text-text-muted text-sm font-medium flex items-center gap-1 hover:text-text-main dark:hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-sm">help</span>
                        Why do I need to stake?
                    </button>
                </div>
            </div>
        </div>
    );
};
