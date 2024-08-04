import {
    Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Unique
  } from 'typeorm';

  
  @Entity()
  @Unique(['envelopeId'])
  export class AllContracts {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    status: string;
    
  
    @Column()
    emailSubject: string;
    
    @Column()
    envelopeId: string;

    @Column()
    senderEmail: string;
  

    @Column()
    sentDateTime: Date;
    
    @Column()
    statusChangedDateTime: Date;
  
    @CreateDateColumn()
    createdAt: Date;

  
  }
  