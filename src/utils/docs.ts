import { GITHUB_TOKEN } from "../../config.ts";

import {
  ClassParser,
  ProjectParser,
  ReferenceTypeParser,
  TypeParser,
} from "../../deps.ts";

export const docsCache: { [key: string]: { docs: ProjectParser; date: Date } } =
  {};

export const resolveReferenceType = (type: ReferenceTypeParser) => {
  const { packageName, name } = type;
  return `[${name}](https://josh.evie.dev/${
    (packageName || "core")?.split("@joshdb/")[1]
  }/${name})`;
};

export const resolveType = (type: TypeParser) => {
  if (type instanceof ReferenceTypeParser) {
    return resolveReferenceType(type);
  }

  return type.toString();
};

let filesCache: { date?: Date; files: File[] };

export const getFiles = async () => {
  if (
    filesCache &&
    filesCache.date &&
    new Date().getTime() - filesCache.date.getTime() > 1000 * 60 * 60
  ) {
    return filesCache.files;
  }
  const jsonResponse = await fetch(
    `https://${GITHUB_TOKEN}@api.github.com/repos/josh-development/docs/contents`,
  );
  const jsonData = (await jsonResponse.json()) as File[];
  filesCache = { date: new Date(), files: jsonData };
  return jsonData;
};

let packagesCache: { date: Date; packages: File[] } | undefined;

export const getPackages = async () => {
  if (
    packagesCache &&
    new Date().getTime() - packagesCache.date.getTime() < 1000 * 60 * 60
  ) {
    return packagesCache.packages;
  }

  const packages = (await getFiles()).filter((x) => x.type === "dir");
  packagesCache = { date: new Date(), packages };
  return packages;
};

export const getAllPackages = async () => {
  const names = (await getPackages()).map((x) => ({
    name: x.name,
    value: x.name,
  }));
  names.push({ name: "all", value: "all" });
  return names;
};

export const getPackageDocs = async (path: string) => {
  const url =
    `https://${GITHUB_TOKEN}@raw.githubusercontent.com/josh-development/docs/main/${path}/main.json`;
  const jsonResponse = await fetch(url);
  const jsonData = (await jsonResponse.json()) as ProjectParser.JSON;
  return new ProjectParser(jsonData);
};

export const getAllDocs = async () => {
  const packages = await getPackages();
  let docs = await Promise.all(
    packages.map(async (x) => await getDocs(x.name)),
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
