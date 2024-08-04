import express from 'express';
import bodyParser from 'body-parser';
// import multer from 'multer';
// import XLSX from 'xlsx'; 
import axios from 'axios';
// import fs from 'fs';
import PDFDocument from 'pdfkit';
// const qs = require('qs');
import crypto from 'crypto';
import puppeteer from 'puppeteer';
// import { AppDataSource } from './config/data-source';
import { Customer } from './entity/Customer';
// import { Repository } from 'typeorm';
import 'reflect-metadata';
import cors from 'cors';
import router from './routes/routes';
import 'reflect-metadata';
import "./helper/formatDateHelper";

const app = express();
const port = 5000;

// interface Customer {
//     name: string;
//     email: string;
// }

// Configure multer for file upload
// const upload = multer({ dest: 'uploads/' });

const clientId = 'a9978883-27fd-4ef9-b435-327401888ab5';
const redirectUri = 'https%3A%2F%2Fwww.docusign.com';

app.use(bodyParser.json());
app.use(cors());
app.use('/api', router);



function base64URLEncode(str: Buffer): string {
    return str.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function sha256(buffer: Buffer): Buffer {
    return crypto.createHash('sha256').update(buffer).digest();
}

function generateCodeChallenge(): { codeChallenge: string; codeVerifier: string } {
    const codeVerifier = base64URLEncode(crypto.randomBytes(32));
    const codeChallenge = base64URLEncode(sha256(Buffer.from(codeVerifier)));
    return { codeChallenge, codeVerifier };
}

async function getAuthorizationCode(authUrl:string): Promise<string> {
    console.log(authUrl);
    debugger;
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
  
    // Navigate to the authorization URL
    await page.goto(authUrl, { waitUntil: 'networkidle2' });
  
    // Simulate user login and consent (fill in your credentials here or prompt the user)
    await page.type('#username', 'navneett2@gmail.com'); // Replace with your email
    await page.type('#password', 'Navneet@123'); // Replace with your password
    await page.click('button[type="submit"]'); // Simulate the login button click
  
    // Wait for the consent page to load and click the "Accept" button
    await page.waitForSelector('button[aria-label="Accept"]');
    await page.click('button[aria-label="Accept"]');
  
    // Wait for the redirect and capture the URL with the authorization code
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    const url = page.url();
  
    // Extract the authorization code from the URL
    const urlParams = new URLSearchParams(new URL(url).search);
    const authCode = urlParams.get('code');
  
    await browser.close();
  
    if (!authCode) {
      throw new Error('Authorization code not found');
    }
  
    return authCode;
  }


export const getAccessToken = async (authCode: string, codeVerifier: string) => {
    
    // console.log("codeVerifier: ", codeVerifier);

    const tokenUrl = 'https://account-d.docusign.com/oauth/token';
    // const clientId = 'a9978883-27fd-4ef9-b435-327401888ab5';
    const clientSecret = '76285583-d781-4333-b67e-4dcaf96c7163';
    // const redirectUri = 'https%3A%2F%2Fwww.docusign.com';
    // console.log(`Navigate to: ${authUrl}`);
    // const getAuthCode  = await getAuthorizationCode(authUrl);

    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', authCode);
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);
    params.append('redirect_uri', redirectUri);
    params.append('code_verifier', codeVerifier);

    try {
        const response = await axios.post(tokenUrl, params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        console.log('Access Token:', response.data.access_token);
        return response.data.access_token;
    } catch (error) {
        console.error('Error fetching access token:', error);
        throw error;
    }

}


export const generateContract = (customer: Customer): string => {
    return `Dear ${customer.fname} ${customer.lname} Kaise ho bhai,\n\n Dear User want to check the contract is sending to multiple user email id or not. \n\n I am looking for bulk contract sends .\n\nRegards,\nCompany`;
}

export const generatePDF = (content: string): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument();
        const buffers: Buffer[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            const pdfData = Buffer.concat(buffers);
            resolve(pdfData);
        });
        doc.on('error', reject);
        doc.text(content);
        doc.end();
    });
}


