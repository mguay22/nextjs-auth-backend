import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '../current-user.decorator';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { CreateUserInput } from './dto/create-user.input';
import { User } from './models/user.model';
import { UsersService } from './users.service';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Mutation(() => User)
  async createUser(@Args('createUserData') createUserData: CreateUserInput) {
    return this.usersService.createUser(createUserData);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => User, { name: 'me' })
  getMe(@CurrentUser() user: User) {
    return user;
  }
}
