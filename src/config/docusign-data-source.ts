import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

const privateKeyPath = path.join(__dirname, '../private.key');
const privateKey = fs.readFileSync(privateKeyPath, 'utf8');

export const config = {
  clientId: process.env.DOCUSIGN_CLIENT_ID,
  clientSecret: process.env.DOCUSIGN_CLIENT_SECRET,
  redirectUri: process.env.DOCUSIGN_REDIRECT_URI,
  userId: process.env.DOCUSIGN_USER_ID,
  accountId: process.env.DOCUSIGN_ACCOUNT_ID,
  privateKey: privateKey,
  JWT_SECRET: process.env.JWT_SECRET,
  DOCUSIGN_BASE_URL: process.env.DOCUSIGN_BASE_URL
};