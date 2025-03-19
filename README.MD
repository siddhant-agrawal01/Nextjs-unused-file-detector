[![npm version](https://badge.fury.io/js/@siddhant%2Funused-file-detector.svg)](https://www.npmjs.com/package/@siddhant/unused-file-detector)

# Unused File Detector for Next.js

A CLI tool to identify and optionally delete unused JavaScript and TypeScript files in your Next.js projects. This tool analyzes your project's dependency graph to find files that are not reachable from your entry points, helping you keep your codebase clean and efficient.

## Features
- Supports both **App Router** and **Pages Router** in Next.js.
- Works with projects using `src/` directory or root-level structure.
- Handles both TypeScript (`tsconfig.json`) and JavaScript (`jsconfig.json`) projects.
- Resolves path aliases (e.g., `@/components`) for accurate dependency tracking.
- Provides a dry-run mode to list unused files without deleting them.
- Optionally deletes unused files after user confirmation.

## Installation

### Prerequisites
- **Node.js**: Version 14 or higher.
- **Next.js**: A Next.js project (version 12 or higher recommended).

### Steps
1. **Clone the Repository** (if you’re contributing or using the source code):
   ```bash
   git clone https://github.com/your-username/nextjs-unused-file-cleaner.git
   cd nextjs-unused-file-cleaner
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Build the Tool**:
   ```bash
   npm run build
   ```

4. **Link the CLI Globally** (to use the `unused-file-detector` command anywhere):
   ```bash
   npm link
   ```

   If you encounter permission issues, you might need to use `sudo`:
   ```bash
   sudo npm link
   ```

## Usage

The `unused-file-detector` tool is designed to be simple and interactive. It prompts you for your project structure and then identifies unused files. You can run it in **dry-run** mode to list unused files or use the `--delete` flag to delete them after confirmation.

### Command Syntax
```bash
unused-file-detector --path <path-to-project> [--dry-run | --delete]
```
- `--path <path-to-project>`: Path to your Next.js project (defaults to the current directory if not specified).
- `--dry-run`: Lists unused files without deleting them (default mode).
- `--delete`: Lists unused files and prompts for confirmation to delete them.

### Step-by-Step Examples

#### Scenario 1: App Router with `src/` Directory (TypeScript Project)
**Project**: `cipher-portfolio` (a TypeScript-based Next.js project using App Router with code in `src/`).

1. **Navigate to Your Project**:
   ```bash
   cd /path/to/cipher-portfolio
   ```

2. **Run the Tool in Dry-Run Mode**:
   ```bash
   unused-file-detector --path . --dry-run
   ```

3. **Answer the Prompts**:
   - **Which router are you using?** → Select `App Router`.
   - **Is your code inside an `src/` directory?** → Select `Yes`.
   - **Does your project use TypeScript (tsconfig.json) or JavaScript (jsconfig.json)?** → Select `TypeScript (tsconfig.json)`.

4. **View the Output**:
   ```
   Found 102 unused files.
   /path/to/cipher-portfolio/next-env.d.ts
   /path/to/cipher-portfolio/postcss.config.js
   /path/to/cipher-portfolio/src/app/not-found.tsx
   [... other unused files ...]
   Dry run complete: No files were deleted.
   ```

5. **Delete Unused Files (Optional)**:
   To delete the unused files, run:
   ```bash
   unused-file-detector --path . --delete
   ```
   - After listing the unused files, the tool will prompt: `Do you want to delete these files? [y/N]`.
   - Type `y` and press Enter to delete the files, or `n` to cancel.

#### Scenario 2: App Router without `src/` Directory (JavaScript Project)
**Project**: A JavaScript-based Next.js project using App Router with code directly in the root (e.g., `app/`).

1. **Navigate to Your Project**:
   ```bash
   cd /path/to/my-nextjs-app
   ```

2. **Run the Tool**:
   ```bash
   unused-file-detector --path . --dry-run
   ```

3. **Answer the Prompts**:
   - **Which router are you using?** → Select `App Router`.
   - **Is your code inside an `src/` directory?** → Select `No`.
   - **Does your project use TypeScript (tsconfig.json) or JavaScript (jsconfig.json)?** → Select `JavaScript (jsconfig.json)`.

4. **View the Output**:
   ```
   Found 5 unused files.
   /path/to/my-nextjs-app/app/utils/helper.js
   /path/to/my-nextjs-app/components/OldComponent.jsx
   [... other unused files ...]
   Dry run complete: No files were deleted.
   ```

#### Scenario 3: Pages Router with `src/` Directory (TypeScript Project)
**Project**: A TypeScript-based Next.js project using Pages Router with code in `src/`.

1. **Navigate to Your Project**:
   ```bash
   cd /path/to/my-pages-router-app
   ```

2. **Run the Tool**:
   ```bash
   unused-file-detector --path . --dry-run
   ```

3. **Answer the Prompts**:
   - **Which router are you using?** → Select `Pages Router`.
   - **Is your code inside an `src/` directory?** → Select `Yes`.
   - **Does your project use TypeScript (tsconfig.json) or JavaScript (jsconfig.json)?** → Select `TypeScript (tsconfig.json)`.

4. **View the Output**:
   ```
   Found 3 unused files.
   /path/to/my-pages-router-app/src/pages/_oldpage.tsx
   /path/to/my-pages-router-app/src/utils/deprecated.ts
   [... other unused files ...]
   Dry run complete: No files were deleted.
   ```

#### Scenario 4: Pages Router without `src/` Directory (JavaScript Project)
**Project**: A JavaScript-based Next.js project using Pages Router with code in the root (e.g., `pages/`).

1. **Navigate to Your Project**:
   ```bash
   cd /path/to/my-old-nextjs-app
   ```

2. **Run the Tool**:
   ```bash
   unused-file-detector --path . --dry-run
   ```

3. **Answer the Prompts**:
   - **Which router are you using?** → Select `Pages Router`.
   - **Is your code inside an `src/` directory?** → Select `No`.
   - **Does your project use TypeScript (tsconfig.json) or JavaScript (jsconfig.json)?** → Select `JavaScript (jsconfig.json)`.

4. **View the Output**:
   ```
   No unused files found.
   ```

### Running Without `--path` (Current Directory)
If you’re already in your project directory, you can omit the `--path` flag:
```bash
cd /path/to/my-nextjs-app
unused-file-detector --dry-run
```

## Troubleshooting

### Common Issues
1. **Error: The directory ... does not exist**:
   - Ensure you answered the prompts correctly. For example, if your project uses App Router with `src/`, the `src/app` directory must exist.
   - Double-check your project structure.

2. **No unused files found (but you expect some)**:
   - The tool might not be detecting all entry points. Ensure your `page.tsx`, `layout.tsx`, or `route.ts` files are correctly named and located in the expected directory (`app/` or `pages/`).
   - If you’re using dynamic imports or runtime imports, the tool might not detect them. Consider manually verifying the files.

3. **Too many unused files reported**:
   - Some files might be used dynamically (e.g., via runtime imports). The tool currently only detects static imports (`import`, `require`, `export ... from`, dynamic `import()`).
   - Verify a few files from the list to confirm if they are truly unused.

4. **Alias imports not resolving**:
   - Ensure your `tsconfig.json` or `jsconfig.json` has the correct `baseUrl` and `paths` settings. For example:
     ```json
     {
       "compilerOptions": {
         "baseUrl": "src",
         "paths": {
           "@/*": ["*"]
         }
       }
     }
     ```
   - Make sure you selected the correct configuration file (`tsconfig.json` or `jsconfig.json`) when prompted.

### Debugging
If you encounter issues, you can modify the `cli.ts` file to add debug logging (e.g., log all found files, resolved aliases, etc.) and rebuild the tool.

## Contributing

Contributions are welcome! If you’d like to improve the tool, follow these steps:

1. **Fork the Repository**:
   ```bash
   git clone https://github.com/your-username/nextjs-unused-file-cleaner.git
   cd nextjs-unused-file-cleaner
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Make Changes**:
   - Edit `cli.ts` or other files as needed.
   - Test your changes locally:
     ```bash
     npm run build
     npm link
     cd /path/to/your-test-project
     unused-file-detector --path . --dry-run
     ```

4. **Submit a Pull Request**:
   - Push your changes to your fork and create a pull request on the main repository.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments
- Built with [Commander.js](https://github.com/tj/commander.js) for CLI functionality.
- Uses [Inquirer.js](https://github.com/SBoudrias/Inquirer.js) for interactive prompts.
- Dependency graph built with [Babel](https://babeljs.io/) for parsing JavaScript/TypeScript files.
- Path alias resolution powered by [tsconfig-paths](https://github.com/dividab/tsconfig-paths).

---

### Raw Markdown Code for `README.md`
Copy and paste the following code into your `README.md` file:

```markdown
# Unused File Detector for Next.js

A CLI tool to identify and optionally delete unused JavaScript and TypeScript files in your Next.js projects. This tool analyzes your project's dependency graph to find files that are not reachable from your entry points, helping you keep your codebase clean and efficient.

## Features
- Supports both **App Router** and **Pages Router** in Next.js.
- Works with projects using `src/` directory or root-level structure.
- Handles both TypeScript (`tsconfig.json`) and JavaScript (`jsconfig.json`) projects.
- Resolves path aliases (e.g., `@/components`) for accurate dependency tracking.
- Provides a dry-run mode to list unused files without deleting them.
- Optionally deletes unused files after user confirmation.

## Installation

### Prerequisites
- **Node.js**: Version 14 or higher.
- **Next.js**: A Next.js project (version 12 or higher recommended).

### Steps
1. **Clone the Repository** (if you’re contributing or using the source code):
   ```bash
   git clone https://github.com/your-username/nextjs-unused-file-cleaner.git
   cd nextjs-unused-file-cleaner
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Build the Tool**:
   ```bash
   npm run build
   ```

4. **Link the CLI Globally** (to use the `unused-file-detector` command anywhere):
   ```bash
   npm link
   ```

   If you encounter permission issues, you might need to use `sudo`:
   ```bash
   sudo npm link
   ```

## Usage

The `unused-file-detector` tool is designed to be simple and interactive. It prompts you for your project structure and then identifies unused files. You can run it in **dry-run** mode to list unused files or use the `--delete` flag to delete them after confirmation.

### Command Syntax
```bash
unused-file-detector --path <path-to-project> [--dry-run | --delete]
```
- `--path <path-to-project>`: Path to your Next.js project (defaults to the current directory if not specified).
- `--dry-run`: Lists unused files without deleting them (default mode).
- `--delete`: Lists unused files and prompts for confirmation to delete them.

### Step-by-Step Examples

#### Scenario 1: App Router with `src/` Directory (TypeScript Project)
**Project**: `cipher-portfolio` (a TypeScript-based Next.js project using App Router with code in `src/`).

1. **Navigate to Your Project**:
   ```bash
   cd /path/to/cipher-portfolio
   ```

2. **Run the Tool in Dry-Run Mode**:
   ```bash
   unused-file-detector --path . --dry-run
   ```

3. **Answer the Prompts**:
   - **Which router are you using?** → Select `App Router`.
   - **Is your code inside an `src/` directory?** → Select `Yes`.
   - **Does your project use TypeScript (tsconfig.json) or JavaScript (jsconfig.json)?** → Select `TypeScript (tsconfig.json)`.

4. **View the Output**:
   ```
   Found 102 unused files.
   /path/to/cipher-portfolio/next-env.d.ts
   /path/to/cipher-portfolio/postcss.config.js
   /path/to/cipher-portfolio/src/app/not-found.tsx
   [... other unused files ...]
   Dry run complete: No files were deleted.
   ```

5. **Delete Unused Files (Optional)**:
   To delete the unused files, run:
   ```bash
   unused-file-detector --path . --delete
   ```
   - After listing the unused files, the tool will prompt: `Do you want to delete these files? [y/N]`.
   - Type `y` and press Enter to delete the files, or `n` to cancel.

#### Scenario 2: App Router without `src/` Directory (JavaScript Project)
**Project**: A JavaScript-based Next.js project using App Router with code directly in the root (e.g., `app/`).

1. **Navigate to Your Project**:
   ```bash
   cd /path/to/my-nextjs-app
   ```

2. **Run the Tool**:
   ```bash
   unused-file-detector --path . --dry-run
   ```

3. **Answer the Prompts**:
   - **Which router are you using?** → Select `App Router`.
   - **Is your code inside an `src/` directory?** → Select `No`.
   - **Does your project use TypeScript (tsconfig.json) or JavaScript (jsconfig.json)?** → Select `JavaScript (jsconfig.json)`.

4. **View the Output**:
   ```
   Found 5 unused files.
   /path/to/my-nextjs-app/app/utils/helper.js
   /path/to/my-nextjs-app/components/OldComponent.jsx
   [... other unused files ...]
   Dry run complete: No files were deleted.
   ```

#### Scenario 3: Pages Router with `src/` Directory (TypeScript Project)
**Project**: A TypeScript-based Next.js project using Pages Router with code in `src/`.

1. **Navigate to Your Project**:
   ```bash
   cd /path/to/my-pages-router-app
   ```

2. **Run the Tool**:
   ```bash
   unused-file-detector --path . --dry-run
   ```

3. **Answer the Prompts**:
   - **Which router are you using?** → Select `Pages Router`.
   - **Is your code inside an `src/` directory?** → Select `Yes`.
   - **Does your project use TypeScript (tsconfig.json) or JavaScript (jsconfig.json)?** → Select `TypeScript (tsconfig.json)`.

4. **View the Output**:
   ```
   Found 3 unused files.
   /path/to/my-pages-router-app/src/pages/_oldpage.tsx
   /path/to/my-pages-router-app/src/utils/deprecated.ts
   [... other unused files ...]
   Dry run complete: No files were deleted.
   ```

#### Scenario 4: Pages Router without `src/` Directory (JavaScript Project)
**Project**: A JavaScript-based Next.js project using Pages Router with code in the root (e.g., `pages/`).

1. **Navigate to Your Project**:
   ```bash
   cd /path/to/my-old-nextjs-app
   ```

2. **Run the Tool**:
   ```bash
   unused-file-detector --path . --dry-run
   ```

3. **Answer the Prompts**:
   - **Which router are you using?** → Select `Pages Router`.
   - **Is your code inside an `src/` directory?** → Select `No`.
   - **Does your project use TypeScript (tsconfig.json) or JavaScript (jsconfig.json)?** → Select `JavaScript (jsconfig.json)`.

4. **View the Output**:
   ```
   No unused files found.
   ```

### Running Without `--path` (Current Directory)
If you’re already in your project directory, you can omit the `--path` flag:
```bash
cd /path/to/my-nextjs-app
unused-file-detector --dry-run
```

## Troubleshooting

### Common Issues
1. **Error: The directory ... does not exist**:
   - Ensure you answered the prompts correctly. For example, if your project uses App Router with `src/`, the `src/app` directory must exist.
   - Double-check your project structure.

2. **No unused files found (but you expect some)**:
   - The tool might not be detecting all entry points. Ensure your `page.tsx`, `layout.tsx`, or `route.ts` files are correctly named and located in the expected directory (`app/` or `pages/`).
   - If you’re using dynamic imports or runtime imports, the tool might not detect them. Consider manually verifying the files.

3. **Too many unused files reported**:
   - Some files might be used dynamically (e.g., via runtime imports). The tool currently only detects static imports (`import`, `require`, `export ... from`, dynamic `import()`).
   - Verify a few files from the list to confirm if they are truly unused.

4. **Alias imports not resolving**:
   - Ensure your `tsconfig.json` or `jsconfig.json` has the correct `baseUrl` and `paths` settings. For example:
     ```json
     {
       "compilerOptions": {
         "baseUrl": "src",
         "paths": {
           "@/*": ["*"]
         }
       }
     }
     ```
   - Make sure you selected the correct configuration file (`tsconfig.json` or `jsconfig.json`) when prompted.

### Debugging
If you encounter issues, you can modify the `cli.ts` file to add debug logging (e.g., log all found files, resolved aliases, etc.) and rebuild the tool.

## Contributing

Contributions are welcome! If you’d like to improve the tool, follow these steps:

1. **Fork the Repository**:
   ```bash
   git clone https://github.com/your-username/nextjs-unused-file-cleaner.git
   cd nextjs-unused-file-cleaner
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Make Changes**:
   - Edit `cli.ts` or other files as needed.
   - Test your changes locally:
     ```bash
     npm run build
     npm link
     cd /path/to/your-test-project
     unused-file-detector --path . --dry-run
     ```

4. **Submit a Pull Request**:
   - Push your changes to your fork and create a pull request on the main repository.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments
- Built with [Commander.js](https://github.com/tj/commander.js) for CLI functionality.
- Uses [Inquirer.js](https://github.com/SBoudrias/Inquirer.js) for interactive prompts.
- Dependency graph built with [Babel](https://babeljs.io/) for parsing JavaScript/TypeScript files.
- Path alias resolution powered by [tsconfig-paths](https://github.com/dividab/tsconfig-paths).
```

---

### Instructions to Add the README
1. **Create or Update `README.md`**:
   - In your project directory (`/home/siddhant/nextjs-unused-file-cleaner`), create a file named `README.md` if it doesn’t exist, or open the existing one.
   - Copy the raw Markdown code above and paste it into `README.md`.

2. **Update the Repository URL**:
   - Replace `https://github.com/your-username/nextjs-unused-file-cleaner.git` with the actual URL of your repository (if you’re hosting it on GitHub or another platform).

3. **Save and Commit**:
   - Save the file and commit it to your repository:
     ```bash
     git add README.md
     git commit -m "Add detailed README for unused-file-detector"
     git push origin main
     ```

---

### Why This README Is Senior-Level
- **Clarity and Structure**: The README is well-organized with clear sections (Installation, Usage, Troubleshooting, etc.), making it easy for users to understand and use the tool.
- **Comprehensive Examples**: It covers all four scenarios (App Router/Pages Router, with/without `src/`, TypeScript/JavaScript), ensuring users with different project structures can use the tool.
- **Detailed Instructions**: Each step is explained with commands and expected outputs, reducing ambiguity.
- **Troubleshooting Section**: Anticipates common issues and provides actionable solutions, showing foresight and experience.
- **Professional Tone**: The language is concise, professional, and focused on the user’s needs, with proper formatting for readability.

Let me know if you’d like to add more sections (e.g., a FAQ, more examples, or a changelog) to the README!
