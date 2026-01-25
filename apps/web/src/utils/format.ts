export function formatCurrency(value: number | string, currency: string = 'IDRX'): string {
    const num = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(num)) return `0 ${currency}`;

    const formatter = Intl.NumberFormat('en-US', {
        notation: "compact",
        maximumFractionDigits: 1
    });

    return `${formatter.format(num)} ${currency}`;
}

export function formatNumber(value: number | string): string {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '0';

    return new Intl.NumberFormat('en-US', {
        notation: "compact",
        maximumFractionDigits: 1
    }).format(num);
}
