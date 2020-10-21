import { TreeDataProvider, TreeItem, TreeItemCollapsibleState, ProviderResult } from "vscode";

interface IDataProvider {
  _id: string;
  list: Array<{ author: string; time: number; branch: string; commit: string; version: string }>;
}

function parseDate(dTime: number) {
  if (!dTime) {
    return "--:--:-- --:--";
  }
  const pad = (str: number) => str.toString().padStart(2, "0");

  const dateTime = new Date(dTime);
  const year = dateTime.getFullYear();
  const month = dateTime.getMonth() + 1;
  const date = dateTime.getDate();
  const hour = dateTime.getHours();
  const minute = dateTime.getMinutes();
  return `${year}-${pad(month)}-${pad(date)} ${pad(hour)}:${pad(minute)}`;
}

export class DataProvider implements TreeDataProvider<DataItem> {
  data: DataItem[];

  constructor(list: IDataProvider[]) {
    this.data = list.map((item) => {
      return new DataItem(
        item._id,
        item.list.map((row) => {
          return new DataItem(row.version, [
            new DataItem(`提交人: ${row.author}`),
            new DataItem(`分支: ${row.branch}`),
            new DataItem(`提交信息: ${row.commit}`),
            new DataItem(`提交时间: ${parseDate(row.time)}`),
          ]);
        })
      );
    });
  }

  getTreeItem(element: DataItem): TreeItem | Thenable<TreeItem> {
    return element;
  }

  getChildren(element?: DataItem | undefined): ProviderResult<DataItem[]> {
    if (element === undefined) {
      return this.data;
    }
    return element.children;
  }
}

class DataItem extends TreeItem {
  public children: DataItem[] | undefined;

  constructor(label: string, children?: DataItem[] | undefined) {
    super(label, children === undefined ? TreeItemCollapsibleState.None : TreeItemCollapsibleState.Collapsed);
    this.children = children;
  }
}