export const sendContractToDocuSign = async (email: string, pdfBuffer: Buffer, authCode: string, codeVerifier: string) => {
    // const authCode = '';
    // const codeVerifier = '';
    const accessToken = 'eyJ0eXAiOiJNVCIsImFsZyI6IlJTMjU2Iiwia2lkIjoiNjgxODVmZjEtNGU1MS00Y2U5LWFmMWMtNjg5ODEyMjAzMzE3In0.AQoAAAABAAUABwCAwdeK9J_cSAgAgAH7mDeg3EgCAAyA6w-nxZ1Mk8ZhPotZ_zcVAAEAAAAYAAEAAAAFAAAADQAkAAAAYTk5Nzg4ODMtMjdmZC00ZWY5LWI0MzUtMzI3NDAxODg4YWI1IgAkAAAAYTk5Nzg4ODMtMjdmZC00ZWY5LWI0MzUtMzI3NDAxODg4YWI1MACAmV517J_cSDcAs9MuMHUsn0O6UNo_SDQiSA.c7nZEbRT_mEHEOovcb_KQjw31HjAeYvFpCgVr4EpFgg1PdCDpomYajNj1HWcd5xA4puD-lOPYK2qCl7xUD44ddlPl8z0n_Ts380pX1rqpqvqnCfFSIQltileprMx_i8SFS1wvEdS4kjq30NK-arovpeaFIHtUKi2SGymBwfAYwJ93H3rQtNn0tYq8ZJWlbjXgxEjm-zEkDizquwP9A3PCVeqoeFa8GHf2DYjnqa5R1MNt-cvDINk-DwuaDr24EsqG1N3EGLkGkaLyaU_fxwr39pG53zdDVVfZqOFd6ZNiOHkGMySrHe23VPbWwm8OCcmFkhUaMQyTTAQ9i_bui-DnA';
    //await getAccessToken(authCode, codeVerifier);
    console.log("accessToken: ", accessToken)
    // return 1;
    console.log("Verify authcode docusign API");
    const docusignApiUrl = 'https://demo.docusign.net/restapi/v2.1/accounts/28062378/envelopes';
    const docusignToken = accessToken;
    const accountId = '92504d2f-0364-4c94-a14b-979607502937';

    const envelopeDefinition = {
        emailSubject: 'Please sign this contract',
        documents: [
            {
                documentBase64: pdfBuffer.toString('base64'),
                name: 'Contract',
                fileExtension: 'pdf',
                documentId: '1',
            },
        ],
        recipients: {
            signers: [
                {
                    email,
                    name: 'Signer Name',
                    recipientId: '1',
                    routingOrder: '1',
                },
            ],
        },
        status: 'sent',
    };

    try {
        const response = await axios.post(docusignApiUrl.replace('{accountId}', accountId), envelopeDefinition, {
            headers: {
                Authorization: `Bearer ${docusignToken}`,
                'Content-Type': 'application/json',
            },
        });
        console.log('DocuSign response', response.data);
    } catch (error) {
        console.error('Error sending contract to DocuSign', error);
    }
}


// AppDataSource.initialize().then(() => {
//     console.log('Connected to the database');
  
    // const customerRepository: Repository<Customer> = AppDataSource.getRepository(Customer);
