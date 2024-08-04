import docusign from 'docusign-esign';

import { config } from '../config/docusign-data-source';
import ContractService from './ContractService';

interface Envelope {
    envelopeId: string;
    emailSubject: string;
    status?: string;
  }
  
  interface Document {
    documentId: string;
    name: string;
    fileExtension: string;
    documentBase64: string;
  }
  
  interface Recipient {
    name: string;
    email: string;
    recipientId: string;
    recipientType: string;
  }

export class DocuSignService {
    private apiClient: docusign.ApiClient;
    private envelopesApi: docusign.EnvelopesApi;

    constructor() {
        this.apiClient = new docusign.ApiClient();
    }

    async initialize(): Promise<void> {
        const accessToken = await ContractService.getAccessTokenFromDB();

        const accountURL = config.DOCUSIGN_BASE_URL;
        this.apiClient.setBasePath(accountURL || ''); // or your account base URL
        this.apiClient.addDefaultHeader('Authorization', `Bearer ${accessToken?.uservalue}`);

        this.envelopesApi = new docusign.EnvelopesApi(this.apiClient);
    }

    getEnvelopeStatus = async (envelopeId: string) => {

        await this.initialize();
        // const accountId = config.accountId;
        try {
            const result = await this.envelopesApi.getEnvelope(config.accountId, envelopeId);

            return JSON.stringify(result);
        } catch (error) {
            console.error('Error fetching envelope status:', error);
            throw error;
        }
    };

    downloadDocument = async (envelopeId: string, documentId: string) => {
        await this.initialize();
        this.envelopesApi = new docusign.EnvelopesApi(this.apiClient);
        try {
            const result = await this.envelopesApi.getDocument(config.accountId, envelopeId, documentId);
            return result;
        } catch (error) {
            console.error('Error downloading document:', error);
            throw error;
        }
    };

    resendEnvelopeRequest = async (envelopeId: string) => {

        // await this.initialize();
        const accountId = config.accountId;
        try {
            const accessToken = await ContractService.getAccessTokenFromDB();

            const accountURL = config.DOCUSIGN_BASE_URL;
            this.apiClient.setBasePath(accountURL || ''); // or your account base URL
            this.apiClient.addDefaultHeader('Authorization', `Bearer ${accessToken?.uservalue}`);

            this.envelopesApi = new docusign.EnvelopesApi(this.apiClient);
            // this.envelopesApi = new docusign.EnvelopesApi(this.apiClient);
            // this.envelopesApi
            // Get the existing envelope details

            const envelopeResponse = await this.envelopesApi.getEnvelope(accountId, envelopeId);
            const envelope = envelopeResponse as unknown as Envelope;

            console.log("envelope: ", envelope);
            // Get the existing envelope details
            // const envelope: Envelope = await this.envelopesApi.getEnvelope(accountId, envelopeId);
            // if (!envelope || !envelope.emailSubject || !envelope.documents || !envelope.recipients) {
            //     return { error: 'Envelope not found or invalid envelope data' };
            //   }

            // Get the documents in the envelope
    // Get the documents in the envelope
    // const documentResponse = await this.envelopesApi.listDocuments(accountId, envelopeId);
    // const documents = documentResponse.envelopeDocuments as docusign.EnvelopeDocument[];

    // // Get the recipients in the envelope
    // const recipientResponse = await this.envelopesApi.listRecipients(accountId, envelopeId);
    // const recipients = recipientResponse.signers as docusign.Signer[];

    // Create a new envelope definition with the existing envelope details and set status to 'sent'
    const envelopeDefinition = new docusign.EnvelopeDefinition();
    envelopeDefinition.status = 'sent';
    envelopeDefinition.emailSubject = envelope.emailSubject;
    // envelopeDefinition.documents = documents.map(doc => ({
    //   documentBase64: doc.documentBase64,
    //   name: doc.name,
    //   fileExtension: doc.fileExtension,
    //   documentId: doc.documentId
    // }));
    // envelopeDefinition.recipients = { signers: recipients };
            console.log("envelopeDefinition: ", envelopeDefinition);
            const results = await this.envelopesApi.createEnvelope(accountId, { envelopeDefinition });
            
            return results;
        } catch (error) {
            console.error('Error fetching envelope status:', error);
            throw error;
        }
    };

    getDocumentViewUrl = async (envelopeId: string) => {
        await this.initialize();
        try {
            const result = await this.envelopesApi.createRecipientView(config.accountId, envelopeId, {
                returnUrl: config.redirectUri,
                authenticationMethod: 'None',
                clientUserId: config.userId,
                userName: 'Navneet',
                email: 'navneett2@gmail.com',
            });
            return result;
        } catch (error) {
            console.error('Error creating document view URL:', error);
            throw error;
        }
    }

}
