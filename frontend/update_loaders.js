const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src/app');

function walkDir(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walkDir(file));
        } else { 
            if (file.endsWith('.tsx')) results.push(file);
        }
    });
    return results;
}

const files = walkDir(directoryPath);
let updatedCount = 0;

const spinnerRegex = /<div style={{ width: '32px', height: '32px', border: '3px solid #e2e8f0', borderTopColor: '#0ea5e9', borderRadius: '50%', animation: 'spin 1s linear infinite' }}><\/div>/g;
const oldSpinnerRegex = /<div className="animate-spin[^>]+><\/div>/g;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;
    
    if (content.match(spinnerRegex)) {
        content = content.replace(spinnerRegex, '<RunningAthleteLoader />');
        changed = true;
    }
    
    if (changed) {
        // Add import if missing
        if (!content.includes('import RunningAthleteLoader')) {
            // Find PageNavbar import to inject after it, or just match the last import
            const lastImportIdx = content.lastIndexOf('import ');
            const eol = content.indexOf('\n', lastImportIdx);
            
            content = content.substring(0, eol + 1) + "import RunningAthleteLoader from '@/components/RunningAthleteLoader';\n" + content.substring(eol + 1);
        }
        fs.writeFileSync(file, content);
        updatedCount++;
        console.log(`Updated ${file}`);
    }
});

console.log(`Total files updated: ${updatedCount}`);