app.get('/getauthtoken', async (req, res) => {
    const { codeChallenge, codeVerifier } = await generateCodeChallenge();

    const authUrl = `https://account-d.docusign.com/oauth/auth?response_type=code&scope=signature&client_id=${clientId}&redirect_uri=${redirectUri}&code_challenge=${codeChallenge}&code_challenge_method=S256`;
    // const authCode = 'eyJ0eXAiOiJNVCIsImFsZyI6IlJTMjU2Iiwia2lkIjoiNjgxODVmZjEtNGU1MS00Y2U5LWFmMWMtNjg5ODEyMjAzMzE3In0.AQwAAAABAAYABwCAugwXCZ_cSAgAgEaTXgmf3EgCAAyA6w-nxZ1Mk8ZhPotZ_zcVAAEAAAAYAAEAAAAFAAAADQAkAAAAYTk5Nzg4ODMtMjdmZC00ZWY5LWI0MzUtMzI3NDAxODg4YWI1IgAkAAAAYTk5Nzg4ODMtMjdmZC00ZWY5LWI0MzUtMzI3NDAxODg4YWI1QgArAAAAdkc5aFBzR0toR0xnX3d3Z2dNN3BmQzA4MGVyNmNHQWJjbDRRWk9Zc0xkTUMAAAA3ALPTLjB1LJ9DulDaP0g0IkgwAICBZNMFn9xI.2xi3wKqzf70MoyAFshHR4ZLkzImyapExMDksrFy2jOYG5j5w3hbj_wCNV3cR_n1o110iWMTr_vPYH-TD2kv_0LvBZJ49Z6J4SHkbt3dcBSQB4-jKrqlNca5rfsQ4IW6zbluvFrGdksgnsF8SYiBacEQj5mEcK_58tH_8uePSYycTHisx9T4I3ar3Re8PGIlzRv1m8qqRFP_CkyiN8aUtw3XcpcqNp3I9_rqmY6lmWa5ap5pY3qiYaYGKAEt0l-_VGZko568eSAv5dGg0G9PL3IJJllwIDr_ZYqtqpCLuGB8yZV-5fLlD095-69rHB2aHOsXIfCUsfz_Py0jFZR52JQ';
    console.log("Call get access token :", authUrl, "Code Challenge: ", codeChallenge, "codeVerifier: ", codeVerifier);
    res.status(200).send({
        authUrl, 
        codeChallenge, 
        codeVerifier
    })
}),

// app.post('/send-contract', async (req, res) => {
//     try {
//         // const file = req.file;
//         const {id, fname, lname, email, phone, vessel, loa, beam, draft, address1, address2, city, state, zip, country, authCode, codeVerifier} = req.body;
//         console.log("send-contract authCode: ", authCode)
//         console.log("send-contract codeVerifier: ", codeVerifier)


//         const customerData: Customer = {
//             id,
//             fname,
//             lname, 
//             email,
//             phone,
//             vessel,
//             loa,
//             beam, 
//             draft, 
//             address1, 
//             address2, 
//             city, 
//             state, 
//             zip, 
//             country
//         }

//         // console.log("customerData: ", customerData);

//         const contract = generateContract(customerData);
//         const pdfBuffer = await generatePDF(contract);
//         let emailList: string[] = [];

//         for (let emailD of emailList){
//             await sendContractToDocuSign(emailD, pdfBuffer, authCode, codeVerifier);
//         }
//         res.status(200).send('Contracts sent successfully');
//     } catch (error) {
//         console.error('Error processing file', error);
//         res.status(500).send('Error processing file');
//     } finally {
//         if (req.file) {
//             fs.unlinkSync(req.file.path);
//         }
//     }
// });


    // app.post('/upload-customers', upload.single('file'), async (req, res) => {
    //     const file = req.file;
    //     const {authCode, codeVerifier} = req.body;
    //     console.log("authCode: ", authCode)
    //     console.log("codeVerifier: ", codeVerifier)
    //     if (!file) {
    //         res.status(400).send('No file uploaded');
    //         return;
    //     }

    //     const workbook = XLSX.readFile(file.path);
    //     const sheetNameList = workbook.SheetNames;
    //     const sheet = workbook.Sheets[sheetNameList[0]];
    //     const rows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1 });

    //     const customerData: Customer[] = rows.slice(1).map((row) => ({
    //         id: row[0],
    //         name: row[1],
    //         email: row[2],
    //         phone: row[3],
    //         address: row[4]
    //     }));
    //     console.log("customerData: ", customerData);
    //     for (const customer of customerData) {
    //         const createCustomer = customerRepository.create(customer);
    //         const result = await customerRepository.save(createCustomer);
    //     }
    
    //     const customers = await customerRepository.find();
    //     res.send(customers);
    // });
  
    // app.post('/customers', async (req, res) => {
    //   const customer = customerRepository.create(req.body);
    //   const result = await customerRepository.save(customer);
    //   res.send(result);
    // });
  
    // app.get('/customers', async (req, res) => {
    //   const customers = await customerRepository.find();
    //   res.send(customers);
    // });
  
    
//   }).catch(error => console.log(error));



app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});