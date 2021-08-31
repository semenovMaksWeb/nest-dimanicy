import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToMany,
} from 'typeorm';
import { Roles } from '../roles/roles.entity';

@Entity()
export class Rights {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true,
  })
  name: string;

  @Column({ default: false })
  system: boolean;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn()
  create: Date;

  @ManyToMany(() => Roles, (roles) => roles.id)
  roles: Roles[];
}
