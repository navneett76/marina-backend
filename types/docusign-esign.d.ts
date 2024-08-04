// types/docusign-esign.d.ts

declare module 'docusign-esign' {
    export class ApiClient {
      setBasePath(basePath: string): void;
      addDefaultHeader(headerName: string, headerValue: string): void;
    }
  
    export class EnvelopesApi {
      constructor(apiClient: ApiClient);
      createEnvelope(accountId: string, opts: { envelopeDefinition: EnvelopeDefinition }): Promise<any>;
    }
  
    export class EnvelopeDefinition {
      emailSubject: string;
      documents: Document[];
      recipients: Recipients;
      status: string;
    }
  
    export class Document {
      documentBase64: string;
      name: string;
      fileExtension: string;
      documentId: string;
    }
  
    export class Recipients {
      signers: Signer[];
    }
  
    export class Signer {
      email: string;
      name: string;
      recipientId: string;
      routingOrder: string;
    }
  }
  