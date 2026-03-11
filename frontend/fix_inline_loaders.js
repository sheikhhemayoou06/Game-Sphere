const fs = require('fs');

const targets = [
    { file: 'src/app/analytics/page.tsx', search: /<div style={{ fontSize: '18px', fontWeight: 700 }}>Loading Analytics...<\/div>/g },
    { file: 'src/app/documents/page.tsx', search: /<div style={{[^}]+}}>⏳<\/div>Loading documents.../g },
    { file: 'src/app/transfers/page.tsx', search: /<div style={{[^}]+}}>⏳<\/div>Loading transfers.../g },
    { file: 'src/app/tournaments/[id]/page.tsx', search: /<div style={{ color: '#94a3b8', fontSize: '14px' }}>Loading tournament...<\/div>/g },
    { file: 'src/app/tournaments/[id]/fixtures/page.tsx', search: /<div style={{ color: '#94a3b8', fontSize: '14px' }}>Loading fixtures...<\/div>/g },
    { file: 'src/app/tournaments/[id]/teams/page.tsx', search: /<div style={{ color: '#94a3b8', fontSize: '14px' }}>Loading teams...<\/div>/g },
    { file: 'src/app/tournaments/[id]/profile/page.tsx', search: /<div style={{ color: '#94a3b8', fontSize: '14px' }}>Loading profile...<\/div>/g },
    { file: 'src/app/reset-password/page.tsx', search: /<div style={{ color: 'white' }}>Loading...<\/div>/g }
];

let updatedCount = 0;

targets.forEach(target => {
    if (fs.existsSync(target.file)) {
        let content = fs.readFileSync(target.file, 'utf8');

        if (content.match(target.search)) {
            content = content.replace(target.search, '<RunningAthleteLoader />');

            if (!content.includes('import RunningAthleteLoader')) {
                let idx = content.lastIndexOf('import ');
                const eol = content.indexOf('\n', idx);
                content = content.substring(0, eol + 1) + "import RunningAthleteLoader from '@/components/RunningAthleteLoader';\n" + content.substring(eol + 1);
            }
            fs.writeFileSync(target.file, content);
            updatedCount++;
            console.log(`Updated inline loader in ${target.file}`);
        }
    }
});
console.log(`Total inline fixes: ${updatedCount}`);
