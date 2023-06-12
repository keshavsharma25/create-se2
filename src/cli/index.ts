#!/usr/bin/env node
import { Command } from "commander";
import inquirer from "inquirer";
import { DEFAULT_APP_NAME } from "../consts.js";
import { ifDirExists, createRepo, figletText } from "../utils/cli.js";
import chalk from "chalk";

export interface Options {
  appName: string;
  flags: {
    installPkg: boolean;
  };
}

const defaultOptions: Readonly<Options> = {
  appName: DEFAULT_APP_NAME,
  flags: {
    installPkg: true,
  },
};

const runCli = async () => {
  const program = new Command().name("create-se-2");
  const options: Options = { ...defaultOptions };

  program
    .description("Create a new scaffold-eth-2 app")
    .option("-n, --name <name>", "name of the app")
    .option("-i, --install", "install packages");

  program.parse(process.argv);

  figletText("Scaffold-eth-2");

  const args = program.opts();

  args["name"]
    ? (options.appName = args["name"])
    : (options.appName = await getRepoName());

  args["install"]
    ? (options.flags.installPkg = args["install"])
    : (options.flags.installPkg = await getInstallPkgs());

  await createRepo(options);
};

const getRepoName = async (): Promise<string> => {
  const { repoName } = await inquirer.prompt({
    name: "repoName",
    type: "input",
    message: "What would you like to name your app?",
    default: DEFAULT_APP_NAME,
    validate: async (input: string) => {
      if (input.length === 0) return "Please enter a name for your app";

      if (await ifDirExists(input))
        return (
          chalk.red(` ${chalk.bold(input)} `) +
          "already exists in the current directory. Please choose another name."
        );

      return true;
    },
    transformer: (input: string) => {
      return chalk.cyan(input);
    },
  });

  return repoName;
};

const getInstallPkgs = async (): Promise<boolean> => {
  const { bool } = await inquirer.prompt({
    name: "bool",
    type: "confirm",
    message: "Would you like to install packages?",
    default: defaultOptions.flags.installPkg,
  });

  return bool;
};

await runCli();
