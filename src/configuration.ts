import * as vscode from 'vscode';
import { CONFIGURATION_SECTION } from './constants';

export interface FileMeterConfiguration {
    enabled: boolean;
    maxLineCountBytes: number;
}

export const DEFAULT_MAX_LINE_COUNT_BYTES = 1024 * 1024;

export function getFileMeterConfiguration(): FileMeterConfiguration {
    const configuration = vscode.workspace.getConfiguration(CONFIGURATION_SECTION);
    return {
        enabled: configuration.get<boolean>('enabled', true),
        maxLineCountBytes: normalizeMaxLineCountBytes(configuration.get('maxLineCountBytes'))
    };
}

export function normalizeMaxLineCountBytes(value: unknown): number {
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
        return DEFAULT_MAX_LINE_COUNT_BYTES;
    }

    return Math.floor(value);
}
