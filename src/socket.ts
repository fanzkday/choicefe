import * as vscode from "vscode";
import { connect } from "socket.io-client";

export function registerNotification(main: () => void) {
  const io = connect("http://10.10.12.87:20208/choicefe");

  io.on("update", (data: string) => {
    main();
    vscode.window.showInformationMessage(data);
  });

  io.on("disconnect", () => {
    registerNotification(main);
  });
}
