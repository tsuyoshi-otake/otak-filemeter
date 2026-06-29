import * as vscode from 'vscode';
import { REFRESH_COMMAND } from './constants';
import { FileMeterDecorationProvider } from './fileMeterDecorationProvider';

export function activate(context: vscode.ExtensionContext): void {
    const provider = new FileMeterDecorationProvider();

    context.subscriptions.push(
        provider,
        vscode.window.registerFileDecorationProvider(provider),
        vscode.commands.registerCommand(REFRESH_COMMAND, () => provider.refresh())
    );
}

export function deactivate(): void {
}
