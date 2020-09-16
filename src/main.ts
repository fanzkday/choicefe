import * as vscode from "vscode";
import { exec } from "child_process";
import { writeFileSync } from "fs";
import { getConfigs } from "./utils";

const sep = "-beta.";

const barItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, -1000);

barItem.command = "extension.exec";
barItem.show();

const { names } = getConfigs();

type IVersion = { [x: string]: any };

const vMap: IVersion = {};

async function getVersion(name: string) {
  return new Promise((resolve) => {
    exec(`npm view ${name} versions`, (err, stdout, stderr) => {
      if (!err && stdout) {
        try {
          const versions = JSON.parse(stdout.replace(/\'/g, `"`));
          const m = parseVersions(versions);
          vMap[name] = m;
        } catch (error) {
          //
        }
        resolve();
      }
    });
  });
}

function parseVersions(versions: string[]): IVersion {
  const map: IVersion = {};
  versions.forEach((v) => {
    const [main, num] = v.split(sep);
    if (num) {
      map[main] = num;
    }
  });
  return map;
}

function getCurrPkgInfo(path: string) {
  const messages: string[] = [];
  try {
    const data = require(`${path}/package.json`);
    Object.entries(data.dependencies).forEach(([name, version]) => {
      if (names.includes(name)) {
        const map = vMap[name] || {};
        const [main, num] = (version as string).split(sep);
        if (+map[main] > +num) {
          messages.push(`${name}: ${version} > ${main + sep + map[main]}`);
        }
      }
    });
    if (messages.length > 0) {
      vscode.window.showInformationMessage(messages.join("            "), "更新", "不更新").then((d) => {
        if (d === "更新") {
          updatePkg();
        }
        barItem.text = "$(sync) sync package.json";
      });
    } else {
      barItem.text = "$(sync) package.json up date";
    }
  } catch (error) {
    console.log("error ==>", error);
  }
}

function updatePkg() {
  (vscode.workspace.workspaceFolders || []).forEach((folder) => {
    const path = folder.uri.fsPath;
    try {
      const data = require(`${path}/package.json`);

      Object.entries(data.dependencies).forEach(([name, version]) => {
        if (names.includes(name)) {
          const map = vMap[name];
          const [main] = (version as string).split(sep);
          if (map && map[main]) {
            data.dependencies[name] = main + sep + map[main];
          }
        }
      });
      writeFileSync(`${path}/package.json`, JSON.stringify(data, null, 2));
    } catch (error) {
      console.log("error ==>", error);
    }
  });
}

function getDependencies() {
  const map: { [x: string]: boolean } = {};
  (vscode.workspace.workspaceFolders || []).forEach((folder) => {
    const path = folder.uri.fsPath;
    try {
      const data = require(`${path}/package.json`);
      Object.entries<string>(data.dependencies).forEach(([key, value]) => {
        map[key] = value.indexOf(sep) > -1;
      });
    } catch (error) {
      console.log("error ==>", error);
    }
  });
  return map;
}

export async function main(path: string) {
  const shouldUpdateNames = names.filter((n) => getDependencies()[n]);
  if (shouldUpdateNames.length) {
    barItem.text = "$(sync~spin) sync package.json";
    for (const name of shouldUpdateNames) {
      await getVersion(name);
    }
    getCurrPkgInfo(path);
  }
}
