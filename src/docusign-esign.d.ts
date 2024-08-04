declare module 'docusign-esign' {
    export class ApiClient {
      setBasePath(basePath: string): void;
      addDefaultHeader(headerName: string, headerValue: string): void;
    }
  
    export class EnvelopesApi {
      getEnvelope(arg0: string, envelopeId: string) {
          throw new Error('Method not implemented.');
      }
      getDocument(arg0: string, envelopeId: string, documentId: string) {
          throw new Error('Method not implemented.');
      }
      createRecipientView(arg0: string, envelopeId: string, arg2: { returnUrl: string; authenticationMethod: string; clientUserId: string; userName: string; email: string; }) {
          throw new Error('Method not implemented.');
      }
      constructor(apiClient: ApiClient);
      createEnvelope(accountId: string, options: { envelopeDefinition: EnvelopeDefinition }): Promise<{ envelopeId: string }>;
    }
  
    export class EnvelopeDefinition {
      emailSubject: string;
      documents: Document[];
      recipients: { signers: Signer[] };
      status: string;
    }
  
    export class Document {
      documentBase64: string;
      name: string;
      fileExtension: string;
      documentId: string;
    }
  
    export class Signer {
      email: string;
      name: string;
      recipientId: string;
      routingOrder: string;
    }
  }
  