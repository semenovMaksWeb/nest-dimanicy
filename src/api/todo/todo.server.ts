import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Todo } from './todo.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { TodoCreateDto } from './todo.dto/todo-create.dto';
import { CategoriesService } from '../categories/categories.server';
import { TodoUpdateActiveDto } from './todo.dto/todo-update-active.dto';
import { PutValidate } from '../../lib/put-validate';
import { TodoUpdateDto } from './todo.dto/todo-update.dto';
import { Pagination } from '../../lib/pagination';
import { TodoGetFilterDto } from './todo.dto/todo-get-filter.dto';
import { User } from '../user/user.entity';

@Injectable()
export class TodoService {
  constructor(
    @InjectRepository(Todo)
    private todoRepository: Repository<Todo>,
    private categoriesService: CategoriesService,
  ) {}

  async postTodoUser(todoCreateDto: TodoCreateDto, userId: number) {
    todoCreateDto.categories = await this.categoriesService.saveCategoriesTodo(
      todoCreateDto.categories,
    );
    await this.todoRepository.save({ ...todoCreateDto, user: { id: userId } });
    return 'Задача успешно добавлена';
  }

  async updateTodoActiveUser(
    id: number,
    todoUpdateActiveDto: TodoUpdateActiveDto,
    idUser: number,
  ): Promise<string> {
    const todo = await this.getTodoUserId(id);
    this.validateTodoUser(todo, idUser);
    await this.todoRepository.update(id, {
      active: todoUpdateActiveDto.active,
    });
    return 'Вы успешно поменяли активность задачи';
  }

  async updateTodoUser(
    id: number,
    todoUpdateDto: TodoUpdateDto,
    idUser: number,
  ) {
    const todo = await this.getTodoUserId(id);
    this.validateTodoUser(todo, idUser);
    todoUpdateDto.categories = await this.categoriesService.saveCategoriesTodo(
      todoUpdateDto.categories,
    );
    await this.todoRepository.save({ ...todoUpdateDto, id: id });
    return 'Задача успешно измененна';
  }

  async getTodoUserId(id: number) {
    return await this.todoRepository.findOne(id, { relations: ['user'] });
  }

  async getTodoUser(userId: number, query: TodoGetFilterDto) {
    const { skip, take } = Pagination(query?.limit, query?.page);
    const sqlCreate = this.todoRepository
      .createQueryBuilder('todo')
      .where({ user: { id: userId } })
      .skip(skip)
      .take(take)
      .select([
        'todo.id',
        'categories.id',
        'categories.name',
        'todo.active',
        'todo.title',
        'todo.text',
        'todo.create',
      ]);
    this.addSqlWhereTitle(sqlCreate, query.title);
    this.addSqlWhereActive(sqlCreate, query.active);
    this.addSqlWhereCategories(sqlCreate);
    const [list, count] = await sqlCreate.getManyAndCount();
    return {
      data: list,
      count,
      // listCategories: await this.getTodoCategoriesUser(userId),
    };
  }
  async getTodoAll() {
    return await this.todoRepository.find({
      relations: ['categories', 'user'],
    });
  }

  addSqlWhereTitle(sqlCreate: SelectQueryBuilder<Todo>, title?: string) {
    if (title) {
      sqlCreate.andWhere('todo.title LIKE :title', { title: `%${title}%` });
    }
  }
  addSqlWhereActive(sqlCreate: SelectQueryBuilder<Todo>, active?: boolean) {
    if (active) {
      sqlCreate.andWhere('todo.active= :active', { active: active });
    }
  }
  addSqlWhereCategories(sqlCreate: SelectQueryBuilder<Todo>) {
    sqlCreate.innerJoin('todo.categories', 'categories');
  }

  validateTodoUser(todo: Todo, idUser: number) {
    if (todo && todo.user.id === idUser) {
      return;
    }
    this.errors404Todo();
  }

  errors404Todo() {
    throw new HttpException(
      'Указанная задача не найдена',
      HttpStatus.NOT_FOUND,
    );
  }
}
