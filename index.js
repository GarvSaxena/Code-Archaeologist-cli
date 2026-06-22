#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");

function line() {
    console.log(chalk.cyan("============================================================"));
}

function section(title) {
    console.log();
    line();
    console.log(chalk.cyan.bold(title));
    line();
}

function showHelp() {
    console.log(chalk.cyan.bold("\nCode Archaeologist - CLI Usage Guide"));
    console.log(chalk.gray("-".repeat(40)));
    console.log(`${chalk.yellow("Usage:")} codearch [path] [options]\n`);
    
    console.log(chalk.bold("Examples:"));
    console.log(`  codearch .               ${chalk.gray("Scan the current directory")}`);
    console.log(`  codearch src             ${chalk.gray("Scan the 'src' folder")}`);
    console.log(`  codearch --help          ${chalk.gray("Show this help menu")}\n`);
    
    console.log(chalk.bold("Options:"));
    console.log(`  --tree                   ${chalk.gray("Show directory tree view")}`);
    console.log(`  --stats                  ${chalk.gray("Show detailed project stats")}`);
    console.log(`  --export                 ${chalk.gray("Export report to codearch-report.json")}\n`);
}

function init() {

    line();
    console.log(chalk.cyan.bold("                    CODE ARCHAEOLOGIST"));
    line();

    const args = process.argv.slice(2);
    
    if (args.includes("--help") || args.includes("-h")) {
        showHelp();
        return;
    }

    const options = {
        tree: args.includes("--tree"),
        stats: args.includes("--stats"),
        export: args.includes("--export")
    };
    
    if (!options.tree && !options.stats) {
        options.tree = true;
        options.stats = true;
    }

    let targetPath = ".";
    const pathArg = args.find(arg => !arg.startsWith("--"));
    if (pathArg) {
        targetPath = pathArg;
    }

    const resolvedPath = path.resolve(targetPath);

    if (fs.existsSync(resolvedPath)) {
        console.log(chalk.green(`\nScanning project at: ${resolvedPath}\n`));
        getDirStats(resolvedPath, options);
    }
    else {
        console.log(chalk.red(`\nInvalid path: ${targetPath}\n`));
    }
}

function getDirStats(dirPath, options) {

    const stats = fs.statSync(dirPath);

    let type;

    if (stats.isDirectory()) {
        type = "Directory";
    }
    else {
        type = "File";
    }

    section("PROJECT INFORMATION");

    console.log(`${chalk.bold("Name")} : ${chalk.green(path.basename(dirPath))}`);
    console.log(`${chalk.bold("Type")} : ${chalk.yellow(type)}`);

    if (stats.isDirectory()) {
        scanDir(dirPath, options);
    }
    else {
        console.log(chalk.yellow("\nSingle file selected."));
    }

    console.log();
    line();
    console.log(chalk.green.bold("Analysis Complete"));
    line();
}

