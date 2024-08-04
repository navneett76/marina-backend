import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, Unique, OneToMany } from 'typeorm';
import { User } from './User';
import { Customer } from './Customer';

@Entity()
@Unique(['portName'])
export class Port {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  portName: string;

  @ManyToMany(() => User, user => user.ports)
  users: User[];

  @OneToMany(() => Customer, customer => customer.port)
  customers: Customer[];
}
