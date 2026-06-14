import { exec } from "child_process";

export async function runCommand(command) {
  return new Promise((resolve) => {
    exec(command, (error, stdout, stderr) => {
      resolve({
        success: !error,
        stdout,
        stderr,
        error: error?.message || null,
      });
    });
  });
}
