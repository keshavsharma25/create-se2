#!/usr/bin/env node
import { exec } from "child_process";
import inquirer from "inquirer";
import { DEFAULT_APP_NAME } from "../consts.js";
import ora from "ora";

let _repoName: string;

async function getDirName() {
  const answers = await inquirer.prompt({
    name: "repo_name",
    type: "input",
    message: "Enter the name of repo",
    default() {
      return DEFAULT_APP_NAME;
    },
  });
  _repoName = answers.repo_name;
}

async function createRepo() {
  ora("Creating repo...").start();
  await exec(
    `cd .. && git clone https://github.com/scaffold-eth/scaffold-eth-2.git ${_repoName} && cd se2 && rm -rf .git`,
    (err, stdout, stderr) => {
      if (err) {
        ora("app creation failed").stop();
        return;
      }
      console.log("stdout: ", stdout);
      if (stderr) {
        ora("scaffold-eth app created successfully").succeed();
        ora("").stop();
        process.exit(0);
      }
    }
  );
}

await getDirName();
await createRepo();
