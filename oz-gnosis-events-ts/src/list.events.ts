import {
  getFileContents,
  getSolidityFiles,
  parseEventsFromFile,
} from "./utils";
import config from "./config.json";

async function main() {
  for (const repository of config.repositories) {
    console.log(`***** ${repository.owner}`);
    const solidityFiles = await getSolidityFiles(repository);
    const solidityFileContents = await Promise.all(
      solidityFiles.map((file) => getFileContents(repository, file))
    );
    solidityFileContents.forEach((fileContents, i) => {
      const filePath = solidityFiles[i].path;
      const events = parseEventsFromFile(fileContents);
      if (events.length) {
        console.log(filePath);
        console.log(events);
      }
    });
  }
}

main();
