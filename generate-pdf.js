const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        
        const htmlPath = path.resolve('Game_Sphere_Project_Report.html');
        const pdfPath = path.resolve('Game_Sphere_Complete_Project_Report.pdf');
        
        await page.goto(`file://${htmlPath}`, {waitUntil: 'networkidle0'});
        await page.pdf({
            path: pdfPath,
            format: 'A4',
            printBackground: true,
            displayHeaderFooter: true,
            margin: {
                top: '20mm',
                bottom: '20mm',
                left: '18mm',
                right: '18mm'
            },
            headerTemplate: '<div></div>', // minimal
            footerTemplate: '<div style="font-size: 8px; width: 100%; text-align: right; padding-right: 18px;"><span class="pageNumber"></span>/<span class="totalPages"></span></div>'
        });
        
        console.log('PDF generated successfully at: ' + pdfPath);
        await browser.close();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
