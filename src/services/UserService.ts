// src/services/UserService.ts
import { Service } from 'typedi';
import { Repository } from 'typeorm';
import { User } from '../entity/User';
import { Port } from '../entity/Port';
// import { AppDataSource } from '../data-source';
import { AppDataSource } from '../config/data-source';
import * as bcrypt from 'bcrypt';

@Service()
export class UserService {
  private userRepository: Repository<User>;
  private portRepository: Repository<Port>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.portRepository = AppDataSource.getRepository(Port);
  }

  async createUser(user: User): Promise<User> {
    // Find existing ports or create new ones
    const ports = await Promise.all(user.ports.map(async (portObj) => {
      let portName = portObj.portName;
      let port = await this.portRepository.findOne({ where: { portName } });
      if (!port) {
        port = new Port();
        port.portName = portName;
        port = await this.portRepository.save(port);
      }
      return port;
    }));

    user.ports = ports;
    return await this.userRepository.save(user);
  }

  async getUserById(id: number): Promise<User | null> {
    return await this.userRepository.findOne({ where: { id }, relations: ['ports'] });
  }

  async getPortById(id: number): Promise<Port | null> {
    return await this.portRepository.findOne({ where: { id }});
  }

  async addPortToUser(userId: number, portName: string): Promise<User | null> {
    // console.log("add port to user");
    const user = await this.getUserById(userId);
    if (!user) return null;

    let port = await this.portRepository.findOne({ where: { portName } });
    // console.log("check port exist", port);
    if (!port) {
      port = new Port();
      port.portName = portName;
      port = await this.portRepository.save(port);
    }

    console.log("check more", !user.ports.some(existingPort => existingPort.id === port.id));
    if (!user.ports.some(existingPort => existingPort.id === port.id)) {
      user.ports.push(port);
      await this.userRepository.save(user);
    }

    return user;
  }
}
