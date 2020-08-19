import * as vscode from "vscode";
import { main } from "./main";

function exec() {
  (vscode.workspace.workspaceFolders || []).forEach((path) => {
    main(path.uri.fsPath);
  });
}

export function activate(context: vscode.ExtensionContext) {
  const interval = vscode.workspace.getConfiguration("cook").get("interval") as number;

  exec();

  setInterval(exec, interval || 1000 * 60 * 10);

  let disposable = vscode.commands.registerCommand("extension.exec", () => {
    exec();
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
