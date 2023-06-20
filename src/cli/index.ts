#!/usr/bin/env node
import { Command } from "commander";
import inquirer from "inquirer";
import { DEFAULT_APP_NAME } from "../consts.js";
import { ifDirExists, createRepo, figletText } from "../utils/cli.js";
import chalk from "chalk";
import { logger } from "../utils/logger.js";

export interface Options {
  appName: string;
  flags: {
    installPkg: boolean;
    initGit: boolean;
  };
}

const defaultOptions: Readonly<Options> = {
  appName: DEFAULT_APP_NAME,
  flags: {
    installPkg: true,
    initGit: true,
  },
};

const runCli = async () => {
  const program = new Command().name("create-se-2");
  const options: Options = { ...defaultOptions };

  program
    .description("Create a new scaffold-eth-2 app")
    .option(
      "[dir]",
      "The name of the application, as well as the name of the directory to create"
    )
    .option(
      "--noInstall",
      "Explicitly tell the CLI to not run the package manager's install command",
      false
    )
    .option(
      "--noGit",
      "Explicitly tell the CLI to not initialize a git repository",
      false
    )
    .option(
      "-y, --default",
      "By default, the CLI will use all defaults to create a se2 dapp",
      false
    )
    .addHelpText(
      "afterAll",
      `\nThe create-se2 was inspired by ${chalk
        .hex("#E8DCFF")
        .bold(
          "scaffold-eth-2"
        )} and has been used to build awesome fullstack decentralized applications using buidlguidl:${chalk.underline(
        "scaffold-eth"
      )} \n`
    );

  program.parse(process.argv);

  figletText(" Scaffold-eth-2");
  showDescription();

  const args = program.opts();
  console.log(args);

  const appName = program.args[0];

  if (appName) {
    if (await ifDirExists(appName)) {
      logger.error(
        `${appName} already exists. Please try again with a different name`
      );
      return;
    }
    options.appName = appName;
  } else {
    options.appName = await getRepoName();
  }

  if (args["noInstall"]) {
    options.flags.installPkg = false;
  } else {
    options.flags.installPkg = await getInstallPkgs();
  }

  if (args["noGit"]) {
    options.flags.initGit = false;
  } else {
    options.flags.initGit = await getInitGit();
  }

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

const getInitGit = async (): Promise<boolean> => {
  const { bool } = await inquirer.prompt({
    name: "bool",
    type: "confirm",
    message: "Would you like to initialize a git repository?",
    default: defaultOptions.flags.initGit,
  });

  return bool;
};

const showDescription = () => {
  console.log();
};

await runCli();
