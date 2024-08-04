import { AuthService } from "../services/AuthServices";
import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
// import { DataSource } from 'typeorm';
import { Repository } from 'typeorm';
import { User } from "../entity/User";
import { AppDataSource } from "../config/data-source";
// import { config } from "../config/docusign-data-source";

jest.mock('bcrypt');
jest.mock('jsonwebtoken', () => ({
    sign: jest.fn(),
  }));

jest.mock('../config/data-source', () => {
    const actualDataSource = jest.requireActual('typeorm');
    return {
      ...actualDataSource,
      AppDataSource: {
        getRepository: jest.fn().mockReturnValue({
          findOne: jest.fn(),
        }),
        initialize: jest.fn().mockResolvedValue({}),
        destroy: jest.fn(),
      },
    };
  });

describe("Auth Service", ()=>{
    let authService: AuthService;
    let userRepositoryMock: any;
    // let dataSourceMock: any;
  
    beforeEach(async () => {
        // const userRepositoryMock = AppDataSource.getRepository(User);
        userRepositoryMock = {
            findOne: jest.fn(),
            // Mock other repository methods as needed
          } as unknown as jest.Mocked<Repository<User>>;
        authService = new AuthService(userRepositoryMock);    
        await AppDataSource.initialize();
    });

    afterEach(()=>{
        jest.clearAllMocks();
    })

    it("should throw an error if the user is not found", async ()=> {
        userRepositoryMock.findOne.mockResolvedValue(null);
        await expect(authService.validateUser("navneet", "userpassowrd")).rejects.toThrow("Invalid username or password");
    })

    it('should throw an error if the password is invalid', async () => {
        const user = { id: 1, username: 'testuser', password: 'hashedPassword' };
        userRepositoryMock.findOne.mockResolvedValue(user);
        (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    
        await expect(authService.validateUser('testuser', 'password')).rejects.toThrow('Invalid username or password');
      });
    
      it('should return a user if the username and password are valid', async () => {
        const user = { id: 1, username: 'testuser', password: 'hashedPassword' };
        userRepositoryMock.findOne.mockResolvedValue(user);
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);
        // (jwt.sign as jest.Mock).mockReturnValue('mockedToken');
    
        const token = await authService.validateUser('testuser', 'password');
        expect(token).toBe(user);
        // expect(jwt.sign).toHaveBeenCalledWith({ userId: user.id }, 'your_secret_key', { expiresIn: '1h' });
      });

      it('should return a JWT token if the username and password are valid', async () => {
        const user = { id: 1, username: 'testuser', password: 'hashedPassword' };
        userRepositoryMock.findOne.mockResolvedValue(user);
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);
        // (jwt.sign as jest.Mock).mockReturnValue('mockedToken');
    
        const token = await authService.validateUser('testuser', 'password');
        expect(token).toBe(user);
        // expect(jwt.sign).toHaveBeenCalledWith({ userId: user.id }, 'your_secret_key', { expiresIn: '1h' });
      });

})