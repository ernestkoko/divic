import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType({description: 'user'})
export class UserResponse{
    @Field(()=> Number)
    id: number;

    @Field()
    email: string;
    
    @Field()
    createdAt: Date;

    @Field()
    updatedAt: Date;
}