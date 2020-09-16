import * as vscode from "vscode";

export function getConfigs(): { interval: number; names: string[] } {
  const choicefe = vscode.workspace.getConfiguration("choicefe");

  const interval = choicefe.get("interval") as number;
  const names = choicefe.get("components") as string[];
  return { interval, names };
}
