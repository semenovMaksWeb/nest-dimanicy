import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CategoriesGetTodoDto {
  @ApiProperty()
  @IsNumber({}, { message: 'id категории должен является числом' })
  @IsNotEmpty({ message: 'id категории обязательное поле' })
  id: number;
}
