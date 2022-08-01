import { GITHUB_TOKEN } from "../../config.ts";

import type { ProjectParser as Docs } from "../../deps.ts";

export const docsCache: { [key: string]: { docs: Docs.JSON; date: Date } } = {};

export const getFiles = async () => {
  const jsonResponse = await fetch(
    `https://${GITHUB_TOKEN}@api.github.com/repos/josh-development/docs/contents`
  );
  const jsonData = (await jsonResponse.json()) as File[];
  return jsonData;
};

export const getPackages = async () => {
  const packages = (await getFiles()).filter((x) => x.type === "dir");
  return packages;
};

export const getPackageDocs = async (path: string) => {
  const jsonResponse = await fetch(
    `https://${GITHUB_TOKEN}@raw.githubusercontent.com/josh-development/docs/main/${path}/main.json`
  );
  const jsonData = (await jsonResponse.json()) as Docs.JSON;
  return jsonData;
};

export const searchMethod = (query: string, docs: Docs.JSON) => {
  for (const cls of docs.classes) {
    for (const method of cls.methods) {
      if (method.name.toLowerCase().includes(query.toLowerCase())) {
        return method;
      }
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

// export const getAllDocs = async () => {
//   const packages = await getPackages();
//   const docs: Docs[] = [];
//   for (const packageName of packages) {
//     const doc = await getDocs(packageName.name);
//     docs.push(doc);
//   }
//   return docs;
// };

// export const convertMethodToEmbed = (
//   bot: Bot,
//   method: ClassMethodParser.JSON
// ) => {
//   return new Embeds(bot).addField(
//     "Params",
//     method.signatures[0].parameters
//       .map((x) => `${x.name}: ${x.type.name}`)
//       .join(", "),
//     true
//   );
// };
