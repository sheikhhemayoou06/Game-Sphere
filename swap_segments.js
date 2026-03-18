const fs = require('fs');
const filepath = '/Users/sheikhhemayoou08/Documents/Game Sphere /frontend/src/app/dashboard/page.tsx';
const lines = fs.readFileSync(filepath, 'utf8').split('\n');

// 1. Locate the Updates section
const updateStartStr = "{/* ─── My Updates & News Feed (Player Only) ─── */}";
const updateEndStr = "                        </div>\n                    )";

let updateStartIdx = -1;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("{/* ─── My Updates & News Feed (Player Only) ─── */}")) {
        updateStartIdx = i;
        break;
    }
}

let updateEndIdx = -1;
if (updateStartIdx !== -1) {
    for (let i = updateStartIdx; i < lines.length; i++) {
        if (lines[i].includes("roleGroup === 'player' && (")) {
            // Find the closing of this block
            let openBraces = 0;
            for (let j = i; j < lines.length; j++) {
                if (lines[j].includes("(")) openBraces += (lines[j].match(/\(/g) || []).length;
                if (lines[j].includes(")")) {
                    openBraces -= (lines[j].match(/\)/g) || []).length;
                    if (openBraces <= 0) {
                        updateEndIdx = j;
                        break;
                    }
                }
            }
            break;
        }
    }
}

// 2. Locate the Upcoming Fixtures section
let fixtureStartIdx = -1;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("{/* Upcoming Fixtures — from API data */}")) {
        fixtureStartIdx = i;
        break;
    }
}

let fixtureEndIdx = -1;
if (fixtureStartIdx !== -1) {
    let openTags = 0;
    for (let i = fixtureStartIdx + 1; i < lines.length; i++) {
        if (lines[i].includes("<div")) openTags += (lines[i].match(/<div/g) || []).length;
        if (lines[i].includes("</div")) {
            openTags -= (lines[i].match(/<\/div/g) || []).length;
            if (openTags <= 0) {
                fixtureEndIdx = i;
                break;
            }
        }
    }
}

console.log("Updates bounds:", updateStartIdx, updateEndIdx);
console.log("Fixtures bounds:", fixtureStartIdx, fixtureEndIdx);

if (updateStartIdx !== -1 && updateEndIdx !== -1 && fixtureStartIdx !== -1 && fixtureEndIdx !== -1) {
    // Extract updates logic without the `roleGroup === 'player' && (...)` condition wrapper.
    const updatesBody = lines.slice(updateStartIdx + 2, updateEndIdx).map(line => line.replace(/^                /, ""));

    const newContent = [
        ...lines.slice(0, Math.min(updateStartIdx, fixtureStartIdx))
    ];

    // Build the remaining array by substituting.
    // It's safer to just do a string replace on the full content.
}

