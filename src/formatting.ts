const SIZE_UNITS = ['B', 'KiB', 'MiB', 'GiB', 'TiB'] as const;
const BADGE_UNITS = ['K', 'M', 'G', 'T'] as const;

export function formatExactSize(bytes: number): string {
    if (bytes < 1024) {
        return `${bytes.toLocaleString()} B`;
    }

    let value = bytes;
    let unitIndex = 0;
    while (value >= 1024 && unitIndex < SIZE_UNITS.length - 1) {
        value /= 1024;
        unitIndex++;
    }

    const precision = value < 10 ? 1 : 0;
    return `${value.toFixed(precision)} ${SIZE_UNITS[unitIndex]}`;
}

export function formatSizeBadge(bytes: number): string {
    if (bytes === 0) {
        return '0';
    }

    if (bytes < 1024) {
        return 'B';
    }

    let value = bytes / 1024;
    let unitIndex = 0;
    while (value >= 999.5 && unitIndex < BADGE_UNITS.length - 1) {
        value /= 1024;
        unitIndex++;
    }

    return `${formatCompactNumber(value)}${BADGE_UNITS[unitIndex]}`;
}

export function formatLineBadge(lines: number): string {
    if (lines < 1000) {
        return String(lines);
    }

    if (lines < 999500) {
        return `${formatCompactNumber(lines / 1000)}K`;
    }

    return `${formatCompactNumber(lines / 1000000)}M`;
}

export function formatLineCount(lines: number): string {
    return `${lines.toLocaleString()} ${lines === 1 ? 'line' : 'lines'}`;
}

function formatCompactNumber(value: number): string {
    if (value < 9.5) {
        return String(Math.max(1, Math.round(value)));
    }

    return String(Math.round(value));
}
