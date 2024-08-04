// src/controller/ContractController.ts
import { Request, Response } from 'express';
import ContractService from '../services/ContractService';
import {DocuSignService} from '../services/docusignService';

import { config } from '../config/docusign-data-source';


class ContractController {
    private docuService: DocuSignService;
    
    constructor () {        
        this.docuService = new DocuSignService();
    }

    

    async setAccessToken(req: Request, res: Response) {
        try {
            const {authCode, codeVerifier} = req.body;

            const generateAccessToken = await ContractService.getAccessToken(authCode, codeVerifier);
            const saveToDB = await ContractService.saveAccessToken(generateAccessToken);

            res.status(200).send({
                message: "Access token has been updated"
            });
        }
        catch (error){
            console.log("error: ", error);
            res.status(500).json({ error: error });
        }
    }

    async getauthtoken(req: Request, res: Response) {
        const { codeChallenge, codeVerifier } = await ContractService.generateCodeChallenge();

        const authUrl = `https://account-d.docusign.com/oauth/auth?response_type=code&scope=signature&client_id=${config.clientId}&redirect_uri=${config.redirectUri}&code_challenge=${codeChallenge}&code_challenge_method=S256`;
        console.log("Call get access token :", authUrl, "Code Challenge: ", codeChallenge, "codeVerifier: ", codeVerifier);
        res.status(200).send({
            authUrl,
            codeChallenge,
            codeVerifier
        })
    }

    async sendContract(req: Request, res: Response) {
        try {
            const userId = req.userId;
            if (!userId) {
                res.status(404).send('Please check the request');
                return;
            }
            const { customerId } = req.params;
            console.log("paramId: ", customerId);
            if (!customerId) {
                res.status(404).send('Customer id not cound, please check the request');
                return;
            }
            // const customerDetail = await ContractService.getCustomerById(+customerId);
            // if (!customerDetail) {
            //     res.status(404).send('Customer not found');
            //     return;
            // }
            // const {fname, lname, email} = customerDetail;

            const contract = await ContractService.sendContract(userId, customerId, 'www.testingurl.com');
            if(contract==null){
                res.status(400).json({message: "request not sent"});
            }else {
                res.status(201).json(contract);
            }
            
        } catch (error) {
            console.log("error: ", error);
            res.status(500).json({ error: error });
        }
    }

    async getUserContracts(req: Request, res: Response) {
        try {
            const userId = req.userId;
            if (!userId) {
                res.status(404).send('Please check the request');
                return;
            }
            const contracts = await ContractService.getContractsByUser(userId);
            res.status(200).json(contracts);
        } catch (error) {
            res.status(500).json({ error: error });
        }
    }

    async getSendContracts(req: Request, res: Response) {
        try {
            const userId = req.userId;
            if (!userId) {
                res.status(404).send('Please check the request');
                return;
            }
            const contracts = await ContractService.getSentContracts();
            res.status(200).json(contracts);
        } catch (error) {
            res.status(500).json({ error: error });
        }
    }

    async listAllContracts(req: Request, res: Response) {
        try {
            const userId = req.userId;
            if (!userId) {
                res.status(404).send('Please check the request');
                return;
            }
            const contracts = await ContractService.listAllContracts();
            res.status(200).json(contracts);
        } catch (error) {
            res.status(500).json({ error: error });
        }
    }

    getContractStatus = async (req: Request, res: Response) => {
        try {
          const { envelopeId } = req.params;
          const status = await this.docuService.getEnvelopeStatus(envelopeId);
            // console.log("status dta: ", status);
          await ContractService.setEnavalopContractsStatus(status);
          res.json(JSON.parse(status));
        } catch (error) {
          res.status(500).send('Error fetching contract status');
        }
      };
    
      downloadContract = async (req: Request, res: Response) => {
        try {
          const { envelopeId, documentId } = req.params;
          const document = await this.docuService.downloadDocument(envelopeId, documentId);
          res.setHeader('Content-Type', 'application/pdf');
          res.send(document);
        } catch (error) {
          res.status(500).send('Error downloading contract');
        }
      };
    
      resendEnvelopeRequest = async (req: Request, res: Response) => {
        try {
          const { envelopeId } = req.params;
          const resendData = await this.docuService.resendEnvelopeRequest(envelopeId);
        //   await ContractService.insertEnavlopResendStatus(resendData);
          res.send({ message: 'Contract resent successfully', envelopeId: resendData });
        } catch (error) {
          res.status(500).send('Error downloading contract');
        }
      };
    
    signContract = async (req: Request, res: Response) => {
        try {
          const { envelopeId } = req.params;
          const url = await this.docuService.getDocumentViewUrl(envelopeId);
          res.status(200).send(url);
        } catch (error) {
          res.status(500).send('Error signing contract');
        }
    };

    async getAllContracts(req: Request, res: Response): Promise<void> {
        const portId = req.params.portId;
        const userId = req.userId;

        if (!portId || !userId) {
            res.status(404).send('Please check the request');
            return;
        }

        const customer = await ContractService.getContractsData(userId, +portId);

        if (!customer) {
            res.status(404).send('User not found');
            return;
        }
        res.json(customer);
    }
}

// const custService = new CustomerService();
export default new ContractController();
