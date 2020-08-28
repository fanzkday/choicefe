import * as vscode from "vscode";
import { main } from "./main";
import { registerNotification } from "./socket";

function exec() {
  (vscode.workspace.workspaceFolders || []).forEach((path) => {
    main(path.uri.fsPath);
  });
}

registerNotification(() => {
  exec();
});

export function activate(context: vscode.ExtensionContext) {
  const interval = vscode.workspace.getConfiguration("choicefe").get("interval") as number;
  setInterval(exec, (interval || 60) * 1000 * 60);

  exec();

  const disposable = vscode.commands.registerCommand("extension.exec", () => {
    exec();
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
