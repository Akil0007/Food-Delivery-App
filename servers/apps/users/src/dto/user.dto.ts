/* eslint-disable prettier/prettier */
import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

@InputType()
export class RegisterDto {
  @Field()
  @IsString({ message: 'Name is Required' })
  @IsNotEmpty({ message: 'Name can not be empty' })
  name: string;

  @Field()
  @IsNotEmpty({ message: 'Password is Required' })
  @MinLength(8, { message: 'Password must at least 8 chars' })
  password: string;

  @Field()
  @IsNotEmpty({ message: 'Email is Required' })
  @IsEmail({}, { message: 'Email is Invalid' })
  email: string;

  @Field()
  @IsNotEmpty({ message: 'Phone number is Required' })
  phoneNumber: number;
}

@InputType()
export class ActivationDto {
  @Field()
  @IsNotEmpty({ message: 'Activation token is required' })
  activationToken: string;

  @Field()
  @IsNotEmpty({ message: 'Activation code is required' })
  activationCode: string;
}

export class LoginDto {
  @Field()
  @IsNotEmpty({ message: 'Email is Required' })
  @IsEmail({}, { message: 'Email is Invalid' })
  email: string;

  @Field()
  @IsNotEmpty({ message: 'Password is Required' })
  password: string;
}
