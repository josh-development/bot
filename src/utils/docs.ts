import { GITHUB_TOKEN } from "../../config.ts";

// @deno-types="https://deno.land/x/fuse@v6.4.1/dist/fuse.d.ts"
import Fuse from "https://deno.land/x/fuse@v6.4.1/dist/fuse.esm.min.js";

import {
  ClassMethodParser,
  ClassParser,
  EnumParser,
  ProjectParser,
  ReferenceTypeParser,
  TypeParser,
} from "../../deps.ts";

type File = {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url?: string;
  type: string;
  _links: {
    self: string;
    git: string;
    html: string;
  };
};

export const docsCache: { [key: string]: { docs: ProjectParser; date: Date } } =
  {};

export const resolveReferenceType = (type: ReferenceTypeParser) => {
  const { packageName, name } = type;
  return `[${name}](https://josh.evie.dev/${
    (packageName || "core")?.split("@joshdb/")[1]
  }/${name})`;
};

export const resolveType = (type: TypeParser) => {
  return `[${type.toString()}](https://joshdocs.netlify.app/)`;
};

let filesCache: { date?: Date; files: File[] };

export const getFiles = async (url?: string) => {
  if (
    filesCache &&
    filesCache.date &&
    new Date().getTime() - filesCache.date.getTime() > 1000 * 60 * 60
  ) {
    return filesCache.files;
  }
  const jsonResponse = await fetch(
    url
      ? `https://${GITHUB_TOKEN}@${url.split("https://")[1]}`
      : `https://${GITHUB_TOKEN}@api.github.com/repos/josh-development/docs/contents`,
  );
  const jsonData = (await jsonResponse.json()) as File[];
  filesCache = { date: new Date(), files: jsonData };
  return jsonData;
};

let packagesCache: { date: Date; packages: File[] } | undefined;

export const getRecursiveDirs = async (dirs: File[]) => {
  const output: File[] = [];
  for (const dir of dirs) {
    const contents = await getFiles(dir.url);
    if (contents.find((x) => x.name === "main.json")) {
      output.push(dir);
    } else {
      output.push(...(await getRecursiveDirs(contents)));
    }
  }
  return output;
};

export const getPackages = async () => {
  if (
    packagesCache &&
    new Date().getTime() - packagesCache.date.getTime() < 1000 * 60 * 60
  ) {
    return packagesCache.packages;
  }
  const dirs = (await getFiles()).filter((x) => x.type === "dir");
  const packages = await getRecursiveDirs(dirs);
  packagesCache = { date: new Date(), packages };
  return packages;
};

export const getAllPackages = async () => {
  const names = (await getPackages()).map((x) => ({
    name: x.name,
    value: x.path,
  }));
  names.push({ name: "all", value: "all" });
  return names;
};

export const getPackageDocs = async (path: string) => {
  const url =
    `https://${GITHUB_TOKEN}@raw.githubusercontent.com/josh-development/docs/main/${path}/main.json`;
  const jsonResponse = await fetch(url);
  if (jsonResponse.status !== 200) {
    throw new Error("Package not found");
  }
  const jsonData = (await jsonResponse.json()) as ProjectParser.JSON;
  return new ProjectParser({ data: jsonData });
};

export const getAllDocs = async () => {
  const packages = await getPackages();
  let docs = await Promise.all(
    packages.map(async (x) => await getDocs(x.path)),
  );
  docs = [
    docs.find((x) => x.name === "@joshdb/core")!,
    ...docs.filter((x) => x.name !== "@joshdb/core"),
  ];
  return docs;
};

export const searchMethod = (
  query: string,
  docs: ProjectParser | { classes: ClassParser[] },
) => {
  for (const cls of docs.classes) {
    for (const method of cls.methods) {
      if (method.name.toLowerCase() === query.toLowerCase()) {
        return method;
      }
    }
  }
  return;
};

export function searchEverything(query: string, docs: ProjectParser[]) {
  const results = [];

  const opts = {
    findAllMatches: true,
    shouldSort: true,
    ignoreLocation: true,
    keys: ["name", "comment.description", "signatures.comment.description"],
  };
  for (const doc of docs) {
    let input: (ClassParser | ClassMethodParser | EnumParser)[] = [];
    if (doc.classes) input = [...input, ...doc.classes];
    if (doc.classes) {
      input = [...input, ...doc.classes.flatMap((x) => x.methods)];
    }
    if (doc.enums) input = [...input, ...doc.enums];

    const fuse = new Fuse(input, opts);
    const res = fuse.search(query);
    if (res.length > 0) {
      results.push(res[0].item);
    }
  }
  const fuse = new Fuse(results, opts);
  const finalResult = fuse.search(query);

  return finalResult.length > 0 ? finalResult[0].item : undefined;
}

export const searchClass = (
  query: string,
  docs: ProjectParser | { classes: ClassParser[] },
) => {
  for (const cls of docs.classes) {
    if (cls.name.toLowerCase() === query.toLowerCase()) {
      return cls;
    }
  }
  return;
};

export const getDocs = async (packageName = "core") => {
  const stored = docsCache[packageName];
  if (stored && new Date().getTime() - stored.date.getTime() < 60000 * 5) {
    return stored.docs;
  }
  const docs = await getPackageDocs(packageName);
  docsCache[packageName] = { docs, date: new Date() };
  return docs;
};
