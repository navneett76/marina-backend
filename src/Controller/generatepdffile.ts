import puppeteer from 'puppeteer';

export async function generatePDFFile (){
    
const htmlContent = `

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice</title>
  <style>
    body {
      font-family: Arial, sans-serif;
    }
    .container {
      display: flex;
      flex-direction: column;
      width: 80%;
      margin: auto;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid #ccc;
    }
    .details {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      margin-top: 20px;
    }
    .footer {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px 0;
      margin-top: 40px;
      border-top: 1px solid #ccc;
    }

    .invoice-container {
            padding: 20px;
            font-family: Arial, sans-serif;
            border: 1px solid #011689;
            border-radius: 10px;
        }

        .invoice-header {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }

        .invoice-logo {
            height: 100px;
        }

        .ship-address {
            text-align: center;
        }

        .ship-address>h1 {
            color: #011689;
        }

        section.invoice-details {
            border: 1px solid #011689;
            border-radius: 2px;
            display: flex;
            margin-bottom: 1px;
        }

        .invoice-first-child,
        .invoice-second-child {
            width: 48%;
            padding: 1%;
            padding-left: 15px;
        }

        .invoice-first-child {
            border-right: 1px solid #011689;
        }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        <h1>Invoice</h1>
      </div>
      <div>
        <img src="logo.png" alt="Company Logo" style="height: 50px;">
      </div>
    </div>
    <div class="details">
      <div>
        <h2>Contact Information</h2>
        <p>Name: John Doe</p>
        <p>Email: john.doe@example.com</p>
      </div>
      <div>
        <h2>Vessel Information</h2>
        <p>Vessel: SS Enterprise</p>
        <p>Beam: 30m</p>
      </div>
    </div>
    <div class="footer">
      <p>Terms and Conditions apply</p>
    </div>
  </div>

  
</body>
</html>

`;

//   const browser = await puppeteer.launch();
//   const page = await browser.newPage();

//   // Set HTML content
//   await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

  // Generate PDF
//   const pdf = await page.pdf({
//     format: 'A4',
//     printBackground: true, // Ensures background colors and images are included
//   });

const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    timeout: 60000
});

const page = await browser.newPage();

// Preload images and resources
await page.goto('data:text/html,' + encodeURIComponent(htmlContent), {
    waitUntil: 'networkidle0',
    timeout: 60000
});
console.log("before page  page path: ");
const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    timeout: 60000
});

console.log("after page  page path: ");
await browser.close();

return pdfBuffer;

//   await browser.close();
//   return pdf;
};

// export generatePDFFile;

// generatePDF().then((pdf) => {
//   // Do something with the PDF (e.g., save to file, send as response)
//   // For example, to save the PDF to a file:
//   const fs = require('fs');
//   fs.writeFileSync('invoice.pdf', pdf);
// }).catch((error) => {
//   console.error('Error generating PDF:', error);
// });
