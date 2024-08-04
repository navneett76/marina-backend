// src/services/AuthService.ts
import { Service } from 'typedi';
import { Repository } from 'typeorm';
import { User } from '../entity/User';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/data-source';

@Service()
export class AuthService {
  constructor(private userRepository: Repository<User>) {
    this.userRepository = userRepository || AppDataSource.getRepository(User);
  }

  async validateUser(username: string, password: string): Promise<User | null > {
    const user = await this.userRepository.findOne({ where: { username }, relations: ['ports'] });
    
    if (!user) {
      throw new Error('Invalid username or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid username or password');
    }

    // if (user && isPasswordValid) {
    //   return user;
    // }

    // const token = jwt.sign({ userId: user.id }, 'your_secret_key', { expiresIn: '1h' });
    // return token;

    return user;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { username }, relations: ['ports'] });
  }

  async validatePassword(username: string, password: string): Promise<boolean> {
    const user = await this.getUserByUsername(username);

    if (!user) return false;
    return await bcrypt.compare(password, user.password);
  }

  async login(user: User): Promise<{ user: User, token: string }> {
    const payload = { userId: user.id, username: user.username };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'sdfgrter4wr34r3ergdf54', { expiresIn: '10h' });
    return { user, token };
  }
}
