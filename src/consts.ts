import figlet from "figlet";

export const CREATE_SCAFFOLD_ETH = "create-se2";
export const DEFAULT_APP_NAME = "scaffold-eth-2";
export const REPO_URL = "https://github.com/scaffold-eth/scaffold-eth-2.git";
export const ASCII_TEXT = figlet.textSync(CREATE_SCAFFOLD_ETH, {
  font: "Standard",
  horizontalLayout: "default",
  verticalLayout: "default",
  whitespaceBreak: true,
});
