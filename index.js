const fs = require("fs");
const readline = require("readline");
const path = require("path");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function showMenu() {
    console.log("\n================================================");
    console.log("              CODE ARCHAEOLOGIST");
    console.log("================================================");

    rl.question("\nEnter the path: ", (dirPath) => {

        if (fs.existsSync(dirPath)) {
            console.log("\nScanning project...\n");
            getDirStats(dirPath);
        }
        else {
            console.log("\n❌ Invalid path!");
            showMenu();
        }
    });
}

function getDirStats(dirPath) {

    const stats = fs.statSync(dirPath);

    let type;

    if (stats.isDirectory()) {
        type = "Directory";
    }
    else if (stats.isFile()) {
        type = "File";
    }

    console.log("Project Information");
    console.log("------------------------------------------------");
    console.log(`Name : ${path.basename(dirPath)}`);
    console.log(`Type : ${type}`);

    if (stats.isDirectory()) {
        showDirContents(dirPath);
    }

    if (stats.isDirectory()) {
        showItemExtensions(dirPath);
    }
    else if (stats.isFile()) {
        console.log("\nSingle file selected.");
    }

    console.log("\n================================================\n");

    rl.close();
}

function showDirContents(dirPath) {

    let dirCount = 0;
    let fileCount = 0;
    let largestFileSize = 0;
    let largestFileName = "";
    let totalSize = 0;
    const content = fs.readdirSync(dirPath);

    console.log("\nContents");
    console.log("------------------------------------------------");

    content.forEach((item) => {

        const itemPath = path.join(dirPath, item);

        const itemStats = fs.statSync(itemPath);

        let itemType;
        
        if (itemStats.isDirectory()) {
            itemType = "Directory";
            dirCount++;
        }
        else if (itemStats.isFile()) {
            itemType = "File";
            fileCount++;
            if(itemStats.size>largestFileSize){
                largestFileSize = itemStats.size;
                largestFileName = item;
            }
        }

        console.log(
            `${item.padEnd(25)} ${itemType.padEnd(12)} ${String(itemStats.size).padStart(8)} B`
        );
        totalSize +=itemStats.size;
    });
    if (fileCount === 0) {
        console.log("Name : None");
        console.log("Size : 0 B");
    }

    console.log("------------------------------------------------");
    console.log(`Directories       : ${dirCount}`);
    console.log(`Files             : ${fileCount}`);
    console.log(`Largest file      : ${largestFileName}      : ${largestFileSize}`)
    console.log(`Total size        : ${totalSize}`)
}

function showItemExtensions(dirPath) {

    const content = fs.readdirSync(dirPath);
    const extensions = {};

    content.forEach((item) => {

        // Complete path
        const itemPath = path.join(dirPath, item);

        // Get stats
        const itemStats = fs.statSync(itemPath);

        // Count only files
        if (itemStats.isFile()) {

            const ext = path.extname(itemPath);

            if (extensions[ext]) {
                extensions[ext]++;
            }
            else {
                extensions[ext] = 1;
            }
        }
    });

    console.log("\nExtensions");
    console.log("------------------------------------------------");

    for (const ext in extensions) {
        console.log(
            `${(ext || "[no extension]").padEnd(20)} ${extensions[ext]}`
        );
    }

    console.log("------------------------------------------------");
}

showMenu();