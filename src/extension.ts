import * as vscode from "vscode";
import { main } from "./main";

export function activate(context: vscode.ExtensionContext) {
  setInterval(() => {
    (vscode.workspace.workspaceFolders || []).forEach((path) => {
      main(path.uri.fsPath);
    });
  }, 1000 * 60 * 10);
}

export function deactivate() {}
