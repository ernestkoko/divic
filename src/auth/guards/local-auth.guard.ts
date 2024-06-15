import { ExecutionContext } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { AuthGuard } from "@nestjs/passport";

export class LocalGuard extends AuthGuard('local'){
    constructor(){
        super();
    }

    getRequest(context: ExecutionContext) {
        //need to extract the login credentials from the app context to the graphql context.
        //This is needed in graphql but if we were using normal REST API this would not be needed.
        const ctx = GqlExecutionContext.create(context);
        const request = ctx.getContext();
        request.body = ctx.getArgs().loginUserInput;
        return request;
    }
}