#!/usr/bin/env node

import { MultiBranch } from ".";
import wrapLogs from "./utils/wrap-logs";
import * as argv from "argv";
import * as chalk from "chalk";
import * as figlet from "figlet";
import * as fs from "fs-extra";
import * as path from "path";

figlet.parseFont(
  "isometric2",
  fs.readFileSync(path.join(__dirname, "..", "isometric2.flf")).toString()
);

wrapLogs();

const args: any = argv
  .option([
    {
      name: "port",
      short: "p",
      type: "string"
    },
    {
      name: "dir",
      short: "d",
      type: "string"
    },
    {
      name: "port-env",
      type: "string"
    },
    {
      name: "default-branch",
      type: "string"
    },
    {
      name: "help",
      short: "h",
      type: "boolean"
    },
    {
      name: "branches",
      short: "b",
      type: "string"
    },
    {
      name: "only",
      type: "string"
    }
  ])
  .run().options;

(async () => {
  if (args.help) {
    console.log(chalk.bold("\nArguments:"));
    console.log(
      chalk.green("\t -p,--port to specify port MultiBranch will listen to")
    );
    console.log(chalk.green("\t --port-env to specify project port env name"));
    console.log(
      chalk.green(
        "\t --default-branch to specify default branch for reverse proxy"
      )
    );
    console.log(chalk.green("\t --only to specify multi branch run env"));
    console.log(
      chalk.green("\t -b,--branch comma separated branch names to run")
    );
    console.log(chalk.green("\t -h,--help to view help"));

    return;
  }

  if (process.env["NODE_ENV"] === args.only || "staging") {
    console.log("\n");
    console.log(chalk.yellow(figlet.textSync("MB", { font: "isometric2" })));
    console.log("\n");

    MultiBranch.bootstrap({
      portENV: args["port-env"],
      defaultBranch: args["default-branch"],
      port: parseInt(args.port),
      branches: args.branches ? args.branches.split(",") : undefined,
      repoDir: args.dir ? path.join(__dirname, args.dir) : undefined
    })
      .then(() => {})
      .catch(e => {
        console.error("Error in MultiBranch bootstrap process !", e);
      });
  } else process.exit();
})();
