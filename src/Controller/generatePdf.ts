import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';
import * as puppeteer from 'puppeteer';
import { Customer } from '../entity/Customer';
import { format } from 'date-fns';

// interface PdfData {
//     logo: string;
//     portName: string;
//     portAddress: string;
//     contact: string;
//     vessel: string;
//     arrivalTime: string;
//     departureTime: string;
//     terms: string;
// }

export async function generatePdf(data: Customer): Promise<Buffer> {
    // Load HTML template
    const templatePath = path.resolve(__dirname, 'template.hbs');
    // console.log("html path: ", templatePath);
    const templateHtml = fs.readFileSync(templatePath, 'utf-8');
    // console.log("templateHtml path: ", templateHtml);
    // Compile HTML with Handlebars
    const template = handlebars.compile(templateHtml);
    const html = template(data);

    console.log("firstname data -data: ", data);
    // console.log("updated html", html);
    // Launch Puppeteer
    // const browser = await puppeteer.launch();
    // const page = await browser.newPage();
    
    // // Set HTML content
    // await page.setContent(html, { waitUntil: 'networkidle0' });
    // console.log("pdfBuffer  page path: ");

    // // Generate PDF
    // const pdfBuffer = await page.pdf({ format: 'A4' });
    
    // // Close Puppeteer
    // await browser.close();
    
    // return pdfBuffer;

    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        timeout: 60000
    });

    const page = await browser.newPage();

    // Preload images and resources
    await page.goto('data:text/html,' + encodeURIComponent(html), {
        waitUntil: 'networkidle0',
        timeout: 60000
    });
    // console.log("before page  page path: ");
    const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        timeout: 60000,
        margin: {
            top: '1in',
            bottom: '1in',
            left: '.5in',
            right: '.5in'
        }
    });

    // console.log("after page  page path: ");
    await browser.close();

    return pdfBuffer;
}
