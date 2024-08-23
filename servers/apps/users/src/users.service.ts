/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtVerifyOptions } from '@nestjs/jwt';
import { ActivationDto, LoginDto, RegisterDto } from './dto/user.dto';
import { PrismaService } from '../../../prisma/Prisma.Service';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';
import { EmailService } from './email/email.service';

interface UserData {
  name: string;
  email: string;
  password: string;
  phoneNumber: number;
}

@Injectable()
export class UsersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private configService: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  // register service
  async register(registerDto: RegisterDto, response: Response) {
    const { name, email, password, phoneNumber } = registerDto;
    console.log('register user', registerDto);
    const isEmailExist = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });
    if (isEmailExist) {
      throw new BadRequestException('User already exist with this email');
    }

    const isPhoneNumberExist = await this.prismaService.user.findUnique({
      where: {
        phoneNumber,
      },
    });
    if (isPhoneNumberExist) {
      throw new BadRequestException(
        'User already exist with this phone number',
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      name,
      email,
      password: hashedPassword,
      phoneNumber,
    };

    const activationToken = this.createActivationToken(user);
    const activationCode = (await activationToken).activationCode;

    // send email
    await this.emailService.sendEmail({
      email,
      subject: 'Activayte your account',
      template: './activation-mail',
      name,
      activationCode,
    });
    console.log('created code', activationCode);
    return { user, response };
  }

  // create activation token
  async createActivationToken(user: UserData) {
    const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
    const token = this.jwtService.sign(
      {
        user,
        activationCode,
      },
      {
        secret: this.configService.get<string>('ACTIVATION_SECRET'),
        expiresIn: '5m',
      },
    );
    return { token, activationCode };
  }

  // activation user
  async activateUser(activationDto: ActivationDto, response: Response) {
    const { activationToken, activationCode } = activationDto;
    const newUser: { user: UserData; activationCode: string } =
      this.jwtService.verify(activationToken, {
        secret: this.configService.get('ACTIVATION_SECRET'),
      } as JwtVerifyOptions) as { user: UserData; activationCode: string };

    if (newUser.activationCode != activationCode) {
      throw new BadRequestException('Invalid Activation Code');
    }

    const { name, email, password, phoneNumber } = newUser.user;
    const isEmailExist = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });
    if (isEmailExist) {
      throw new BadRequestException('User exist with this email');
    }
    const user = await this.prismaService.user.create({
      data: {
        name,
        email,
        password,
        phoneNumber,
      },
    });
    return { user, response };
  }

  // login service
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = {
      email: email,
      password: password,
    };
    return user;
  }

  // get all users service
  async getUsers() {
    const users = await this.prismaService.user.findMany({});
    return users;
  }
}
