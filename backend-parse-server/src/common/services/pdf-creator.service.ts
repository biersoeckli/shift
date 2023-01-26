import puppeteer from 'puppeteer';
import { Service } from 'typedi';

@Service()
export class PdfCreatorService {

    /**
     * Generates pdf from html string.
     * @returns base64 string
     */
    async generateFromHtml(htmlString: string) {

        if (!htmlString) {
            throw new Error('Cannot generate PDF without any content');
        }

        // Create a browser instance
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox']
        });

        try {
            // Create a new page
            const page = await browser.newPage();

            //Get HTML content from HTML file
            await page.setContent(htmlString, { waitUntil: 'domcontentloaded' });

            // To reflect CSS used for screens instead of print
            await page.emulateMediaType('screen');

            // Downlaod the PDF
            const generatedPdf = await page.pdf({
                margin: { top: '40px', right: '40px', bottom: '40px', left: '40px' },
                printBackground: true,
                format: 'A4',
            });
            return generatedPdf;

        } finally {
            // Close the browser instance
            await browser.close();
        }
    }
}