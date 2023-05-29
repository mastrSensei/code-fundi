// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { CodeFundiPanel } from './CodeFundiPanel';
import { SidebarProvider } from './SidebarProvider';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	const sidebarProvider = new SidebarProvider(context.extensionUri);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
		"code-fundi-sidebar",
		sidebarProvider
		)
	);

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	context.subscriptions.push(vscode.commands.registerCommand('code-fundi.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from Code Fundi 👷🏽‍♂️!');

		CodeFundiPanel.createOrShow(context.extensionUri);
		})
	);

	context.subscriptions.push(vscode.commands.registerCommand('code-fundi.codeDebug', async function () {
			// The code you place here will be executed every time your command is executed
			const editor = vscode.window.activeTextEditor;
			const selection = editor?.selection;

			// If there's no code window open
			if(!editor) {
				vscode.window.showInformationMessage(`Active text editor not detected`);
				return;
			}

			if (selection && !selection.isEmpty) {
				const selectionRange = new vscode.Range(selection.start.line, selection.start.character, selection.end.line, selection.end.character);
				const highlighted = editor.document.getText(selectionRange);

				sidebarProvider._view?.webview.postMessage({
					type: 'debug',
					value: highlighted
				});
			}
		})
	);
}

// This method is called when your extension is deactivated
export function deactivate() {}
