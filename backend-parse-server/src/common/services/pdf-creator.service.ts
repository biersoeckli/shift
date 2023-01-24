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
                path: 'result.pdf',
                margin: { top: '30px', right: '30px', bottom: '30px', left: '30px' },
                printBackground: true,
                format: 'A4',
            });
            /*
            var mime = 'application/pdf';
            var encoding = 'base64';
            var base64Uri = 'data:' + mime + ';' + encoding + ',' + generatedPdf.toString('base64');
*/
            return this.toArrayBuffer(generatedPdf);

        } finally {
            // Close the browser instance
            await browser.close();
        }
    }

    toArrayBuffer(buf: Buffer) {
        const ab = new ArrayBuffer(buf.length);
        const view = new Uint8Array(ab);
        for (let i = 0; i < buf.length; ++i) {
            view[i] = buf[i];
        }
        return view;
    }
}