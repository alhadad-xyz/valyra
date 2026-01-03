
export function formatCurrency(value: number | string): string {
    const num = Number(value);
    if (isNaN(num)) return String(value);

    // Use Intl.NumberFormat for compact notation
    return new Intl.NumberFormat('en-US', {
        notation: "compact",
        maximumFractionDigits: 1,
    }).format(num);
}
