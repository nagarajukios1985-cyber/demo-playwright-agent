import { exec } from "child_process";

const blockedCommands = [
  "rm -rf",
  "sudo",
  "shutdown",
  "reboot",
  "mkfs",
  "dd ",
  "chmod 777"
];

export async function runCommand(command) {
  const normalizedCommand = command.toLowerCase();

  const blocked = blockedCommands.find((item) =>
    normalizedCommand.includes(item)
  );

  if (blocked) {
    return {
      success: false,
      stdout: "",
      stderr: "",
      error: `Blocked unsafe command containing: ${blocked}`
    };
  }

  return new Promise((resolve) => {
    exec(command, (error, stdout, stderr) => {
      resolve({
        success: !error,
        stdout,
        stderr,
        error: error?.message || null
      });
    });
  });
}