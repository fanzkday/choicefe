import * as vscode from "vscode";

interface IReturn {
  names: string[];
  scope: string;
}

export function getConfigs(): IReturn {
  const choicefe = vscode.workspace.getConfiguration("choicefe");

  const names = choicefe.get("components") as string[];
  const scope = choicefe.get("scope") as string;
  return { names, scope };
}
