import fs from "fs/promises";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import { v4 as uuid } from "uuid";
import { LANGUAGES } from "../config/languages.js";

const execAsync = promisify(exec);

const TEMP_DIR = path.resolve("temp");

export const runCode = async ({ language, code }) => {
  const config = LANGUAGES[language];

  if (!config) {
    throw new Error(`Unsupported language: ${language}`);
  }

  const executionId = uuid();
  const executionFolder = path.join(TEMP_DIR, executionId);
  const filePath = path.join(executionFolder, config.fileName);

  const start = Date.now();

  try {
    // Create execution directory
    await fs.mkdir(executionFolder, { recursive: true });

    // Write user's code
    await fs.writeFile(filePath, code, "utf8");

    // Docker requires forward slashes on Windows
    const dockerPath = executionFolder.replace(/\\/g, "/");

    const command = [
      "docker run",
      "--rm",
      "--network none",
      "--memory=128m",
      "--cpus=0.5",
      `-v "${dockerPath}:/app"`,
      config.image,
    ].join(" ");

    const { stdout, stderr } = await execAsync(command, {
      timeout: 5000,
    });

    return {
      stdout,
      stderr,
      exitCode: 0,
      executionTime: Date.now() - start,
    };
  } catch (error) {
    return {
      stdout: error.stdout || "",
      stderr: error.stderr || error.message,
      exitCode: typeof error.code === "number" ? error.code : 1,
      executionTime: Date.now() - start,
    };
  } finally {
    try {
      await fs.rm(executionFolder, {
        recursive: true,
        force: true,
      });
    } catch {
      // Ignore cleanup errors
    }
  }
};
