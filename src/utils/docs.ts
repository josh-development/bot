// deno-lint-ignore-file no-explicit-any
import type { Bot } from "../../deps.ts";
import { GITHUB_TOKEN } from "../../configs.ts";
import { Embeds } from "./embed.ts";

export const docsCache: { [key: string]: { docs: Docs; date: Date } } = {};

interface File {
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
}

export interface DocsClassMethodParameter {
  id: number;
  name: string;
  type: {
    kind: string;
    id?: number;
    type: string;
    name: string;
    packageName: string;
    typeArguments: Array<{
      kind: string;
      id: number;
      name: string;
      packageName?: string;
      typeArguments: Array<any>;
    }>;
  };
}

interface DocClassMethod {
  id: number;
  name: string;
  comment: {
    description: any;
    blockTags: Array<any>;
    modifierTags: Array<any>;
  };
  source: {
    line: number;
    file: string;
    path: string;
  };
  accessibility: string;
  abstract: boolean;
  static: boolean;
  signatures: Array<{
    id: number;
    name: string;
    typeParameters: Array<{
      id: number;
      name: string;
      type?: {
        kind: string;
        id: any;
        name: string;
        packageName: string;
        typeArguments: Array<any>;
      };
      default?: {
        kind: string;
        id: number;
        name: string;
        packageName: any;
        typeArguments: Array<any>;
      };
    }>;
    parameters: DocsClassMethodParameter[];
    returnType: {
      kind: string;
      id: any;
      name: string;
      packageName: string;
      typeArguments: Array<{
        kind: string;
        id?: number;
        name: string;
        packageName?: string;
        typeArguments: Array<{
          kind: string;
          id: number;
          name: string;
          packageName: string;
          typeArguments: Array<any>;
        }>;
      }>;
      type?: string;
    };
  }>;
}

interface DocClass {
  id: number;
  name: string;
  comment: {
    description: any;
    blockTags: Array<any>;
    modifierTags: Array<any>;
  };
  source: {
    line: number;
    file: string;
    path: string;
  };
  external: boolean;
  abstract: boolean;
  extendsType: {
    kind: string;
    id: any;
    name: string;
    packageName: string;
    typeArguments: Array<{
      kind: string;
      id: number;
      name: string;
      packageName: any;
      typeArguments: Array<{
        kind: string;
        id: number;
        name: string;
        packageName: any;
        typeArguments: Array<any>;
      }>;
    }>;
  };
  implementsType: Array<any>;
  construct: {
    id: number;
    name: string;
    comment: {
      description: any;
      blockTags: Array<any>;
      modifierTags: Array<any>;
    };
    source: {
      line: number;
      file: string;
      path: string;
    };
    parameters: Array<{
      id: number;
      name: string;
      type: {
        kind: string;
        id?: number;
        name: string;
        packageName?: string;
        typeArguments: Array<{
          kind: string;
          id?: number;
          name: string;
          packageName?: string;
          typeArguments: Array<any>;
        }>;
      };
    }>;
  };
  properties: Array<{
    id: number;
    name: string;
    comment: {
      description?: string;
      blockTags: Array<{
        name: string;
        text: string;
      }>;
      modifierTags: Array<any>;
    };
    source: {
      line: number;
      file: string;
      path: string;
    };
    accessibility: string;
    abstract: boolean;
    static: boolean;
    readonly: boolean;
    optional: boolean;
    type: {
      kind: string;
      id?: number;
      name?: string;
      packageName?: string;
      typeArguments?: Array<{
        kind: string;
        id?: number;
        name: string;
        packageName?: string;
        typeArguments: Array<any>;
      }>;
      type?: string;
    };
  }>;
  methods: Array<DocClassMethod>;
}

export interface Docs {
  id: number;
  name: string;
  classes: DocClass[];
  constants: Array<any>;
  enums: Array<any>;
  functions: Array<any>;
  interfaces: Array<any>;
  namespaces: Array<{
    id: number;
    name: string;
    comment: {
      description: any;
      blockTags: Array<any>;
      modifierTags: Array<any>;
    };
    source: {
      line: number;
      file: string;
      path: string;
    };
    external: boolean;
    classes: Array<any>;
    constants: Array<any>;
    enums: Array<any>;
    functions: Array<any>;
    interfaces: Array<{
      id: number;
      name: string;
      comment: {
        description: any;
        blockTags: Array<any>;
        modifierTags: Array<any>;
      };
      source: {
        line: number;
        file: string;
        path: string;
      };
      external: boolean;
      properties: Array<{
        id: number;
        name: string;
        comment: {
          description: string;
          blockTags: Array<{
            name: string;
            text: string;
          }>;
          modifierTags: Array<any>;
        };
        source: {
          line: number;
          file: string;
          path: string;
        };
        readonly: boolean;
        type: {
          kind: string;
          id?: number;
          name?: string;
          packageName: any;
          typeArguments?: Array<any>;
          type?: string;
        };
      }>;
    }>;
    namespaces: Array<any>;
    typeAliases: Array<any>;
  }>;
  typeAliases: Array<any>;
}

export const getFiles = async () => {
  const jsonResponse = await fetch(
    `https://${GITHUB_TOKEN}@api.github.com/repos/josh-development/docs/contents`,
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
    `https://${GITHUB_TOKEN}@raw.githubusercontent.com/josh-development/docs/main/${path}/main.json`,
  );
  const jsonData = (await jsonResponse.json()) as Docs;
  return jsonData;
};

export const searchMethod = (query: string, docs: Docs) => {
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

export const convertMethodToEmbed = (bot: Bot, method: DocClassMethod) => {
  return new Embeds(bot).addField(
    "Params",
    method.signatures[0].parameters
      .map((x) => `${x.name}: ${x.type.name}`)
      .join(", "),
    true,
  );
};
