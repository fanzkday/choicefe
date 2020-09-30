import * as vscode from "vscode";
import { main } from "./main";
import { registerNotification } from "./socket";
import { getConfigs } from "./utils";

function exec() {
  (vscode.workspace.workspaceFolders || []).forEach((path) => {
    main(path.uri.fsPath);
  });
}

export function activate(context: vscode.ExtensionContext) {
  const { interval } = getConfigs();
  setInterval(exec, (interval || 60) * 1000 * 60);

  const disposables = registerNotification();
  context.subscriptions.push(...disposables);

  const disposable = vscode.commands.registerCommand("extension.exec", exec);

  context.subscriptions.push(disposable);
}

export function deactivate() {}
