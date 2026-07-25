import * as fs from 'fs';
import * as vscode from 'vscode';
import { isKnownBinaryFileName } from './binaryFileTypes';
import { ConcurrencyGate } from './concurrencyGate';
import { FileMeterConfiguration, getFileMeterConfiguration } from './configuration';
import { CONFIGURATION_SECTION } from './constants';
import { formatMetricsTooltip } from './formatting';
import { countTextLines, LineCountScanner, shouldCountLines } from './lineCounter';

/** How many files may be read at once. */
const READ_CONCURRENCY = 4;
/** How much of a file is held in memory while counting its lines. */
const READ_CHUNK_BYTES = 64 * 1024;
/** How long file changes are collected before the explorer is told about them. */
const REFRESH_DEBOUNCE_MS = 100;
/** How many changed files are worth listing before redrawing everything instead. */
const MAX_LISTED_CHANGES = 256;
/** How many measurements are remembered. */
const MAX_CACHED_MEASUREMENTS = 4096;

interface Measurement {
    readonly mtime: number;
    readonly size: number;
    readonly lineCount: number | undefined;
}

export class FileMeterDecorationProvider implements vscode.FileDecorationProvider, vscode.Disposable {
    private readonly onDidChangeFileDecorationsEmitter = new vscode.EventEmitter<vscode.Uri | vscode.Uri[] | undefined>();
    private readonly disposables: vscode.Disposable[] = [];
    private readonly measurements = new Map<string, Measurement>();
    private readonly openDocuments = new Map<string, vscode.TextDocument>();
    private readonly reads = new ConcurrencyGate(READ_CONCURRENCY);
    private readonly buffers: Buffer[] = [];
    private readonly changed = new Map<string, vscode.Uri>();
    private redrawEverything = false;
    private refreshTimer: NodeJS.Timeout | undefined;
    private configuration: FileMeterConfiguration | undefined;

    public readonly onDidChangeFileDecorations = this.onDidChangeFileDecorationsEmitter.event;

    public constructor() {
        const watcher = vscode.workspace.createFileSystemWatcher('**/*');
        this.disposables.push(
            watcher,
            watcher.onDidChange((uri) => this.scheduleRefresh(uri)),
            watcher.onDidCreate((uri) => this.scheduleRefresh(uri)),
            watcher.onDidDelete((uri) => this.scheduleRefresh(uri)),
            vscode.workspace.onDidChangeConfiguration((event) => {
                if (event.affectsConfiguration(CONFIGURATION_SECTION)) {
                    this.configuration = undefined;
                    this.refresh();
                }
            }),
            vscode.workspace.onDidOpenTextDocument((document) => this.trackDocument(document)),
            vscode.workspace.onDidCloseTextDocument((document) => this.openDocuments.delete(document.uri.toString()))
        );

        for (const document of vscode.workspace.textDocuments) {
            this.trackDocument(document);
        }
    }

    public async provideFileDecoration(
        uri: vscode.Uri,
        token: vscode.CancellationToken
    ): Promise<vscode.FileDecoration | undefined> {
        const configuration = this.currentConfiguration();
        if (!configuration.enabled) {
            return undefined;
        }

        let stat: vscode.FileStat;
        try {
            stat = await vscode.workspace.fs.stat(uri);
        } catch {
            return undefined;
        }

        if (stat.type !== vscode.FileType.File) {
            return undefined;
        }

        const key = uri.toString();
        const known = this.measurements.get(key);
        if (known && known.mtime === stat.mtime && known.size === stat.size) {
            return decorate(stat.size, known.lineCount);
        }

        const lineCount = await this.countLines(uri, stat.size, configuration.maxLineCountBytes, token);
        if (token.isCancellationRequested) {
            return undefined;
        }

        this.remember(key, { mtime: stat.mtime, size: stat.size, lineCount });
        return decorate(stat.size, lineCount);
    }

    /** Measures every file again, for the refresh command and settings changes. */
    public refresh(): void {
        this.measurements.clear();
        this.onDidChangeFileDecorationsEmitter.fire(undefined);
    }

    public dispose(): void {
        clearTimeout(this.refreshTimer);
        this.refreshTimer = undefined;
        this.measurements.clear();
        this.openDocuments.clear();
        this.changed.clear();
        this.buffers.length = 0;
        this.onDidChangeFileDecorationsEmitter.dispose();
        for (const disposable of this.disposables) {
            disposable.dispose();
        }
    }

