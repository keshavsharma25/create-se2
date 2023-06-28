import { execa } from "execa";
import figlet from "figlet";
import fs from "fs";
import gradient from "gradient-string";
import ora from "ora";
import { Options } from "../cli/index.js";
import { REPO_URL } from "../consts.js";
import { logger } from "./logger.js";
import chalk from "chalk";

const spinner = (text: string) => {
  return ora({
    text,
    spinner: "circleQuarters",
    color: "blue",
  });
};

export const figletText = (text: string) => {
  console.log(
    gradient.pastel(
      figlet.textSync(text, {
        font: "Small Slant",
        whitespaceBreak: true,
      }),
      {
        hsvSpin: "long",
      }
    )
  );
};

export const ifDirExists = async (name: string) => {
  const currentPath = process.cwd();

  if (fs.existsSync(`${currentPath}/${name}`)) {
    return true;
  }

  return false;
};

export const createRepo = async (options: Options) => {
  const name = options.appName;
  if (!(await ifDirExists(name))) {
    const spin = spinner(`Creating ${name} directory and cloning the repo...`);
    spin.start();
    const filepath = `${process.cwd()}/${options.appName}`;

    try {
      await execa("git", ["clone", REPO_URL, name], { cwd: process.cwd() });
      await execa("rm", ["-rf", ".git"], { cwd: filepath });
      // add a great spin.succeed message
      spin.succeed(`${chalk.blue(name)} created and repo cloned successfully!`);
    } catch (err) {
      if (err instanceof Error) {
        logger.error(err.message);
        spin.stopAndPersist({
          symbol: "❌",
          text: "Directory creation and repo cloning failed",
        });
      }
    }

    return true;
  }

  return false;
};

export const initGit = async (options: Options) => {
  const filepath = `${process.cwd()}/${options.appName}`;

  if (options.flags.initGit === true) {
    const spin = spinner("Initializing git...").start();

    try {
      await execa("git", ["init"], { cwd: filepath });
      await execa("git", ["add", "."], { cwd: filepath });
      await execa("git", ["commit", "-m", "Initial Commit"], { cwd: filepath });
      spin.succeed("Git initialized");

      return true;
    } catch (err) {
      if (err instanceof Error) {
        logger.error(err.message);
        spin.stopAndPersist({
          symbol: "❌",
          text: "Git initialization failed",
        });

        return false;
      }
    }
  }

  return false;
};

export const installPkgs = async (options: Options) => {
  if (options.flags.installPkg === true) {
    const spin = spinner("Yarn installing...").start();
    const filepath = `${process.cwd()}/${options.appName}`;

    try {
      await execa("yarn", { cwd: filepath });
      spin.succeed("Yarn installed");

      return true;
    } catch (err) {
      if (err instanceof Error) {
        logger.error(err.message);
        spin.stopAndPersist({
          symbol: "❌",
          text: "Packages installation failed",
        });

        return false;
      }
    }
  }

  return false;
};
