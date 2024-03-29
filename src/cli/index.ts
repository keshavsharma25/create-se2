#!/usr/bin/env node
import chalk from "chalk";
import { Command } from "commander";
import inquirer from "inquirer";
import { CREATE_SCAFFOLD_ETH, DEFAULT_APP_NAME } from "../consts.js";
import {
  checkNodeVersion,
  createRepo,
  figletText,
  ifDirExists,
  initGit,
  installPkgs,
  rmDir,
} from "../utils/cli.js";
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
  const program = new Command().name(CREATE_SCAFFOLD_ETH);
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
      "By default, the CLI will use all defaults to create a se2 app",
      false
    )
    .addHelpText(
      "afterAll",
      `\ncreate-se2 is a template CLI tool built to create ${chalk
        .hex("#E8DCFF")
        .bold("scaffold-eth-2")} apps.`
    );

  program.parse(process.argv);

  figletText();

  if (!(await checkNodeVersion(process.cwd()))) {
    logger.warn(
      "\nScaffold-eth-2 requires Node.js version >= 18 to make it work properly. Please update your Node.js version.\n"
    );
  }

  const args = program.opts();

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

  if (args["noGit"]) {
    options.flags.initGit = false;
  } else {
    options.flags.initGit = await getInitGit();
  }

  if (args["noInstall"]) {
    options.flags.installPkg = false;
  } else {
    options.flags.installPkg = await getInstallPkgs();
  }

  logger.plain(`\n${chalk.magenta("⚙️ Scaffolding your app...")}\n`);

  const boolCreateRepo = await createRepo(options);

  let bool: Boolean = boolCreateRepo;

  if (options.flags.initGit && options.flags.installPkg) {
    const boolInitGit = boolCreateRepo && (await initGit(options));
    bool = boolInitGit && (await installPkgs(options));
  }

  if (options.flags.initGit && !options.flags.installPkg) {
    bool = boolCreateRepo && (await initGit(options));
  }

  if (!options.flags.initGit && options.flags.installPkg) {
    bool = boolCreateRepo && (await installPkgs(options));
  }

  !bool && (await rmDir(options.appName));

  bool && getSuccessMsg(options);
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

const getSuccessMsg = (options: Options) => {
  logger.success(
    `\nYour ${chalk.bold(options.appName)} app has been created successfully!`
  );
  logger.plain(
    "\nTo get started, run the following commands:",
    `\n\n\t${
      chalk.gray.bold("$ ") + chalk.whiteBright(`cd ${options.appName}`)
    }`
  );

  !options.flags.installPkg &&
    logger.plain(
      `\n\t${
        chalk.gray.bold("$ ") + chalk.whiteBright("yarn install")
      } ${chalk.gray("// install dependencies")}`
    );

  logger.plain(
    `\n\t${
      chalk.gray.bold("$ ") + chalk.whiteBright("yarn start")
    } ${chalk.gray("// start your NextJS app")}`,
    `\n\n\t${
      chalk.gray.bold("$ ") + chalk.whiteBright("yarn chain")
    } ${chalk.gray("// start your Local Hardhat node")}`,
    `\n\n\t${
      chalk.gray.bold("$ ") + chalk.whiteBright("yarn deploy")
    } ${chalk.gray("// deploy your contracts to your local chain")}`,
    `\n\n\t${
      chalk.gray.bold("$ ") + chalk.whiteBright("yarn fork")
    } ${chalk.gray("// fork the mainnet to your local chain")}`,
    `\n\n`
  );
};

await runCli();
