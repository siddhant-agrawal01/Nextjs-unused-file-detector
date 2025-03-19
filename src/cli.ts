#!/usr/bin/env node

import { program } from "commander";
import inquirer, { DistinctQuestion } from "inquirer";
import path from "path";
import fs from "fs/promises";
import { globby } from "globby";
import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import resolve from "resolve";
import { createMatchPath } from "tsconfig-paths";
import type { Node, ImportDeclaration, CallExpression, ExportNamedDeclaration, ExportAllDeclaration } from "@babel/types";

/**
 * Collects all JavaScript and TypeScript files in the project, excluding build artifacts.
 * @param projectPath - The root directory of the Next.js project.
 * @returns An array of absolute file paths.
 */
async function getAllFiles(projectPath: string): Promise<string[]> {
  const files = await globby(
    ["**/*.{js,jsx,ts,tsx,JS,JSX,TS,TSX}"],
    {
      cwd: projectPath,
      ignore: ["node_modules", ".next", "build"],
      absolute: true,
      caseSensitiveMatch: false,
      dot: true,
    }
  );
  return files;
}

/**
 * Identifies entry points in a Next.js project based on the specified router type and directory.
 * @param projectPath - The root directory of the Next.js project.
 * @param routerDir - The directory containing the router files (e.g., `app` or `pages`).
 * @param routerType - The type of router ("app" or "pages").
 * @returns An array of absolute paths to entry point files.
 */
async function getEntryPoints(
  projectPath: string,
  routerDir: string,
  routerType: "app" | "pages"
): Promise<string[]> {
  let entryPoints: string[] = [];

  if (routerType === "app") {
    const appEntryPoints = await globby(
      [
        `${routerDir}/**/page.{js,jsx,ts,tsx}`,
        `${routerDir}/**/route.{js,ts}`,
        `${routerDir}/**/layout.{js,jsx,ts,tsx}`,
      ],
      {
        cwd: projectPath,
        ignore: [`${routerDir}/**/_*/**`],
        absolute: true,
        caseSensitiveMatch: false,
      }
    );
    entryPoints = entryPoints.concat(appEntryPoints);
  } else if (routerType === "pages") {
    const pagesEntryPoints = await globby([`${routerDir}/**/*.{js,jsx,ts,tsx}`], {
      cwd: projectPath,
      absolute: true,
      caseSensitiveMatch: false,
    });
    entryPoints = entryPoints.concat(pagesEntryPoints);
  }

  if (entryPoints.length === 0) {
    console.error(
      `Error: No entry points found in ${routerDir}. Please ensure the directory contains the appropriate files.`
    );
    process.exit(1);
  }

  return entryPoints;
}

/**
 * Extracts imported file paths from a given file by parsing its AST.
 * Handles `import` statements, `require` calls, `export ... from`, and dynamic imports.
 * @param filePath - The absolute path to the file.
 * @param projectDir - The root directory of the project.
 * @param configFile - The configuration file to use for path alias resolution ("tsconfig.json" or "jsconfig.json").
 * @returns An array of absolute paths to imported files within the project.
 */
async function getImportedFiles(filePath: string, projectDir: string, configFile: string): Promise<string[]> {
  const code = await fs.readFile(filePath, "utf-8");
  const ast = parse(code, {
    sourceType: "module",
    plugins: ["typescript", "jsx"],
  });

  const importedModules: string[] = [];
  (traverse as any).default(ast, {
    ImportDeclaration({ node }: { node: ImportDeclaration }) {
      importedModules.push(node.source.value);
    },
    ExportNamedDeclaration({ node }: { node: ExportNamedDeclaration }) {
      if (node.source) {
        importedModules.push(node.source.value);
      }
    },
    ExportAllDeclaration({ node }: { node: ExportAllDeclaration }) {
      importedModules.push(node.source.value);
    },
    CallExpression({ node }: { node: CallExpression }) {
      // Handle `require` calls
      if (
        node.callee.type === "Identifier" &&
        node.callee.name === "require" &&
        node.arguments.length === 1 &&
        node.arguments[0].type === "StringLiteral"
      ) {
        importedModules.push((node.arguments[0] as { value: string }).value);
      }
      // Handle dynamic imports (e.g., `import('...')`)
      if (
        node.callee.type === "Import" &&
        node.arguments.length === 1 &&
        node.arguments[0].type === "StringLiteral"
      ) {
        importedModules.push((node.arguments[0] as { value: string }).value);
      }
    },
  });

  // Load tsconfig.json or jsconfig.json for path alias resolution
  let matchPath: ReturnType<typeof createMatchPath> | undefined;
  try {
    const configPath = path.join(projectDir, configFile);
    const config = JSON.parse(await fs.readFile(configPath, "utf-8"));
    const baseUrl = config.compilerOptions?.baseUrl || ".";
    const paths = config.compilerOptions?.paths || {};
    matchPath = createMatchPath(path.resolve(projectDir, baseUrl), paths);
  } catch (err) {
    // Silently fail; we'll fall back to standard resolution
  }

  const importedFiles: string[] = [];
  for (const module of importedModules) {
    try {
      let resolvedPath: string | undefined;
      if (matchPath && module.startsWith("@/")) {
        resolvedPath = matchPath(module, undefined, undefined, [".js", ".jsx", ".ts", ".tsx"]);
      }
      if (!resolvedPath) {
        resolvedPath = resolve.sync(module, {
          basedir: path.dirname(filePath),
          extensions: [".js", ".jsx", ".ts", ".tsx"],
        });
      }
      if (resolvedPath && resolvedPath.startsWith(projectDir)) {
        importedFiles.push(resolvedPath);
      }
    } catch (err) {
      // Silently fail; skip unresolvable imports
    }
  }
  return importedFiles;
}

