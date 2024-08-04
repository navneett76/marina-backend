import { Request, Response } from 'express';
import axios from 'axios';
import * as docusign from 'docusign-esign';
// import { config } from './data-source';
import { config } from '../config/docusign-data-source';
import PDFDocument from 'pdfkit';
import getAccessToken from '../helper/getAccessToken';

// const getAccessToken = async (): Promise<string> => {
//   const tokenUrl = 'https://account-d.docusign.com/oauth/token';
//   const response = await axios.post(tokenUrl, {
//     grant_type: 'client_credentials',
//     client_id: config.clientId,
//     client_secret: config.clientSecret,
//   });
//   console.log("Configuration: ", config);
//   console.log("access token", response);
//   return response.data.access_token;
// };

const createEnvelope = async (pdfBuffer: Buffer, customer: any) => {
    const accessToken = await getAccessToken();
  const apiClient = new docusign.ApiClient();
  apiClient.setBasePath('https://demo.docusign.net/restapi');
  apiClient.addDefaultHeader('Authorization', `Bearer ${accessToken}`);

  const envDef = new docusign.EnvelopeDefinition();
  envDef.emailSubject = 'Please sign this document';
  envDef.documents = [
    {
      documentBase64: pdfBuffer.toString('base64'), // You should replace this with the actual document base64 content
      name: 'Contract',
      fileExtension: 'pdf',
      documentId: '1',
    },
  ];
  envDef.recipients = {
    signers: [
      {
        email: customer.email,
        name: customer.name,
        recipientId: '1',
        routingOrder: '1',
      },
    ],
  };
  envDef.status = 'sent';

  const envelopesApi = new docusign.EnvelopesApi(apiClient);
  return envelopesApi.createEnvelope(config.accountId, { envelopeDefinition: envDef });
};

const generateContract = (): string => {
    return `Dear User Kaise ho bhai,\n\n Dear User want to check the contract is sending to multiple user email id or not. \n\n I am looking for bulk contract sends .\n\nRegards,\nCompany`;
}
const generatePDF = (content: string): Promise<Buffer> => {
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

export const sendContract = async (req: Request, res: Response) => {
  try {
    const customer = req.body;
    // const accessToken = await getAccessToken();

    const contract = generateContract();
    const pdfBuffer = await generatePDF(contract);

    const envelopeResponse = await createEnvelope(pdfBuffer, customer);
    res.json({ envelopeId: envelopeResponse.envelopeId });
  } catch (error) {
    console.error('Error sending contract:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
