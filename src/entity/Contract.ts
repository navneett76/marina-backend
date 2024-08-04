// src/entity/Contract.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn
} from 'typeorm';
import { User } from './User';
import { Customer } from './Customer';


@Entity()
export class Contract {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, user => user.contracts)
    user: User;

    @Column()
    customerName: string;

    @Column()
    customerEmail: string;

    @Column()
    documentUrl: string;

    @Column()
    status: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => Customer, customer => customer.contracts)
    customer: Customer;

    @Column()
    customerId: number;

    // Set up the relationship with the Customer entity
    // @ManyToOne(() => Customer, customer => customer.id)
    // @JoinColumn({ name: 'customerId' })
    // customer: Customer;
}
