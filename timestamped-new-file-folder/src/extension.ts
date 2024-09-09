import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "timestamped-new-file-folder" is now active!');

	let disposable = vscode.commands.registerCommand('extension.sayHello', () => {
		vscode.window.showInformationMessage('Hello World from Timestamped New File/Folder!');
	});

	context.subscriptions.push(disposable);
}

// この関数はエクスポートされますが、現在は使用されていません
export function deactivate() {}