/**
 * Builds a dependency graph mapping each file to its imported files.
 * @param allFiles - Array of all file paths in the project.
 * @param projectDir - The root directory of the project.
 * @param configFile - The configuration file to use for path alias resolution.
 * @returns A Map where keys are file paths and values are arrays of imported file paths.
 */
async function buildDependencyGraph(
  allFiles: string[],
  projectDir: string,
  configFile: string
): Promise<Map<string, string[]>> {
  const graph = new Map<string, string[]>();
  for (const file of allFiles) {
    const imports = await getImportedFiles(file, projectDir, configFile);
    graph.set(file, imports);
  }
  return graph;
}

/**
 * Determines all files reachable from the entry points using breadth-first search.
 * @param entryPoints - Array of entry point file paths.
 * @param graph - The dependency graph.
 * @returns A Set of reachable file paths.
 */
function getReachableFiles(entryPoints: string[], graph: Map<string, string[]>): Set<string> {
  const reachable = new Set<string>();
  const queue: string[] = [...entryPoints];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (!reachable.has(current)) {
      reachable.add(current);
      const imports = graph.get(current) || [];
      for (const imp of imports) {
        if (!reachable.has(imp)) {
          queue.push(imp);
        }
      }
    }
  }
  return reachable;
}

/**
 * Identifies files that are not reachable from any entry point.
 * @param allFiles - Array of all file paths in the project.
 * @param reachable - Set of reachable file paths.
 * @returns An array of unused file paths.
 */
function getUnusedFiles(allFiles: string[], reachable: Set<string>): string[] {
  return allFiles.filter((file) => !reachable.has(file));
}

/**
 * Main function to run the CLI tool.
 * Prompts the user to specify their project structure and processes the project accordingly.
 */
async function main() {
  program
    .option("-p, --path <path>", "Path to the Next.js project (defaults to current directory)")
    .option("-d, --delete", "Delete unused files after confirmation")
    .option("--dry-run", "List unused files without deleting")
    .parse(process.argv);

  const options = program.opts();

  // Default to current directory if --path is not provided
  const projectPath = options.path ? path.resolve(options.path) : process.cwd();

  // Validate that projectPath is a valid directory
  try {
    const stats = await fs.stat(projectPath);
    if (!stats.isDirectory()) {
      console.error(`Error: The path "${projectPath}" is not a directory. Please provide a valid directory path.`);
      process.exit(1);
    }
  } catch (err) {
    console.error(`Error: The path "${projectPath}" does not exist or is inaccessible.`);
    process.exit(1);
  }

  // Prompt the user to specify their Next.js project structure
  const questions: DistinctQuestion[] = [
    {
      type: "list",
      name: "routerType",
      message: "Which router are you using?",
      choices: ["App Router", "Pages Router"],
    },
    {
      type: "confirm",
      name: "useSrc",
      message: "Is your code inside an `src/` directory?",
      default: false,
    },
    {
      type: "list",
      name: "configType",
      message: "Does your project use TypeScript (tsconfig.json) or JavaScript (jsconfig.json)?",
      choices: ["TypeScript (tsconfig.json)", "JavaScript (jsconfig.json)"],
    },
  ];

  const answers = await inquirer.prompt(questions);
  const routerType = answers.routerType === "App Router" ? "app" : "pages";
  const useSrc = answers.useSrc;
  const configFile = answers.configType === "TypeScript (tsconfig.json)" ? "tsconfig.json" : "jsconfig.json";

  // Determine the router directory based on user input
  const routerDir = useSrc
    ? path.join(projectPath, "src", routerType)
    : path.join(projectPath, routerType);

  // Verify that the specified router directory exists
  try {
    await fs.access(routerDir);
  } catch (err) {
    console.error(
      `Error: The directory ${routerDir} does not exist. Please check your project structure and answers.`
    );
    process.exit(1);
  }

  const allFiles = await getAllFiles(projectPath);
  const entryPoints = await getEntryPoints(projectPath, routerDir, routerType);
  const graph = await buildDependencyGraph(allFiles, projectPath, configFile);
  const reachable = getReachableFiles(entryPoints, graph);
  const unusedFiles = getUnusedFiles(allFiles, reachable);

  if (unusedFiles.length === 0) {
    console.log("No unused files found.");
    return;
  }

  // Log the count of unused files
  console.log(`Found ${unusedFiles.length} unused files.`);
  // List the unused files
  unusedFiles.forEach((file) => console.log(file));

  if (options.delete) {
    const deleteQuestions: DistinctQuestion[] = [
      {
        type: "confirm",
        name: "confirm",
        message: "Do you want to delete these files?",
        default: false,
      },
    ];
    const { confirm } = await inquirer.prompt(deleteQuestions);

    if (confirm) {
      for (const file of unusedFiles) {
        await fs.unlink(file);
      }
      console.log("Deletion complete.");
    } else {
      console.log("Deletion cancelled.");
    }
  } else if (options.dryRun) {
    console.log("Dry run complete: No files were deleted.");
  }
}

// Execute the main function and handle any errors
main().catch((err) => {
  console.error("An error occurred:", err);
  process.exit(1);
});