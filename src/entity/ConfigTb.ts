import {
  Entity, PrimaryGeneratedColumn, Column, Unique, CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
@Unique(['userkey'])
export class ConfigTb {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userkey: string;

  @Column({ type: 'text' })
  uservalue: string;

  @Column()
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
