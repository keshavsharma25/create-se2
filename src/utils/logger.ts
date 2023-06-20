import chalk from "chalk";

export const logger = {
  error(...args: unknown[]) {
    console.log(chalk.rgb(256, 50, 50)(...args));
  },
  warn(...args: unknown[]) {
    console.log(chalk.rgb(228, 208, 10)(...args));
  },
  info(...args: unknown[]) {
    console.log(chalk.cyan(...args));
  },
  success(...args: unknown[]) {
    console.log(chalk.green(...args));
  },
};
