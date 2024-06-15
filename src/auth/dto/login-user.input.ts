import { Field, InputType } from "@nestjs/graphql";
import { IsEmail, IsStrongPassword } from "class-validator";

@InputType()
export class LoginUserInput{

    @Field()
    @IsEmail()
    email: string;


    @Field()
    password: string;
}