export const formatNaira = (
    value: number | string | null | undefined,
    fallback = 'Free',
) => {
    const numeric = Number(value ?? 0);

    if (!Number.isFinite(numeric) || numeric <= 0) {
        return fallback;
    }

    return `₦${numeric.toLocaleString('en-NG', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
};

export const formatCurrency = formatNaira;
