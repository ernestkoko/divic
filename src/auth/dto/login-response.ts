import { Field, ObjectType } from "@nestjs/graphql";
import { UserResponse } from "../../user/model/user.model";

@ObjectType()
export class LoginResponse{
    @Field()
    token: string;

    @Field(()=> UserResponse)
    user: UserResponse;
}