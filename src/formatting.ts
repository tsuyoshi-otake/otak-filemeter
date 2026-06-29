const SIZE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB'] as const;
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
    if (bytes < 1024) {
        return `${bytes}B`;
    }

    let value = bytes / 1024;
    let unitIndex = 0;
    while (value >= 999.5 && unitIndex < BADGE_UNITS.length - 1) {
        value /= 1024;
        unitIndex++;
    }

    return `${formatCompactNumber(value)}${BADGE_UNITS[unitIndex]}B`;
}

export function formatLineCount(lines: number): string {
    return `${lines.toLocaleString()} ${lines === 1 ? 'line' : 'lines'}`;
}

export function formatMetricsTooltip(bytes: number, lineCount: number | undefined): string {
    const lines = lineCount === undefined ? 'Lines: unavailable' : `Lines: ${formatLineCount(lineCount)}`;
    return `${lines}\nSize: ${formatExactSize(bytes)}`;
}

function formatCompactNumber(value: number): string {
    if (value < 9.5) {
        return String(Math.max(1, Math.round(value)));
    }

    return String(Math.round(value));
}
