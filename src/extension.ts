import * as vscode from "vscode";
import { main } from "./main";

function exec() {
  (vscode.workspace.workspaceFolders || []).forEach((path) => {
    main(path.uri.fsPath);
  });
}

vscode.extensions.onDidChange(() => {
  const interval = vscode.workspace.getConfiguration("cook").get("interval") as number;
  exec();
  setInterval(exec, (interval || 10) * 1000 * 60);
});

export function activate(context: vscode.ExtensionContext) {
  const interval = vscode.workspace.getConfiguration("cook").get("interval") as number;
  exec();

  setInterval(exec, (interval || 10) * 1000 * 60);

  const disposable = vscode.commands.registerCommand("extension.exec", () => {
    exec();
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
