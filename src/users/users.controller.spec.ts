import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { NotFoundException } from '@nestjs/common';

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    usersController = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'securepassword',
        name: 'Test User',
      };

      const createdUser = {
        id: 1,
        ...createUserDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(usersService, 'create').mockResolvedValue(createdUser);

      expect(await usersController.create(createUserDto)).toEqual(createdUser);
      expect(usersService.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users = [
        {
          id: 1,
          email: 'test@example.com',
          password: 'securepassword',
          name: 'Test User',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      jest.spyOn(usersService, 'findAll').mockResolvedValue(users);

      expect(await usersController.findAll()).toEqual(users);
      expect(usersService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a user if found', async () => {
      const user = {
        id: 1,
        email: 'test@example.com',
        password: 'securepassword',
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest.spyOn(usersService, 'findOne').mockResolvedValue(user);

      expect(await usersController.findOne('1')).toEqual(user);
    });

    it('should throw NotFoundException if user is not found', async () => {
      jest
        .spyOn(usersService, 'findOne')
        .mockRejectedValue(new NotFoundException());
      await expect(usersController.findOne('1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update and return the user', async () => {
      const updateUserDto: UpdateUserDto = { email: 'updated@example.com' };
      const updatedUser = {
        id: 1,
        ...updateUserDto,
        password: 'securepassword',
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest.spyOn(usersService, 'update').mockResolvedValue(updatedUser);

      expect(await usersController.update('1', updateUserDto)).toEqual(
        updatedUser,
      );
      expect(usersService.update).toHaveBeenCalledWith(1, updateUserDto);
    });
  });

  describe('remove', () => {
    it('should delete the user', async () => {
      const deletedUser = {
        id: 1,
        email: 'test@example.com',
        password: 'securepassword',
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest.spyOn(usersService, 'remove').mockResolvedValue(deletedUser);

      expect(await usersController.remove('1')).toEqual(deletedUser);
      expect(usersService.remove).toHaveBeenCalledWith(1);
    });
  });
});
