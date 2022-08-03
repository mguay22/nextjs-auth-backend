import {
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from './users.repository';
import { CreateUserInput } from './dto/create-user.input';
import { UserDocument } from './models/user.schema';
import { User } from './models/user.model';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async createUser(data: CreateUserInput) {
    await this.validateCreateUserData(data);
    const userDocument = await this.usersRepository.create({
      ...data,
      password: await bcrypt.hash(data.password, 10),
    });
    return this.getUserFromDocument(userDocument);
  }

  private async validateCreateUserData(data: CreateUserInput) {
    let userDocument: UserDocument;
    try {
      userDocument = await this.usersRepository.findOne({
        email: data.email,
      });
    } catch (err) {}

    if (userDocument) {
      throw new UnprocessableEntityException('Email already exists.');
    }
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersRepository.findOne({ email });
    const passwordIsValid = await bcrypt.compare(password, user.password);
    if (!passwordIsValid) {
      throw new UnauthorizedException('Credentials are not valid.');
    }
    return user;
  }

  async getUser(args: Partial<User>) {
    const userDocument = await this.usersRepository.findOne(args);
    return this.getUserFromDocument(userDocument);
  }

  private getUserFromDocument(userDocument: UserDocument): User {
    return {
      _id: userDocument._id.toHexString(),
      email: userDocument.email,
    };
  }
}
