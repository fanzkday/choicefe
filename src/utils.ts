import * as vscode from "vscode";

interface IReturn {
  interval: number;
  names: string[];
  scope: string;
}

export function getConfigs(): IReturn {
  const choicefe = vscode.workspace.getConfiguration("choicefe");

  const interval = choicefe.get("interval") as number;
  const names = choicefe.get("components") as string[];
  const scope = choicefe.get("scope") as string;
  return { interval, names, scope };
}
