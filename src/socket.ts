import * as vscode from "vscode";
import { connect } from "socket.io-client";
import { DataProvider } from "./dataProvider";

export function registerNotification() {
  const names = vscode.workspace.getConfiguration("choicefe").get("components") as string[];

  const io = connect("http://office.choicesaas.cn/choicefe", {
    reconnectionAttempts: 10000,
    reconnectionDelay: 1000 * 10 * 60,
  });

  io.on("update", (data: string = "") => {
    const [author, name = "", version = "", branch = "", commit = ""] = data.split("#");

    if (names.some((n) => name.includes(n))) {
      vscode.window.showInformationMessage(`${name} + ${version}`, author, branch);
    }
  });

  io.emit("get/records", JSON.stringify(names));

  io.on("records", (data: []) => {
    vscode.window.registerTreeDataProvider("TreeView", new DataProvider(data));
  });
}
