// src/service/ContractService.ts
import { Repository } from 'typeorm';
import { Service } from 'typedi';
import { AppDataSource } from '../config/data-source';

import { Customer } from '../entity/Customer';
import { Contract } from '../entity/Contract';
import { User } from '../entity/User';
import { ApiCall } from '../entity/APICall';
import { AllContracts } from '../entity/AllContracts';
import { Port } from '../entity/Port';

// import PDFDocument from 'pdfkit';
import axios from 'axios';
import { ConfigTb } from '../entity/ConfigTb';
import { config } from '../config/docusign-data-source';
import crypto from 'crypto';
import { generatePdf } from '../Controller/generatePdf';
import { generatePDFFile } from '../Controller/generatepdffile';

@Service()
class ContractService {
  private ContractRepository: Repository<Contract>;
  private UserRepository: Repository<User>;
  private CustomerRepository: Repository<Customer>;
  private configRepository: Repository<ConfigTb>;
  private ApiCallRepository: Repository<ApiCall>;
  private AllContractsRepository: Repository<AllContracts>;
  private PortRepository: Repository<Port>;

  constructor() {
    this.ContractRepository = AppDataSource.getRepository(Contract);
    this.UserRepository = AppDataSource.getRepository(User);
    this.CustomerRepository = AppDataSource.getRepository(Customer);
    this.configRepository = AppDataSource.getRepository(ConfigTb);
    this.ApiCallRepository = AppDataSource.getRepository(ApiCall);
    this.AllContractsRepository = AppDataSource.getRepository(AllContracts);
    this.PortRepository = AppDataSource.getRepository(Port);
  }


