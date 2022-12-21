import fs from "fs";
import path from "path";
import axios from "axios";
import { ethers } from "forta-agent";

interface RepositoryTreeNode {
  path: string;
  mode: string;
  type: string;
  sha: string;
  size?: number;
  url: string;
}

interface RepositoryTree {
  sha: string;
  url: string;
  tree: RepositoryTreeNode[];
  truncated: boolean;
}

interface RepositoryConfig {
  owner: string;
  name: string;
  branch: string;
  path: string;
}

export function getAllAbis(): ethers.utils.Interface[] {
  const abis: ethers.utils.Interface[] = [];
  const paths = [`${__dirname}${path.sep}abis`];
  let currPath: string | undefined;
  while (true) {
    currPath = paths.pop();
    if (!currPath) break;

    const items = fs.readdirSync(currPath);
    const files = items.filter((item) => item.endsWith(".json"));
    for (const file of files) {
      abis.push(getAbi(`${currPath}${path.sep}${file}`));
    }
    const folders = items.filter((item) => !item.endsWith(".json"));
    for (const folder of folders) {
      paths.push(`${currPath}${path.sep}${folder}`);
    }
  }
  return abis;
}

function getAbi(filePath: string): ethers.utils.Interface {
  const { abi } = JSON.parse(fs.readFileSync(filePath).toString());
  return new ethers.utils.Interface(abi);
}
