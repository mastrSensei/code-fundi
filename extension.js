// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
import { SidebarProvider } from "./sidebar/SidebarProvider";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	const sidebarProvider = new SidebarProvider(context.extensionUri);

	const item = vscode.window.createStatusBarItem(
		vscode.StatusBarAlignment.Right
	);
	// item.text = "$(beaker) Add Todo";
	// item.command = "vstodo.addTodo";
	// item.show();

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider("code-fundi-sidebar", sidebarProvider)
	);

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "code-fundi" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('code-fundi.helloWorld', function () {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('Code Fundi!');

		
	});

	context.subscriptions.push(disposable);
}

function codeHighlight() {
	let disposable = vscode.commands.registerCommand('code-fundi.codeHighlight', function () {
		// The code you place here will be executed every time your command is executed

		const editor = vscode.window.activeTextEditor;
		const selection = editor.selection;
		if (selection && !selection.isEmpty) {
			const selectionRange = new vscode.Range(selection.start.line, selection.start.character, selection.end.line, selection.end.character);
			const highlighted = editor.document.getText(selectionRange);

			// Display a message box to the user
			vscode.window.showInformationMessage(`Code Fundi: ${highlighted}`);
		}

		
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate,
	codeHighlight
}
