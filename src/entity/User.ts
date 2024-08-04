import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, OneToMany, Unique } from 'typeorm';
import { Port } from './Port';
import * as bcrypt from 'bcrypt';
import { Customer } from './Customer';
import { Contract } from './Contract';

@Entity()
@Unique(['username'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column()
  companyName: string;

  @Column()
  companyAddress: string;

  @ManyToMany(() => Port, port => port.users, { cascade: true })
  @JoinTable()
  ports: Port[];


  @OneToMany(() => Customer, customer => customer.user)
  customers: Customer[];

  @OneToMany(() => Contract, contract => contract.user)
  contracts: Contract[];

  // @BeforeInsert()
  // async hashPassword() {
  //   this.password = await bcrypt.hash(this.password, 10);
  // }
}
