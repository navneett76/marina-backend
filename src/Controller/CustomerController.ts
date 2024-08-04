import { Request, Response } from 'express';
import { Service } from 'typedi';
import { CustomerService } from '../services/CustomerService';
import { Customer } from '../entity/Customer';
import { UserService } from '../services/UserService';
import XLSX from 'xlsx';
import { addMonths } from 'date-fns';
import { Contract } from '../entity/Contract';

@Service()
export class CustomerController {
    constructor(private custService: CustomerService, private userService: UserService) { }

    async uploadCustomer(req: Request, res: Response): Promise<void> {

        const file = req.file;
        if (!file) {
            res.status(400).send('No file uploaded');
            return;
        }

        let portId = req.params.portId;
        const userId = req.userId;
        console.log("portId: ", portId, "userId: ", userId);
        if (!userId || !portId) {
            res.status(404).json({ message: 'UserId and PortId not found' });
            return;
        }
        const user = await this.userService.getUserById(userId);
        if (!user || user == null) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        const port = await this.userService.getPortById(+portId)
        if (!port || port == null) {
            res.status(404).json({ message: 'port not found' });
            return;
        }

        const workbook = XLSX.readFile(file.path);
        const sheetNameList = workbook.SheetNames;
        const sheet = workbook.Sheets[sheetNameList[0]];
        const rows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1 });
        console.log("xlsx", rows);

        const customerData: Customer[] = rows.slice(1).map((row) => ({
            fname: row[0],
            lname: row[1],
            email: row[2],
            phone: row[3],
            vessel: row[4],
            loa: row[5],
            beam: row[6],
            draft: row[7],
            address1: row[8],
            address2: row[9],
            city: row[10],
            state: row[11],
            zip: row[12],
            country: row[13],
            user: user,
            userId: userId,
            port: port,
            portId: +portId,
            contracts: [],
            starttime: new Date(),
            endtime: addMonths( new Date(), 6),
            price: 1000,
            createddate: new Date()
        }));
        console.log("customerData: ", customerData);
        let customerResult = []
        for (const customer of customerData) {
            customerResult.push(await this.custService.createCustomer(customer));
        }

        res.send(customerResult);
    }

    async updateCustomer(req: Request, res: Response) {
        const { id } = req.params;
        const customerData = req.body;
        
        try {
            const updatedCustomer = await this.custService.updateCustomer(Number(id), customerData);
            
            if (!updatedCustomer) {
                return res.status(404).json({ message: 'Customer not found' });
            }
            return res.status(200).json(updatedCustomer);
        } catch (error) {
            console.log("updatedCustomer data: ", error);
            return res.status(500).json({ message: 'Internal server error', error: error });
        }
    }

    async getAllCustomers(req: Request, res: Response): Promise<void> {
        const portId = req.params.portId;
        const userId = req.userId;
        // console.log("userId: ", userId, " portId: ", portId);

        if (!portId || !userId) {
            res.status(404).send('Please check the request');
            return;
        }

        const customer = await this.custService.getCustomersWithContracts(userId, +portId);

        if (!customer) {
            res.status(404).send('User not found');
            return;
        }
        res.json(customer);
    }
}