import path from "path";

/*
  Finds a target filename whether listFiles returns:

  ["memory.js"]

  or:

  ["agent/memory.js"]
*/
export function findFileInFolder(targetFile, folder, files) {
  const found = files.find((file) => {
    return (
      file === targetFile ||
      file.endsWith(`/${targetFile}`) ||
      file.endsWith(`\\${targetFile}`)
    );
  });

  if (!found) {
    return null;
  }

  /*
    If listFiles already returned a full path,
    use it directly.
  */
  if (
    found.includes("/") ||
    found.includes("\\")
  ) {
    return found;
  }

  return path.join(folder, found);
}