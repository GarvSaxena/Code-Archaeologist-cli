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
    
    console.log(chalk.bold("Upcoming Options (in development):"));
    console.log(`  --tree                   ${chalk.gray("Show directory tree view")}`);
    console.log(`  --stats                  ${chalk.gray("Show detailed project stats")}\n`);
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

    let targetPath = ".";
    
    // Check for target path
    const pathArg = args.find(arg => !arg.startsWith("--"));
    if (pathArg) {
        targetPath = pathArg;
    }

    const resolvedPath = path.resolve(targetPath);

    if (fs.existsSync(resolvedPath)) {
        console.log(chalk.green(`\nScanning project at: ${resolvedPath}\n`));
        getDirStats(resolvedPath);
    }
    else {
        console.log(chalk.red(`\nInvalid path: ${targetPath}\n`));
    }
}

function getDirStats(dirPath) {

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
        scanDir(dirPath);
    }
    else {
        console.log(chalk.yellow("\nSingle file selected."));
    }

    console.log();
    line();
    console.log(chalk.green.bold("Analysis Complete"));
    line();
}

function scanDir(dirPath) {

    let dirCount = 0;
    let fileCount = 0;
    let totalSize = 0;

    let largestFileName = "None";
    let largestFileSize = 0;

    let smallestFileName = "None";
    let smallestFileSize = Infinity;
    
    let emptyFilesCount = 0;
    let emptyFilesList = [];
    
    let largestFolderName = "None";
    let largestFolderSize = 0;

    const extensions = {};

    section("CONTENTS");

    console.log(
        chalk.bold(`${"Path".padEnd(50)}${"Type".padEnd(15)}Size`)
    );

    console.log(chalk.gray("-".repeat(75)));

    function traverse(currentPath) {
        let currentDirSize = 0;
        const content = fs.readdirSync(currentPath);

        content.forEach((item) => {

            if (
                item === "node_modules" ||
                item === ".git"
            ) {
                return;
            }

            const itemPath = path.join(currentPath, item);
            const itemStats = fs.statSync(itemPath);

            let itemType;

            if (itemStats.isDirectory()) {

                itemType = "Directory";
                dirCount++;
                
                const dirSize = traverse(itemPath);
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
            }

            console.log(
                `${chalk.cyan(itemPath.padEnd(50))}${itemType === "Directory" ? chalk.yellow(itemType.padEnd(15)) : chalk.green(itemType.padEnd(15))}${chalk.magenta(itemStats.size + " B")}`
            );

        });
        
        return currentDirSize;
    }

    traverse(dirPath);

    section("STATISTICS");

    console.log(`${chalk.bold("Directories")} : ${chalk.yellow(dirCount)}`);
    console.log(`${chalk.bold("Files")}       : ${chalk.green(fileCount)}`);
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

        console.log(
            chalk.bold(`${"Extension".padEnd(20)}Count`)
        );

        console.log(chalk.gray("-".repeat(30)));

        for (const ext in extensions) {

            console.log(
                `${chalk.cyan((ext || "[no extension]").padEnd(20))}${chalk.green(extensions[ext])}`
            );
        }
    }
}

init();