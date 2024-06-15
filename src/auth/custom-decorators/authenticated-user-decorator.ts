import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const UserDecorator = createParamDecorator((data: any, context: ExecutionContext) =>{
    //I am extracting the auth user from the context.
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    return request.user;
});

///Concrete class for the authenticated user.
export class AuthUser{
    id: number;
    email: string;
    constructor(id: number, email: string){
        this.id = id;
        this.email = email;
    }
}