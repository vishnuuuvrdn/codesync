import fs from "fs/promises";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import { v4 as uuid } from "uuid";

const execAsync = promisify(exec);

const TEMP_DIR = path.resolve("temp");

export const runCode = async ({ language, code }) => {
  if (language !== "javascript") {
    throw new Error("Only JavaScript is supported for now.");
  }

  const executionId = uuid();
  const executionFolder = path.join(TEMP_DIR, executionId);

  try {
    await fs.mkdir(executionFolder, { recursive: true });

    const filePath = path.join(executionFolder, "Main.js");
    await fs.writeFile(filePath, code, "utf8");

    // Windows needs forward slashes for Docker volume mounting
    const dockerPath = executionFolder.replace(/\\/g, "/");

    // Run Docker container
    const { stdout, stderr } = await execAsync(
      `docker run --rm -v "${dockerPath}:/app" codesync-js`,
    );

    return {
      stdout,
      stderr,
      exitCode: 0,
    };
  } catch (error) {
    return {
      stdout: error.stdout || "",
      stderr: error.stderr || error.message,
      exitCode: error.code || 1,
    };
  } finally {
    // Clean up temp folder
    await fs.rm(executionFolder, {
      recursive: true,
      force: true,
    });
  }
};
