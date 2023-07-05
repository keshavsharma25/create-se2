import { execSync } from "child_process";
import { execa } from "execa";
import figlet from "figlet";
import fs from "fs";
import gradient from "gradient-string";
import ora from "ora";
import { Options } from "../cli/index.js";
import { REPO_URL } from "../consts.js";
import chalk from "chalk";
import { logger } from "./logger.js";

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
    const filepath = `${process.cwd()}/${options.appName}`;

    spin.start();

    try {
      await execa("git", ["clone", REPO_URL, name], {
        cwd: process.cwd(),
      });

      await execa("rm", ["-rf", ".git"], {
        cwd: filepath,
      });

      spin.succeed(`${chalk.blue(name)} created and repo cloned successfully!`);
    } catch (err) {
      if (err instanceof Error) {
        if (!isGit()) {
          spin.stopAndPersist({
            symbol: "🛑",
            text: `Repo cloning skipped. Git is not installed! Go to ${chalk.yellow(
              "https://git-scm.com/downloads"
            )} to download it.`,
          });

          return false;
        }

        spin.stopAndPersist({
          symbol: "🛑",
          text: `Repo cloning failed. ${chalk.red(err.message)}\n`,
        });
        logger.plain("\n");
        return false;
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
        if (!isGit()) {
          spin.stopAndPersist({
            symbol: "🛑",
            text: "Git initialized skipped. Git is not installed! Go to https://git-scm.com/downloads to install it.\n",
          });
          return false;
        }
        spin.stopAndPersist({
          symbol: "🛑",
          text: `Git initialized failed. ${chalk.red(err.message)}\n`,
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
      await execa("yarn", { cwd: filepath, stdio: "ignore" });
      spin.succeed("Yarn installed");

      return true;
    } catch (err) {
      if (err instanceof Error) {
        if (!isNode()) {
          spin.fail("Node is not installed.");
          return false;
        }

        if (!isYarn()) {
          spin.stopAndPersist({
            symbol: "🛑",
            text: "Yarn is not installed! Go to https://yarnpkg.com/getting-started/install to install it.\n",
          });
          return false;
        }
        spin.stopAndPersist({
          symbol: "🛑",
          text: `Yarn install failed. ${chalk.red(err.message)}\n`,
        });

        return false;
      }
    }
  }

  return false;
};

export const isGit = () => {
  try {
    execSync("git --version", { stdio: "ignore" });
    return true;
  } catch (_e) {
    return false;
  }
};

export const isYarn = () => {
  try {
    execSync("yarn --version", { stdio: "ignore" });
    return true;
  } catch (_e) {
    return false;
  }
};

export const isNode = () => {
  try {
    execSync("node --version", { stdio: "ignore" });
    return true;
  } catch (_e) {
    return false;
  }
};

export const checkNodeVersion = async (dir: string) => {
  try {
    const { stdout: version } = await execa("node", ["--version"], {
      cwd: dir,
    });

    const ver = version.split("v")[1];
    const major = parseInt(ver?.split(".")[0] as string);

    return major >= 18;
  } catch (err) {
    return false;
  }
};
