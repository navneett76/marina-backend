import { Request, Response, Router } from 'express';
import { Service } from 'typedi';
import { UserService } from '../services/UserService';
import { User } from '../entity/User';
import * as bcrypt from 'bcrypt';

@Service()
export class UserController {
  constructor(private userService: UserService) {}

  async getUserById(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id, 10);
    const user = await this.userService.getUserById(id);
    if (!user) {
      res.status(404).send('User not found');
      return;
    }
    res.json(user);
  }

  async createUser(req: Request, res: Response): Promise<void> {
    const user: User  = req.body;
    // const portNames = user.ports;
    user.password = await bcrypt.hash(user.password.trim(), 10);
    // console.log("user password created: ", user.password)
    try {
      const newUser = await this.userService.createUser(user);
      res.json(newUser);
    } catch (error) {
      res.status(400).send('User with this username already exists'+ JSON.stringify(error));
    }
  }

  async addPortToUser(req: Request, res: Response): Promise<void> {
    const userId = parseInt(req.params.id, 10);
    const { portName } = req.body;
    try {
      const user = await this.userService.addPortToUser(userId, portName);
      if (!user) {
        res.status(404).send('User not found');
        return;
      }
      res.json(user);
    } catch (error) {
      res.status(400).send('Error adding port to user');
    }
  }
}