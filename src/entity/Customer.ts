import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, BeforeInsert, OneToMany } from 'typeorm';
import { Port } from './Port';
import { User } from './User';
import { Contract } from './Contract';

@Entity()
export class Customer {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  fname: string;

  @Column()
  lname: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column()
  vessel: string;

  @Column()
  loa: number;

  @Column()
  beam: number;

  @Column()
  draft: number;

  @Column()
  address1: string;

  @Column()
  address2: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column()
  zip: string;

  @Column()
  country: string;

  @ManyToOne(() => User, user => user.customers)
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => Port, port => port.customers)
  port: Port;

  @Column()
  portId: number;

  @Column()
  starttime: Date;

  @Column()
  endtime: Date;
  
  @Column()
  price: number

  @OneToMany(() => Contract, contract => contract.customer)
  contracts: Contract[];
  
  @Column()
  createddate: Date;

}
