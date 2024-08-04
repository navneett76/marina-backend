import {
    Entity, PrimaryGeneratedColumn, Column, CreateDateColumn
  } from 'typeorm';
  
  @Entity()
  export class ApiCall {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    requestURL: string;

    @Column({type: 'text'})
    requestBody: string;
  
    @Column({ type: 'text' })
    responseBody: string;
  
    @CreateDateColumn()
    createdAt: Date;
  
  }
  