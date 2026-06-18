#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
function line() {
    console.log("============================================================");
}

function section(title) {
    console.log();
    line();
    console.log(title);
    line();
}

function init() {

    line();
    console.log("                    CODE ARCHAEOLOGIST");
    line();

    const args = process.argv.slice(2);
    let targetPath = ".";
    
    // Check for target path
    const pathArg = args.find(arg => !arg.startsWith("--"));
    if (pathArg) {
        targetPath = pathArg;
    }

    const resolvedPath = path.resolve(targetPath);

    if (fs.existsSync(resolvedPath)) {
        console.log(`\nScanning project at: ${resolvedPath}\n`);
        getDirStats(resolvedPath);
    }
    else {
        console.log(`\nInvalid path: ${targetPath}\n`);
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

    console.log(`Name : ${path.basename(dirPath)}`);
    console.log(`Type : ${type}`);

    if (stats.isDirectory()) {
        scanDir(dirPath);
    }
    else {
        console.log("\nSingle file selected.");
    }

    console.log();
    line();
    console.log("Analysis Complete");
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
        `${"Path".padEnd(50)}${"Type".padEnd(15)}Size`
    );

    console.log("-".repeat(75));

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
                `${itemPath.padEnd(50)}${itemType.padEnd(15)}${itemStats.size} B`
            );

        });
        
        return currentDirSize;
    }

    traverse(dirPath);

    section("STATISTICS");

    console.log(`Directories : ${dirCount}`);
    console.log(`Files       : ${fileCount}`);
    console.log(`Total Size  : ${totalSize} B`);

    console.log();

    console.log("Largest File");
    console.log("-".repeat(30));
    console.log(`Name : ${largestFileName}`);
    console.log(`Size : ${largestFileSize} B`);
    console.log();

    console.log("Smallest File");
    console.log("-".repeat(30));
    console.log(`Name : ${smallestFileName === "None" ? "None" : smallestFileName}`);
    console.log(`Size : ${smallestFileSize === Infinity ? 0 : smallestFileSize} B`);
    console.log();
    
    console.log("Largest Folder");
    console.log("-".repeat(30));
    console.log(`Name : ${largestFolderName}`);
    console.log(`Size : ${largestFolderSize} B`);
    console.log();
    
    console.log("Empty Files");
    console.log("-".repeat(30));
    console.log(`Count: ${emptyFilesCount}`);
    if (emptyFilesCount > 0) {
        emptyFilesList.slice(0, 5).forEach(f => console.log(`  - ${f}`));
        if (emptyFilesCount > 5) console.log(`  ... and ${emptyFilesCount - 5} more`);
    }

    section("EXTENSIONS");

    if (Object.keys(extensions).length === 0) {
        console.log("No files found.");
    }
    else {

        console.log(
            `${"Extension".padEnd(20)}Count`
        );

        console.log("-".repeat(30));

        for (const ext in extensions) {

            console.log(
                `${(ext || "[no extension]").padEnd(20)}${extensions[ext]}`
            );
        }
    }
}

init();