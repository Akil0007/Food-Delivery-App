/* eslint-disable prettier/prettier */
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { RegisterResponse } from './types/user.types';
import { RegisterDto } from './dto/user.dto';
import { BadRequestException } from '@nestjs/common';
import { User } from './entities/user.entity';
import { Response } from 'express';

@Resolver('user')
export class UserResolver {
  constructor(private readonly usersService: UsersService) {}

  @Mutation(() => RegisterResponse)
  async register(
    @Args('registerInput') registerDto: RegisterDto,
    @Context() context: { res: Response },
  ): Promise<any> {
    if (!registerDto.name || !registerDto.email || !registerDto.password) {
      throw new BadRequestException('please fill all the details');
    }
    const { user } = await this.usersService.register(registerDto, context.res);
    return { user };
  }

  @Query(() => [User])
  async getUsers() {
    return await this.usersService.getUsers();
  }
}
