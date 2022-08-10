module.exports = {
  apps: [
    {
      script: "mod.ts",
      name: "JoshDocs",
      watch: ["src"],
      interpreter: "deno",
      interpreter_args:
        "run --allow-net --allow-read --allow-env --allow-write=fileloader.ts",
    },
  ],
};
