import axios from "axios";

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

/**
 * Returns a list of Solidity files from a specified Github repository
 *
 * @param repository metadata of repository to search
 * @returns a list of RepositoryTreeNodes representing Solidity files
 */
export async function getSolidityFiles(
  repository: RepositoryConfig
): Promise<RepositoryTreeNode[]> {
  const ozContractsRepositoryUrl = `https://api.github.com/repos/${repository.owner}/${repository.name}/git/trees/${repository.branch}?recursive=true`;
  const response = await axios.get(ozContractsRepositoryUrl);
  const root = response.data as RepositoryTree;
  const repositoryContents = root.tree;
  return repositoryContents.filter(
    (content) =>
      content.type === "blob" &&
      content.path.startsWith(repository.path) &&
      content.path.endsWith(".sol")
  );
}

/**
 * Returns contents of a Github file as a string
 *
 * @param repository metadata of repository
 * @param fileMetadata metadata of file to retrieve
 * @returns a string representing the contents of the file
 */
export async function getFileContents(
  repository: RepositoryConfig,
  fileMetadata: RepositoryTreeNode
): Promise<string> {
  const rawContentsUrl = `https://raw.githubusercontent.com/${repository.owner}/${repository.name}/${repository.branch}/`;
  const response = await axios.get(`${rawContentsUrl}${fileMetadata.path}`);
  return response.data;
}

/**
 * Parses contents of a file for Solidity event declarations
 *
 * @param fileContents string representation of file contents
 * @returns a list of string event definitions
 */
export function parseEventsFromFile(fileContents: string): string[] {
  const lines = fileContents.split("\n").map((line) => line.trim());
  const events: string[] = [];
  lines.forEach((currLine, lineNumber) => {
    if (currLine.startsWith("event ")) {
      let eventDeclaration = currLine;
      // handle event declarations split across multiple lines
      if (!currLine.endsWith(";")) {
        for (let i = lineNumber + 1; i++; i < lines.length) {
          let line = lines[i];
          // strip out comments
          if (line.includes("//")) {
            line = line.substring(0, line.indexOf("//"));
          }
          eventDeclaration = `${eventDeclaration}${line}`;
          if (line.endsWith(";")) break;
        }
      }
      events.push(eventDeclaration.substring(0, eventDeclaration.length - 1));
    }
  });
  return events;
}
