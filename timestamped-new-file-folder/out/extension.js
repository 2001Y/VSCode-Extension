"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
function activate(context) {
    console.log('Congratulations, your extension "timestamped-new-file-folder" is now active!');
    let disposable = vscode.commands.registerCommand('extension.sayHello', () => {
        vscode.window.showInformationMessage('Hello World from Timestamped New File/Folder!');
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
// この関数はエクスポートされますが、現在は使用されていません
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map