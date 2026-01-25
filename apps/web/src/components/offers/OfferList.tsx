import { Offer } from '@/hooks/useOffers';
import { OfferCard } from './OfferCard';
import { Button } from 'ui';
import Link from 'next/link';

interface OfferListProps {
    type: 'sent' | 'received';
    offers: Offer[];
}

export function OfferList({ type, offers }: OfferListProps) {
    if (offers.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-4xl text-gray-400 dark:text-gray-500">
                        {type === 'sent' ? 'send' : 'inbox'}
                    </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    No {type === 'sent' ? 'Sent' : 'Received'} Offers
                </h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">
                    {type === 'sent'
                        ? "You haven't made any offers yet. Explore the marketplace to find digital assets."
                        : "You haven't received any offers on your listings yet."}
                </p>
                {type === 'sent' && (
                    <Link href="/app">
                        <Button
                            variant="primary"
                            size="md"
                            leftIcon={<span className="material-symbols-outlined">explore</span>}
                        >
                            Explore Marketplace
                        </Button>
                    </Link>
                )}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4">
            {offers.map((offer) => (
                <OfferCard key={offer.id} offer={offer} type={type} />
            ))}
        </div>
    );
}