  getAccessToken = async (authCode: string, codeVerifier: string) => {

    // console.log("codeVerifier: ", codeVerifier);

    const tokenUrl = 'https://account-d.docusign.com/oauth/token';
    // const clientId = 'a9978883-27fd-4ef9-b435-327401888ab5';
    const clientSecret = config.clientSecret;
    // const redirectUri = 'https%3A%2F%2Fwww.docusign.com';
    // console.log(`Navigate to: ${authUrl}`);
    // const getAuthCode  = await getAuthorizationCode(authUrl);

    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', authCode);
    params.append('client_id', config.clientId);
    params.append('client_secret', clientSecret);
    params.append('redirect_uri', config.redirectUri);
    params.append('code_verifier', codeVerifier);

    try {

      const response = await axios.post(tokenUrl, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      const APICallObj = new ApiCall();
      APICallObj.requestURL = tokenUrl;
      APICallObj.requestBody = JSON.stringify(params);
      APICallObj.responseBody = JSON.stringify(response.data);
      await this.ApiCallRepository.save(APICallObj);

      console.log('Access Token:', response.data.access_token);
      return response.data.access_token;
    } catch (error) {
      console.error('Error fetching access token:', error);
      throw error;
    }

  }

  base64URLEncode = (str: Buffer): string => {
    return str.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }

  sha256 = (buffer: Buffer): Buffer => {
    return crypto.createHash('sha256').update(buffer).digest();
  }



  generateCodeChallenge = () => {
    const codeVerifier = this.base64URLEncode(crypto.randomBytes(32));
    const codeChallenge = this.base64URLEncode(this.sha256(Buffer.from(codeVerifier)));
    return { codeChallenge, codeVerifier };
  }


  generateContract = (customer: Customer): string => {
    return `Dear ${customer.fname} ${customer.lname} Kaise ho bhai,\n\n Dear User want to check the contract is sending to multiple user email id or not. \n\n I am looking for bulk contract sends .\n\nRegards,\nCompany
                        `;
  }

  sendContractToDocuSign = async (customer: Customer) => {
    console.log("Generate pdf: ", customer.port);

    // const pdfBytes = await generatePDFFile();
    const pdfBytes = await generatePdf(customer);
    // console.log("pdf generated: ", pdfBytes);
    // return;
    const { email, fname } = customer;
    const accessTokenRecord = await this.getAccessTokenFromDB();

    const docusignApiUrl = 'https://demo.docusign.net/restapi/v2.1/accounts/28062378/envelopes';
    const docusignToken = accessTokenRecord?.uservalue;
    const accountId = config.accountId;

    const envelopeDefinition = {
      emailSubject: "Please sign this document",
      documents: [{
        documentBase64: pdfBytes.toString('base64'),
        name: 'Invoice.pdf',
        fileExtension: 'pdf',
        documentId: '1',
      }],
      recipients: {
        signers: [{
          email: email,
          name: fname,
          recipientId: '1',
          routingOrder: '1',
          tabs: {
            signHereTabs: [{
              anchorString: '/sn1/',
              anchorYOffset: '-30',
              anchorUnits: 'pixels',
              recipientId: '1',
            }],
          },
        }],
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

      // const APICallObj = new ApiCall();
      // APICallObj.requestURL = docusignApiUrl.replace('{accountId}', accountId);
      // APICallObj.requestBody = JSON.stringify(envelopeDefinition);
      // APICallObj.responseBody = JSON.stringify(response.data);
      // await this.ApiCallRepository.save(APICallObj);

      console.log('DocuSign response', response.data);
      return response.data;
    } catch (error) {
      console.error('Error sending contract to DocuSign', error);
    }
  }

  getAccessTokenFromDB = async () => {
    return await this.configRepository.findOne({
      where: {
        id: 1
      }
    });
  }

  async sendContract(userId: number, customerId: string, documentUrl: string): Promise<Contract | null> {

    const user = await this.UserRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const customer = await this.CustomerRepository.findOne({
      where: { id: parseInt(customerId) }
    });

    if (!customer) {
      throw new Error('Customer not found');
    }

    const port = await this.PortRepository.findOne({
      where: { id: customer?.portId }
    });
    if (!port) {
      throw new Error('port not found');
    }

    customer.user = user;
    customer.port = port;

    console.log("customer data: ", customer);
    // const pdfContent = await this.generateContract(customer)
    // const pdfBuffer = await this.generatePDF(pdfContent);
    const contractD = await this.sendContractToDocuSign(customer);
    console.log("contractD: ", contractD);
    if (contractD) {
      const contract = new Contract();
      contract.user = user;
      contract.customerName = customer.fname + ' ' + customer.lname;
      contract.customerEmail = customer.email;
      contract.documentUrl = contractD.uri.replace('/envelopes/', '');
      contract.customerId = +customerId;
      contract.status = contractD.status;
      await this.ContractRepository.save(contract);
      return contract;
    } else {
      return null;
    }
  }

  async saveAccessToken(accessToken: string): Promise<ConfigTb | null> {
    const updateConfig = new ConfigTb();
    updateConfig.userkey = 'accesstoken';
    updateConfig.uservalue = accessToken;

    this.configRepository.update(1, updateConfig)
    return updateConfig;
  }

  async getCustomerById(id: number): Promise<Customer | null> {
    return await this.CustomerRepository.findOne({ where: { id } });
  }

  async getContractsByUser(userId: number): Promise<Contract[]> {
    return await this.ContractRepository.find({ where: { user: { id: userId } }, relations: ['user'] });
  }

  async setEnavalopContractsStatus(envalopD:any) {
    const contractsData = JSON.parse(envalopD);
    // console.log("contractsData : ", contractsData.envelopeId);
    let entityExist = await this.AllContractsRepository.findOne({ where: { envelopeId: contractsData.envelopeId } });

    if (entityExist) {
      entityExist.status = contractsData.status
      await this.AllContractsRepository.save(entityExist);
    }
    return entityExist;
  }

  async insertEnavlopResendStatus(recordData:any) {
    const contractsData = JSON.parse(recordData.envelopeId);
    // console.log("contractsData : ", contractsData.envelopeId);
    let entityExist = await this.AllContractsRepository.findOne({ where: { envelopeId: contractsData.envelopeId } });

    if (entityExist) {
      entityExist.status = contractsData.status
      await this.AllContractsRepository.save(entityExist);
    }
    return entityExist;
  }

  async getSentContracts() {

    try {
      const accessTokenRecord = await this.configRepository.findOne({
        where: {
          id: 1
        }
      });
      const response = await axios.get(`${config.DOCUSIGN_BASE_URL}/v2.1/accounts/${config.accountId}/envelopes`, {
        headers: {
          'Authorization': `Bearer ${accessTokenRecord?.uservalue}`,
          'Content-Type': 'application/json',
        },
        params: {
          from_date: '2024-06-01', // Adjust the date as needed
          status: 'any',
        },
      });
      const allContractsList = response.data.envelopes;
      for (let contr of allContractsList) {
        
        let entityExist = await this.AllContractsRepository.findOne({ where: { envelopeId: contr.envelopeId } });

        if (entityExist) {
          entityExist.status = contr.status
          await this.AllContractsRepository.save(entityExist);
        } else {
          const allContracts = new AllContracts();
          allContracts.emailSubject = contr.emailSubject;
          allContracts.envelopeId = contr.envelopeId;
          allContracts.senderEmail = contr.sender.email;
          allContracts.sentDateTime = contr.sentDateTime;
          allContracts.statusChangedDateTime = contr.statusChangedDateTime;
          allContracts.status = contr.status;

          await this.AllContractsRepository.save(allContracts);
        }
        
        
      }

      return response.data.envelopes;
    } catch (error) {
      console.error('Error fetching sent contracts:', error);
      throw error;
    }
  }

  async listAllContracts() {
    return await this.AllContractsRepository.find({ order: {sentDateTime : "DESC" } });
  }

  async getContractsData(userId:number, portId: number) {
    // const customerRepository = this.CustomerRepository(Customer);
//     "id": 1,
//     "fname": "ASDD",
//     "lname": "Felner",
//     "email": "navneett2@gmail.com",
//     "phone": "12032522117",
//     "vessel": "Sea Lion",
//     "loa": 43,
//     "beam": 13,
//     "draft": 5,
//     "address1": "5 Compo Beach Road",
//     "address2": "",
//     "city": "Westport",
//     "state": "CT",
//     "zip": "06880",
//     "country": "US",
//     "userId": 1,
//     "portId": 1,
//     "starttime": "2024-07-28T11:47:41.000Z",
//     "endtime": "2025-01-28T11:47:41.000Z",
//     "price": 1200,
//     "createddate": "2024-07-28T11:47:41.000Z",
//     "contracts": [
//         {
//             "id": 1,
//             "customerName": "Andrew12 Felner",
//             "customerEmail": "navneett2@gmail.com",
//             "documentUrl": "/envelopes/3d99d2fb-52d8-4f66-b3fc-59ccdb68e914",
//             "status": "sent",
//             "createdAt": "2024-07-28T12:01:29.382Z",
//             "updatedAt": "2024-07-28T12:01:29.382Z",
//             "customerId": 1
//         },
//         {
//             "id": 2,
//             "customerName": "Andrew12 Felner",
//             "customerEmail": "navneett2@gmail.com",
//             "documentUrl": "/envelopes/0ccce479-45fd-4683-99e2-437e3b85a8a7",
//             "status": "sent",
//             "createdAt": "2024-07-28T12:03:53.591Z",
//             "updatedAt": "2024-07-28T12:03:53.591Z",
//             "customerId": 1
//         }
//     ],
//     "port": {
//         "id": 1,
//         "portName": "Champlins Resort"
//     },
//     "user": {
//         "id": 1,
//         "username": "navneett2@gmail.com",
//         "password": "$2b$10$h72lAt0Xnd4c30/XqStuxO43JNLovXK2ptIJUCbrLtq/FtecfnJcS",
//         "companyName": "Example dfg sgCorp",
//         "companyAddress": "1234 Example St"
//     }
// },

    const customers = await this.CustomerRepository.query(`
      SELECT customer.id AS customer_id, customer.fname AS customer_fname, customer.lname AS customer_lname, customer.email AS customer_email, customer.phone AS customer_phone, customer.vessel AS customer_vessel, customer.starttime AS customer_starttime, customer.endtime AS customer_endtime, port.portName AS port_portName, port.id AS port_id, all_contract.status AS all_contract_status, all_contract.envelopeId AS 
all_contract_envelopeId, all_contract.sentDateTime AS all_contract_sentDateTime, 
all_contract.statusChangedDateTime AS all_contract_statusChangedDateTime, all_contract.id AS all_contract_id 
FROM customer customer 
LEFT JOIN contract contract ON contract.customerId=customer.id  
LEFT JOIN port port ON port.id=customer.portId  
LEFT JOIN user user ON user.id=customer.userId  
INNER JOIN all_contracts all_contract ON all_contract.envelopeId = contract.documentUrl 
WHERE customer.userId = ${userId} AND customer.portId =${portId}
    `);
    // const customers = await this.CustomerRepository
    //   .createQueryBuilder('customer')
    //   .leftJoinAndSelect('customer.contracts', 'contract')
    //   .leftJoinAndSelect('customer.port', 'port')
    //   .leftJoinAndSelect('customer.user', 'user')
    //   .innerJoin(AllContracts, 'all_contract', 'all_contract.envelopeId = contract.documentUrl')
    //   .select([
    //     'customer.id',
    //     'customer.fname',
    //     'customer.lname',
    //     'customer.email',
    //     'customer.phone',
    //     'customer.vessel',
    //     'customer.starttime',
    //     'customer.endtime',
    //     'port.portName',
    //     'all_contract.envelopeId',
    //     'all_contract.status',
    //     'all_contract.sentDateTime',
    //     'all_contract.statusChangedDateTime',
    //   ])
    //   .where('customer.userId = :userId', { userId }) 
    //   .andWhere('customer.portId = :portId', { portId }) 
    //   .getMany();
  
      // console.log(customers.getSql());

    return customers;
  }

}

export default new ContractService();
