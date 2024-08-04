import * as fs from 'fs';
import * as path from 'path';
import * as jwt from 'jsonwebtoken';
import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

const privateKeyPath = path.resolve(__dirname, process.env.DOCUSIGN_PRIVATE_KEY_PATH || '');
const privateKey = fs.readFileSync(privateKeyPath, 'utf8');

const getAccessToken = async (): Promise<string> => {
  const jwtPayload = {
    iss: process.env.DOCUSIGN_CLIENT_ID,
    sub: process.env.DOCUSIGN_IMPERSONATED_USER_GUID,
    aud: process.env.DOCUSIGN_AUTH_SERVER,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour expiration
    scope: 'signature impersonation'
  };
  console.log("privateKey: ", privateKey);
  const jwtToken = jwt.sign(jwtPayload, privateKey, { algorithm: 'RS256' });
  console.log("searchstring: ", new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion: jwtToken
  }).toString());

  try {
    const response = await axios.post(
      `${process.env.DOCUSIGN_AUTH_SERVER}/oauth/token`,
      new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwtToken
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    console.log("response data: ", response.data);
    return response.data.access_token;
  } catch (error:any) {
    console.error('Error obtaining access token:', error.response.data);
    throw new Error('Failed to obtain access token');
  }
};

export default getAccessToken;
