import { Router } from 'express';
import { UserService } from '../services/UserService';
import { sendContract } from '../Controller/controllers';
import { UserController } from '../Controller/UserController';
import { AppDataSource } from '../config/data-source';
import { AuthService } from '../services/AuthServices';
import { AuthController } from '../Controller/AuthController';
import { User } from '../entity/User';
// import { Customer } from '../entity/Customer';
import multer from 'multer';
import { authMiddleware } from '../middleware/authMiddleware';

import { CustomerService } from '../services/CustomerService';
import { CustomerController } from '../Controller/CustomerController';

import ContractController from '../Controller/ContractController';

const userRepository = AppDataSource.getRepository(User);
const userService = new UserService();
const userController = new UserController(userService);

const authService = new AuthService(userRepository);
const authController = new AuthController(authService);

const custService = new CustomerService();
const custController = new CustomerController(custService, userService);


const router = Router();
// export const userRouter = Router();
router.post('/send-contract', sendContract);

router.get('/user/:id', (req, res) => userController.getUserById(req, res));
router.post('/user/', (req, res) => userController.createUser(req, res));
router.post('/user/:id/ports', (req, res) => userController.addPortToUser(req, res));

router.post('/auth/login', (req, res) => authController.loginUser(req, res));

// Configure multer for file upload
const upload = multer({ dest: 'uploads/' });
router.post('/customer/upload/:portId', authMiddleware, upload.single('file'), (req, res) => custController.uploadCustomer(req, res));
router.post('/customer/update/:id', authMiddleware, (req, res) => custController.updateCustomer(req, res));
router.get('/customer/all/:portId', authMiddleware, (req, res) => custController.getAllCustomers(req, res));


// send and get all contract
router.post('/contracts/:customerId', authMiddleware, ContractController.sendContract);
router.get('/contracts', authMiddleware, ContractController.getUserContracts);
router.get('/getall/contracts', authMiddleware, ContractController.getSendContracts);
router.get('/list/all/contracts', authMiddleware, ContractController.listAllContracts);

router.get('/generate/accesscodeurl', authMiddleware, ContractController.getauthtoken);
router.post('/setaccesstoken', authMiddleware, ContractController.setAccessToken);

router.get('/contract/:envelopeId/status', authMiddleware, ContractController.getContractStatus);
router.get('/contract/:envelopeId/download/:documentId', authMiddleware, ContractController.downloadContract);
router.get('/contract/:envelopeId/sign', authMiddleware, ContractController.signContract);
router.get('/contract/:envelopeId/resend', authMiddleware, ContractController.resendEnvelopeRequest);

router.get('/contract/all/:portId', authMiddleware, (req, res) => ContractController.getAllContracts(req, res));
export default router;

