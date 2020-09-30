import * as vscode from "vscode";
import { connect } from "socket.io-client";
import { DataProvider } from "./dataProvider";
import { getConfigs } from "./utils";

export function registerNotification(): vscode.Disposable[] {
  const io = connect("http://office.choicesaas.cn/choicefe", {
    reconnectionAttempts: 10000,
    reconnectionDelay: 1000 * 60 * 10,
  });

  io.on("update", (data: string = "") => {
    const [author, name = "", version = "", branch = "", commit = ""] = data.split("#");

    if (getConfigs().names.some((n) => name.includes(n))) {
      vscode.window.showInformationMessage(`${name} + ${version}`, `author:${author}`);
    }
  });

  io.on("records", (data: []) => {
    vscode.window.createTreeView("TreeViewRecord", {
      treeDataProvider: new DataProvider(data),
      showCollapseAll: true,
    });
  });

  const disposable = vscode.commands.registerCommand("TreeViewRecord.refresh", () => {
    io.emit("get/records", JSON.stringify(getConfigs().names));
  });

  return [disposable];
}
