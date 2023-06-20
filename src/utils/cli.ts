import chalk from "chalk";
import { exec } from "child_process";
import figlet from "figlet";
import fs from "fs";
import gradient from "gradient-string";
import ora from "ora";
import { Options } from "../cli/index.js";
import { REPO_URL } from "../consts.js";
import { logger } from "./logger.js";

const spinner = (text: string) => {
  return ora({
    text,
    spinner: "dots",
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
    const spin = spinner(
      `Creating ${name} directory and cloning the repo...`
    ).start();
    exec(
      `git clone ${REPO_URL} ${name} && cd ${name} && rm -rf .git`,
      async (err) => {
        if (err) {
          logger.error("\nin error: " + err.message);
          spin.stop();
        }

        spin.succeed(`${name} directory created and repo cloned`);
        await installPkgs(options);
      }
    );

    return true;
  }

  return false;
};

export const installPkgs = async (options: Options) => {
  if (options.flags.installPkg === true) {
    const spin = spinner("Installing packages...").start();

    exec(`cd ${options.appName} && yarn`, (err, _, stderr) => {
      if (err) {
        chalk.red(err.message);
        spin.stopAndPersist({
          symbol: "❌",
          text: "Packages installation failed",
        });
        return;
      }

      if (stderr) {
        chalk.red(stderr);
        spin.stopAndPersist({
          symbol: "❌",
          text: "Packages installation failed",
        });
        return;
      }

      spin.succeed("Packages installed");
    });

    return true;
  }

  return false;
};
