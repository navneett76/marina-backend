// src/services/UserService.ts
import { Service } from 'typedi';
import { Repository } from 'typeorm';
import { Customer } from '../entity/Customer';
import { AppDataSource } from '../config/data-source';

@Service()
export class CustomerService {
  private CustomerRepository: Repository<Customer>;

  constructor() {
    this.CustomerRepository = AppDataSource.getRepository(Customer);
  }

  async createCustomer(customer: Customer): Promise<Customer> {
    return await this.CustomerRepository.save(customer);
  }

  async updateCustomer(id: number, customerData: Partial<Customer>): Promise<Customer | null> {
    console.log("service update customer", customerData)
    await this.CustomerRepository.update(id, customerData);
    console.log("service update customer after", customerData)
    const updatedCustomer = await this.CustomerRepository.findOne({ where: { id } });
    return updatedCustomer;
  }

  async getCustomerById(id: number): Promise<Customer | null> {
    return await this.CustomerRepository.findOne({ where: { id }});
  }

  async getAllCustomer(userId:number, portId: number): Promise<Customer[] | null> {
    return await this.CustomerRepository.find({
      where: {
        port: { id: portId },
        user: { id: userId }
      },
      relations: ['port', 'user']
    });
  }

  async getCustomersWithContracts(userId:number, portId: number) {
    // const customerRepository = this.CustomerRepository(Customer);
    
    const customers = await this.CustomerRepository
      .createQueryBuilder('customer')
      .leftJoinAndSelect('customer.contracts', 'contract')
      .leftJoinAndSelect('customer.port', 'port')
      .leftJoinAndSelect('customer.user', 'user')
      .where('customer.userId = :userId', { userId }) 
      .where('customer.portId = :portId', { portId }) 
      .getMany();
  
    return customers;
  }

}