function scanDir(dirPath, options) {

    let dirCount = 0;
    let fileCount = 0;
    let totalSize = 0;
    let totalLinesOfCode = 0;

    let largestFileName = "None";
    let largestFileSize = 0;

    let smallestFileName = "None";
    let smallestFileSize = Infinity;
    
    let emptyFilesCount = 0;
    let emptyFilesList = [];
    
    let largestFolderName = "None";
    let largestFolderSize = 0;

    let todoItems = [];

    const lineHashes = new Set();
    let repeatedLinesCount = 0;

    const extensions = {};
    const countableExtensions = [".js", ".jsx", ".ts", ".tsx", ".html", ".css", ".scss", ".json", ".md", ".txt"];

    if (options.tree) {
        section("DIRECTORY TREE");
        console.log(chalk.yellow(path.basename(dirPath)));
    } else if (options.stats) {
        section("CONTENTS");
        console.log(
            chalk.bold(`${"Path".padEnd(50)}${"Type".padEnd(15)}Size`)
        );
        console.log(chalk.gray("-".repeat(75)));
    }

    function traverse(currentPath, prefix = "") {
        let currentDirSize = 0;
        let content = fs.readdirSync(currentPath);
        
        content = content.filter(item => item !== "node_modules" && item !== ".git");

        content.forEach((item, index) => {
            const isLast = index === content.length - 1;
            const treePrefix = prefix + (isLast ? "└── " : "├── ");
            const nextPrefix = prefix + (isLast ? "    " : "│   ");

            const itemPath = path.join(currentPath, item);
            const itemStats = fs.statSync(itemPath);

            let itemType;

            if (itemStats.isDirectory()) {

                itemType = "Directory";
                dirCount++;
                
                if (options.tree) {
                    console.log(`${treePrefix}${chalk.yellow(item)}`);
                }

                const dirSize = traverse(itemPath, nextPrefix);
                currentDirSize += dirSize;
                
                if (dirSize > largestFolderSize) {
                    largestFolderSize = dirSize;
                    largestFolderName = itemPath;
                }

            }
            else {

                itemType = "File";
                fileCount++;

                totalSize += itemStats.size;
                currentDirSize += itemStats.size;

                if (itemStats.size > largestFileSize) {
                    largestFileSize = itemStats.size;
                    largestFileName = itemPath;
                }
                
                if (itemStats.size < smallestFileSize) {
                    smallestFileSize = itemStats.size;
                    smallestFileName = itemPath;
                }
                
                if (itemStats.size === 0) {
                    emptyFilesCount++;
                    emptyFilesList.push(itemPath);
                }

                const ext = path.extname(itemPath);

                if (extensions[ext]) {
                    extensions[ext]++;
                }
                else {
                    extensions[ext] = 1;
                }
                
                if (countableExtensions.includes(ext) && itemStats.size > 0) {
                    try {
                        const fileContent = fs.readFileSync(itemPath, "utf-8");
                        const lines = fileContent.split("\n");
                        totalLinesOfCode += lines.length;
                        
                        const todoRegex = /\b(TODO|FIXME|BUG|HACK|NOTE)\b/i;
                        lines.forEach((line, lineNum) => {
                            const trimmedLine = line.trim();
                            if (trimmedLine.length > 5) {
                                if (lineHashes.has(trimmedLine)) {
                                    repeatedLinesCount++;
                                } else {
                                    lineHashes.add(trimmedLine);
                                }
                            }

                            if (todoRegex.test(line)) {
                                todoItems.push({
                                    file: itemPath,
                                    line: lineNum + 1,
                                    content: trimmedLine.substring(0, 80)
                                });
                            }
                        });
                    } catch (e) {
                        // Ignore binary or unreadable
                    }
                }

                if (options.tree) {
                    console.log(`${treePrefix}${chalk.cyan(item)}`);
                }
            }

            if (options.stats && !options.tree) {
                console.log(
                    `${chalk.cyan(itemPath.padEnd(50))}${itemType === "Directory" ? chalk.yellow(itemType.padEnd(15)) : chalk.green(itemType.padEnd(15))}${chalk.magenta(itemStats.size + " B")}`
                );
            }

        });
        
        return currentDirSize;
    }

    traverse(dirPath);

    if (options.stats) {
        const pkgPath = path.join(dirPath, "package.json");
        if (fs.existsSync(pkgPath)) {
            try {
                const pkgData = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
                section("PACKAGE ANALYSIS");
                console.log(`${chalk.bold("Name")}        : ${chalk.cyan(pkgData.name || "Unknown")}`);
                console.log(`${chalk.bold("Version")}     : ${chalk.cyan(pkgData.version || "Unknown")}`);
                
                const deps = pkgData.dependencies ? Object.keys(pkgData.dependencies).length : 0;
                const devDeps = pkgData.devDependencies ? Object.keys(pkgData.devDependencies).length : 0;
                const scripts = pkgData.scripts ? Object.keys(pkgData.scripts).length : 0;
                
                console.log(`${chalk.bold("Dependencies")}: ${chalk.yellow(deps)}`);
                console.log(`${chalk.bold("Dev Deps")}    : ${chalk.yellow(devDeps)}`);
                console.log(`${chalk.bold("Scripts")}     : ${chalk.yellow(scripts)}`);
            } catch(e) {}
        }

        if (todoItems.length > 0) {
            section("TODO SCANNER");
            console.log(`${chalk.bold("Total Found")}: ${chalk.yellow(todoItems.length)}\n`);
            todoItems.slice(0, 10).forEach(item => {
                console.log(`${chalk.cyan(item.file)}:${chalk.yellow(item.line)}`);
                console.log(`  ${chalk.gray(item.content)}`);
            });
            if (todoItems.length > 10) {
                console.log(chalk.gray(`\n  ... and ${todoItems.length - 10} more`));
            }
        }

        section("STATISTICS");

        console.log(`${chalk.bold("Directories")} : ${chalk.yellow(dirCount)}`);
        console.log(`${chalk.bold("Files")}       : ${chalk.green(fileCount)}`);
        console.log(`${chalk.bold("Lines of Code")}: ${chalk.green(totalLinesOfCode)}`);
        console.log(`${chalk.bold("Repeated Lines")}: ${chalk.yellow(repeatedLinesCount)}`);
        console.log(`${chalk.bold("Total Size")}  : ${chalk.magenta(totalSize + " B")}`);

        console.log();

        console.log(chalk.bold.blue("Largest File"));
        console.log(chalk.gray("-".repeat(30)));
        console.log(`${chalk.bold("Name")} : ${chalk.cyan(largestFileName)}`);
        console.log(`${chalk.bold("Size")} : ${chalk.magenta(largestFileSize + " B")}`);
        console.log();

        console.log(chalk.bold.blue("Smallest File"));
        console.log(chalk.gray("-".repeat(30)));
        console.log(`${chalk.bold("Name")} : ${chalk.cyan(smallestFileName === "None" ? "None" : smallestFileName)}`);
        console.log(`${chalk.bold("Size")} : ${chalk.magenta((smallestFileSize === Infinity ? 0 : smallestFileSize) + " B")}`);
        console.log();
        
        console.log(chalk.bold.blue("Largest Folder"));
        console.log(chalk.gray("-".repeat(30)));
        console.log(`${chalk.bold("Name")} : ${chalk.cyan(largestFolderName)}`);
        console.log(`${chalk.bold("Size")} : ${chalk.magenta(largestFolderSize + " B")}`);
        console.log();
        
        console.log(chalk.bold.blue("Empty Files"));
        console.log(chalk.gray("-".repeat(30)));
        console.log(`${chalk.bold("Count")}: ${chalk.yellow(emptyFilesCount)}`);
        if (emptyFilesCount > 0) {
            emptyFilesList.slice(0, 5).forEach(f => console.log(chalk.gray(`  - ${f}`)));
            if (emptyFilesCount > 5) console.log(chalk.gray(`  ... and ${emptyFilesCount - 5} more`));
        }

        section("EXTENSIONS");

        if (Object.keys(extensions).length === 0) {
            console.log(chalk.yellow("No files found."));
        }
        else {
            console.log(chalk.bold(`${"Extension".padEnd(20)}Count`));
            console.log(chalk.gray("-".repeat(30)));
            for (const ext in extensions) {
                console.log(
                    `${chalk.cyan((ext || "[no extension]").padEnd(20))}${chalk.green(extensions[ext])}`
                );
            }
        }
    }

    if (options.export) {
        const report = {
            directories: dirCount,
            files: fileCount,
            linesOfCode: totalLinesOfCode,
            repeatedLines: repeatedLinesCount,
            totalSize: totalSize,
            largestFile: { name: largestFileName, size: largestFileSize },
            smallestFile: { name: smallestFileName, size: smallestFileSize },
            largestFolder: { name: largestFolderName, size: largestFolderSize },
            emptyFiles: { count: emptyFilesCount, files: emptyFilesList },
            todoItemsCount: todoItems.length,
            extensions: extensions
        };
        fs.writeFileSync(path.join(process.cwd(), "codearch-report.json"), JSON.stringify(report, null, 2));
        console.log(chalk.green.bold("\nReport exported to codearch-report.json"));
    }
}

init();