    /**
     * Collects file changes and announces them as one event. A build or a branch
     * switch changes thousands of files, and announcing each one separately makes
     * the explorer ask for the decorations again one round trip at a time. Past
     * the point where listing them is worth it, the explorer is simply told to
     * redraw, which costs the same and holds nothing.
     */
    private scheduleRefresh(uri: vscode.Uri): void {
        this.measurements.delete(uri.toString());
        this.changed.set(uri.toString(), uri);
        if (this.changed.size > MAX_LISTED_CHANGES) {
            this.changed.clear();
            this.redrawEverything = true;
        }

        if (this.refreshTimer) {
            return;
        }

        this.refreshTimer = setTimeout(() => {
            this.refreshTimer = undefined;
            const changed = this.redrawEverything ? undefined : [...this.changed.values()];
            this.changed.clear();
            this.redrawEverything = false;
            this.onDidChangeFileDecorationsEmitter.fire(changed);
        }, REFRESH_DEBOUNCE_MS);
    }

    /**
     * Reading the settings walks the whole configuration stack and builds an
     * object; the explorer asks for a decoration per visible file, so doing that
     * per file is real work for a value that only changes on a settings edit.
     */
    private currentConfiguration(): FileMeterConfiguration {
        if (!this.configuration) {
            this.configuration = getFileMeterConfiguration();
        }

        return this.configuration;
    }

    private remember(key: string, measurement: Measurement): void {
        this.measurements.set(key, measurement);
        if (this.measurements.size <= MAX_CACHED_MEASUREMENTS) {
            return;
        }

        const oldest = this.measurements.keys().next();
        this.measurements.delete(oldest.value as string);
    }

    private trackDocument(document: vscode.TextDocument): void {
        if (document.uri.scheme === 'file') {
            this.openDocuments.set(document.uri.toString(), document);
        }
    }

    private async countLines(
        uri: vscode.Uri,
        size: number,
        maxLineCountBytes: number,
        token: vscode.CancellationToken
    ): Promise<number | undefined> {
        if (!shouldCountLines(size, maxLineCountBytes)) {
            return undefined;
        }

        // A file VS Code already holds in memory has been counted for us, so
        // there is nothing to read at all. Only while it matches what is on disk,
        // though: an unsaved edit would answer for text the file does not have.
        const opened = this.openDocuments.get(uri.toString());
        if (opened && !opened.isDirty && !opened.isClosed) {
            return countOpenDocumentLines(opened);
        }

        // Names that can only be binary are never opened: the line count would be
        // thrown away anyway, and opening a file is exactly what makes an
        // on-access virus scanner scan it.
        if (isKnownBinaryFileName(uri.path)) {
            return undefined;
        }

        return this.reads.run(() => this.scanLines(uri, token));
    }

    private async scanLines(uri: vscode.Uri, token: vscode.CancellationToken): Promise<number | undefined> {
        if (token.isCancellationRequested) {
            return undefined;
        }

        try {
            return uri.scheme === 'file'
                ? await this.scanFile(uri.fsPath, token)
                : countTextLines(await vscode.workspace.fs.readFile(uri));
        } catch {
            return undefined;
        }
    }

    /**
     * Counts the lines of a file a chunk at a time. Reading the file whole would
     * hold as much memory as the file is large, for a result that is one number,
     * and binary content is recognised from the first chunk and stops the read.
     */
    private async scanFile(filePath: string, token: vscode.CancellationToken): Promise<number | undefined> {
        const buffer = this.buffers.pop() ?? Buffer.allocUnsafe(READ_CHUNK_BYTES);
        const handle = await fs.promises.open(filePath, 'r');
        try {
            const scanner = new LineCountScanner();
            for (;;) {
                const { bytesRead } = await handle.read(buffer, 0, buffer.length);
                if (bytesRead === 0 || !scanner.push(buffer.subarray(0, bytesRead))) {
                    return scanner.result();
                }

                if (token.isCancellationRequested) {
                    return undefined;
                }
            }
        } finally {
            await handle.close();
            this.buffers.push(buffer);
        }
    }
}

/**
 * The lines of an open document, counted the way its contents on disk would be:
 * a trailing newline ends the last line rather than starting an empty one.
 */
function countOpenDocumentLines(document: vscode.TextDocument): number {
    const lastLine = document.lineAt(document.lineCount - 1);
    return lastLine.text.length === 0 ? document.lineCount - 1 : document.lineCount;
}

function decorate(size: number, lineCount: number | undefined): vscode.FileDecoration {
    return new vscode.FileDecoration('i', formatMetricsTooltip(size, lineCount));
}
