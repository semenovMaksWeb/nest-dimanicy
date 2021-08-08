import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Rights } from '../rights/rights.entity';

@Entity()
export class Roles {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @CreateDateColumn()
  create: Date;

  @ManyToMany(() => User, (user) => user.id)
  user: User[];

  @ManyToMany(() => Rights, (rights) => rights.id)
  @JoinTable()
  rights: Rights[];
}
