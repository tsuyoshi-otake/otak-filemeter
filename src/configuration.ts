import * as vscode from 'vscode';
import { CONFIGURATION_SECTION } from './constants';

export type BadgeMetric = 'size' | 'lines';

export interface FileMeterConfiguration {
    enabled: boolean;
    badgeMetric: BadgeMetric;
    showLineCountInTooltip: boolean;
    maxLineCountBytes: number;
}

export const DEFAULT_MAX_LINE_COUNT_BYTES = 1024 * 1024;

export function getFileMeterConfiguration(): FileMeterConfiguration {
    const configuration = vscode.workspace.getConfiguration(CONFIGURATION_SECTION);
    return {
        enabled: configuration.get<boolean>('enabled', true),
        badgeMetric: normalizeBadgeMetric(configuration.get('badgeMetric')),
        showLineCountInTooltip: configuration.get<boolean>('showLineCountInTooltip', false),
        maxLineCountBytes: normalizeMaxLineCountBytes(configuration.get('maxLineCountBytes'))
    };
}

export function normalizeBadgeMetric(value: unknown): BadgeMetric {
    return value === 'lines' ? 'lines' : 'size';
}

export function normalizeMaxLineCountBytes(value: unknown): number {
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
        return DEFAULT_MAX_LINE_COUNT_BYTES;
    }

    return Math.floor(value);
}
