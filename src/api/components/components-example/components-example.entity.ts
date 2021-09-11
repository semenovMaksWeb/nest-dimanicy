import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Components } from '../components/components.entity';
import { ComponentsVar } from '../components-var/components-var.entity';
import { ComponentsContentExampleParams } from '../components-content-example-params/components-content-example-params.entity';

@Entity()
export class ComponentsExample {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: false })
  name: string;

  @ManyToOne(() => Components, (components) => components.id)
  components: Components;

  @OneToMany(
    () => ComponentsContentExampleParams,
    (componentsContentExampleParams) => componentsContentExampleParams.id,
  )
  components_example_params: ComponentsContentExampleParams;
}