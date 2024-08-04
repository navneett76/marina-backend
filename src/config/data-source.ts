import { DataSource } from 'typeorm';
import { Customer } from '../entity/Customer';
import { User } from '../entity/User';
import { Port } from '../entity/Port';

import 'reflect-metadata';
import { Contract } from '../entity/Contract';
import { ConfigTb } from '../entity/ConfigTb';
import { ApiCall } from '../entity/APICall';
import { AllContracts } from '../entity/AllContracts';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'fssUser@2023',
  database: 'marina',
  synchronize: true,
  logging: ['query', 'error'],
  entities: [Customer, User, Port, Contract, ConfigTb, ApiCall, AllContracts],
  migrations: [],
  subscribers: [],
});

AppDataSource.initialize()
  .then(() => {
    console.log('Data Source has been initialized!');
  })
  .catch((err) => {
    console.error('Error during Data Source initialization', err);
  });