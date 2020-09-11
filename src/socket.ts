import * as vscode from "vscode";
import { connect } from "socket.io-client";

export function registerNotification(main: () => void) {
  const io = connect("http://office.choicesaas.cn/choicefe", {
    reconnectionAttempts: 10000,
    reconnectionDelay: 1000 * 10 * 60,
  });

  io.on("update", (data: string = "") => {
    main();
    vscode.window.showInformationMessage(data.split("#").join("      "));
  });
}
