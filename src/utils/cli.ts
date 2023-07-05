import chalk from "chalk";
import { execSync } from "child_process";
import { execa } from "execa";
import fs from "fs";
import gradient from "gradient-string";
import ora from "ora";
import { Options } from "../cli/index.js";
import { ASCII_TEXT, REPO_URL } from "../consts.js";

const spinner = (text: string) => {
  return ora({
    text,
    spinner: "dots",
    color: "green",
  });
};

export const figletText = () => {
  console.log(
    gradient.pastel(ASCII_TEXT, {
      hsvSpin: "long",
    })
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
          spin.fail(
            `Repo cloning skipped. Git is not installed! Go to ${chalk.yellow(
              "https://git-scm.com/downloads"
            )} to download it and then ${chalk.red("try again")}.\n`
          );

          return false;
        }

        spin.fail(`Repo cloning failed. ${chalk.red(err.message)}\n`);
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
          spin.fail(
            `Git initialized skipped. Git is not installed! Go to ${chalk.yellow(
              "https://git-scm.com/downloads"
            )} to install it and then ${chalk.red("try again")}.\n`
          );
          return false;
        }
        spin.fail(`Git initialized failed. ${chalk.red(err.message)}\n`);

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
          spin.fail(
            `Yarn is not installed! Go to ${chalk.yellow(
              "https://yarnpkg.com/getting-started/install"
            )} to install it and then ${chalk.red("try again")}.\n`
          );
          return false;
        }
        spin.fail(`Yarn install failed. ${chalk.red(err.message)}\n`);

        return false;
      }
    }
  }

  return false;
};

export const rmDir = async (dir: string) => {
  if (fs.existsSync(dir)) {
    await execa("rm", ["-rf", dir], { cwd: process.cwd() });
  }

  return true;
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
