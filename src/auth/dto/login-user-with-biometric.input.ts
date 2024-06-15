import { Field, InputType } from "@nestjs/graphql";
import { IsNotEmpty, IsString } from "class-validator";

@InputType()
export class LoginUserWithBiometric{
    @Field()
    @IsNotEmpty()
    @IsString()
    biometricKey: string;
}