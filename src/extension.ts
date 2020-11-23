import * as vscode from "vscode";
import { main } from "./main";
import { registerNotification } from "./socket";
import { getConfigs } from "./utils";

function exec() {
  (vscode.workspace.workspaceFolders || []).forEach((path) => {
    main(path.uri.fsPath);
    const pkg = require(`${path.uri.fsPath}/package.json`);
    const pluginsNames: string[] | undefined = pkg["vscode-plugins"];

    if (pluginsNames !== undefined) {
      const extensionNames = vscode.extensions.all.map((ex) => {
        return ex.packageJSON.displayName?.toLowerCase();
      });

      const uninstallPlugins = pluginsNames.filter((name) => !extensionNames.includes(name.toLowerCase()));

      if (uninstallPlugins.length) {
        vscode.window.showInformationMessage(`请安装如下vscode插件: ${uninstallPlugins.concat(";")}`);
      }
    }
  });
}

export function activate(context: vscode.ExtensionContext) {
  exec();

  const disposables = registerNotification();
  context.subscriptions.push(...disposables);

  const disposable = vscode.commands.registerCommand("extension.exec", exec);

  context.subscriptions.push(disposable);
}

export function deactivate() {}
