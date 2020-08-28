import * as vscode from "vscode";
import { get } from "http";
import { writeFileSync } from "fs";

const sep = "-beta.";
const base = "http://npm.choicesaas.cn/-/verdaccio/sidebar";

const barItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, -1000);

barItem.command = "extension.exec";
barItem.show();

const names = vscode.workspace.getConfiguration("choicefe").get("components") as string[];

async function getData(name: string) {
  return new Promise((resolve) => {
    get(`${base}/${name}`, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          parse(JSON.parse(data.toString()));
          resolve();
        } catch (error) {
          resolve();
        }
      });
    });
  });
}

type IVersion = { [x: string]: any };

const vMap: IVersion = {};

function parse(data: { _id: string; versions: any }) {
  const name = data._id;
  const versions = Object.keys(data.versions);
  const m = parseVersions(versions);
  vMap[name] = m;
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
      Object.keys(data.dependencies).forEach((key: string) => {
        map[key] = true;
      });
    } catch (error) {
      console.log("error ==>", error);
    }
  });
  return map;
}

export async function main(path: string) {
  const shouldUpdate = names.some((n) => getDependencies()[n]);
  if (shouldUpdate) {
    barItem.text = "$(sync~spin) sync package.json";
    for (const name of names) {
      await getData(name);
    }
    getCurrPkgInfo(path);
  }
}
