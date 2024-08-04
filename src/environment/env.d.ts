declare global {
    namespace NodeJS {
      interface ProcessEnv {
        DOCUSIGN_CLIENT_ID: string;
        DOCUSIGN_CLIENT_SECRET: string;
        DOCUSIGN_REDIRECT_URI: string;
        DOCUSIGN_USER_ID: string;
        DOCUSIGN_ACCOUNT_ID: string;
        DOCUSIGN_PRIVATE_KEY: string;
        DOCUSIGN_IMPERSONATED_USER_GUID: string;
        DOCUSIGN_AUTH_SERVER:string;
      }
    }
  }
  
  export {};