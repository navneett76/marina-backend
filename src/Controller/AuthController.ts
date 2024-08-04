import { Request, Response, Router } from 'express';
import { Service } from 'typedi';
import { AuthService } from '../services/AuthServices';
import { User } from '../entity/User';
import * as jwt from 'jsonwebtoken';
// import { config } from 'dotenv';
import { config } from '../config/docusign-data-source';

@Service()
export class AuthController {
  constructor(private authService: AuthService) {}

  async login(req: Request, res: Response): Promise<void> {
    const { username, password } = req.body;
    const user = await this.authService.validateUser(username, password);
    if (!user) {
      res.status(401).send('Invalid username or password');
      return;
    }
    const result = await this.authService.login(user);
    res.json(result);
  }

  async loginUser(req: Request, res: Response): Promise<void> {
    const { username, password } = req.body;
    try {
      const isValid = await this.authService.validatePassword(username, password);
      if (isValid) {
        const user = await this.authService.getUserByUsername(username);
        // console.log("userData: ", user);
        // console.log("config.JWT_SECRET: ", config.JWT_SECRET);
        const token = jwt.sign({ id: user!.id }, config.JWT_SECRET || 'JWT token');
        res.json({ token, user });
      } else {
        res.status(401).send('Invalid username or password');
      }
    } catch (error) {
      res.status(400).send('Error logging in');
    }
  }
}
