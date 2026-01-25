import { FC, useState } from 'react';
import { Input, Button } from 'ui';
import { useSellStore } from '../../stores/useSellStore';

export const StepPricing: FC = () => {
    const { price, setField, annualRevenue, revenueTrend, description, websiteUrl } = useSellStore();
    const [isLoading, setIsLoading] = useState(false);
    const [estimate, setEstimate] = useState<{ min: number; max: number; confidence: number } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleGetEstimate = async () => {
        if (!annualRevenue) {
            setError("Please enter Annual Revenue in the previous step to get an estimate.");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('http://localhost:8000/api/v1/valuation/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    revenue: parseFloat(annualRevenue),
                    revenue_trend: revenueTrend,
                    description: description || `Project at ${websiteUrl}`,
                    growth_rate: 0 // Optional in backend, but passing 0 just in case
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch valuation');
            }

            const data = await response.json();
            setEstimate({
                min: data.valuation_range.min,
                max: data.valuation_range.max,
                confidence: data.confidence
            });
        } catch (err) {
            setError("Could not generate estimate. Please try again.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const applyAveragePrice = () => {
        if (estimate) {
            const avg = (estimate.min + estimate.max) / 2;
            setField('price', avg.toString());
        }
    };

    return (
        <div className="bg-white dark:bg-background-dark-elevated rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 relative overflow-hidden">
            <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[24px]">attach_money</span>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-text-main dark:text-white">Valuation & Terms</h3>
                        <p className="text-text-muted text-sm">Set your asking price for this asset.</p>
                    </div>
                </div>



                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 mb-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-text-main dark:text-white">Asking Price (IDRX)</label>
                            <div className="flex gap-2 items-start">
                                <div className="relative flex-1">
                                    <Input
                                        type="number"
                                        placeholder="0.0"
                                        value={price}
                                        onChange={(e) => setField('price', e.target.value)}
                                        className="pl-8"
                                    />
                                    <span className="absolute left-3 top-2.5 text-gray-500 text-sm font-bold">$</span>
                                </div>
                                <Button
                                    variant="secondary"
                                    onClick={handleGetEstimate}
                                    loading={isLoading}
                                    disabled={isLoading}
                                    leftIcon={<span className="material-symbols-outlined">psychology</span>}
                                >
                                    Get AI Estimate
                                </Button>
                            </div>

                            {error && (
                                <p className="text-red-500 text-sm mt-2">{error}</p>
                            )}

                            {estimate && (
                                <div className="mt-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm font-bold text-primary mb-1">AI Valuation Estimate</p>
                                            <p className="text-2xl font-black text-text-main dark:text-white">
                                                ${estimate.min.toLocaleString()} - ${estimate.max.toLocaleString()}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs text-text-muted">Confidence Score:</span>
                                                <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-green-500"
                                                        style={{ width: `${estimate.confidence * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={applyAveragePrice}
                                            leftIcon={<span className="material-symbols-outlined">check</span>}
                                        >
                                            Apply Average
                                        </Button>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-between text-xs text-text-muted mt-2">
                                <p className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px]">info</span>
                                    Marketplace Fee: 2.5%
                                </p>
                                <p>
                                    You will receive: <span className="font-bold text-text-main dark:text-white">{price ? (parseFloat(price) * 0.975).toLocaleString() : '0'} IDRX</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
