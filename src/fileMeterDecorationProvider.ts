import * as vscode from 'vscode';
import { FileMeterConfiguration, getFileMeterConfiguration } from './configuration';
import { CONFIGURATION_SECTION } from './constants';
import { formatMetricsTooltip } from './formatting';
import { countTextLines, shouldCountLines } from './lineCounter';

interface CachedDecoration {
    readonly mtime: number;
    readonly size: number;
    readonly configurationKey: string;
    readonly decoration: vscode.FileDecoration | undefined;
}

export class FileMeterDecorationProvider implements vscode.FileDecorationProvider, vscode.Disposable {
    private readonly onDidChangeFileDecorationsEmitter = new vscode.EventEmitter<vscode.Uri | vscode.Uri[] | undefined>();
    private readonly disposables: vscode.Disposable[] = [];
    private readonly cache = new Map<string, CachedDecoration>();

    public readonly onDidChangeFileDecorations = this.onDidChangeFileDecorationsEmitter.event;

    public constructor() {
        const watcher = vscode.workspace.createFileSystemWatcher('**/*');
        this.disposables.push(
            watcher,
            watcher.onDidChange((uri) => this.refresh(uri)),
            watcher.onDidCreate((uri) => this.refresh(uri)),
            watcher.onDidDelete((uri) => this.refresh(uri)),
            vscode.workspace.onDidChangeConfiguration((event) => {
                if (event.affectsConfiguration(CONFIGURATION_SECTION)) {
                    this.refresh();
                }
            })
        );
    }

    public async provideFileDecoration(
        uri: vscode.Uri,
        token: vscode.CancellationToken
    ): Promise<vscode.FileDecoration | undefined> {
        const configuration = getFileMeterConfiguration();
        if (!configuration.enabled) {
            return undefined;
        }

        let stat: vscode.FileStat;
        try {
            stat = await vscode.workspace.fs.stat(uri);
        } catch {
            return undefined;
        }

        if (token.isCancellationRequested || stat.type !== vscode.FileType.File) {
            return undefined;
        }

        const key = uri.toString();
        const configurationKey = createConfigurationKey(configuration);
        const cached = this.cache.get(key);
        if (cached &&
            cached.mtime === stat.mtime &&
            cached.size === stat.size &&
            cached.configurationKey === configurationKey) {
            return cached.decoration;
        }

        const decoration = await this.createDecoration(uri, stat, configuration, token);
        this.cache.set(key, {
            mtime: stat.mtime,
            size: stat.size,
            configurationKey,
            decoration
        });
        return decoration;
    }

    public refresh(uri?: vscode.Uri): void {
        if (uri) {
            this.cache.delete(uri.toString());
            this.onDidChangeFileDecorationsEmitter.fire(uri);
            return;
        }

        this.cache.clear();
        this.onDidChangeFileDecorationsEmitter.fire(undefined);
    }

    public dispose(): void {
        this.cache.clear();
        this.onDidChangeFileDecorationsEmitter.dispose();
        for (const disposable of this.disposables) {
            disposable.dispose();
        }
    }

    private async createDecoration(
        uri: vscode.Uri,
        stat: vscode.FileStat,
        configuration: FileMeterConfiguration,
        token: vscode.CancellationToken
    ): Promise<vscode.FileDecoration | undefined> {
        const lineCount = await this.readLineCount(uri, stat, configuration.maxLineCountBytes, token);
        if (token.isCancellationRequested) {
            return undefined;
        }

        return new vscode.FileDecoration('i', formatMetricsTooltip(stat.size, lineCount));
    }

    private async readLineCount(
        uri: vscode.Uri,
        stat: vscode.FileStat,
        maxLineCountBytes: number,
        token: vscode.CancellationToken
    ): Promise<number | undefined> {
        if (!shouldCountLines(stat.size, maxLineCountBytes)) {
            return undefined;
        }

        let content: Uint8Array;
        try {
            content = await vscode.workspace.fs.readFile(uri);
        } catch {
            return undefined;
        }

        return token.isCancellationRequested ? undefined : countTextLines(content);
    }
}

function createConfigurationKey(configuration: FileMeterConfiguration): string {
    return String(configuration.maxLineCountBytes);
}
