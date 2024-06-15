import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { LoginResponse } from './dto/login-response';
import { LoginUserInput } from './dto/login-user.input';
import { UseGuards } from '@nestjs/common';
import { LocalGuard } from './guards/local-auth.guard';
import { LoginUserWithBiometric } from './dto/login-user-with-biometric.input';

@Resolver('auth')
export class AuthResolver {
    constructor(private readonly authService: AuthService){}

    @Mutation(()=> LoginResponse)
    @UseGuards(LocalGuard)
    async login(@Args('loginUserInput') input: LoginUserInput, @Context() context): Promise<LoginResponse>{
        //The user can be extracted from the context.
        return await this.authService.login(context.user);
    }

    @Mutation(()=> LoginResponse)
    async loginWithBiometric(@Args('loginWithBiometric') input: LoginUserWithBiometric): Promise<LoginResponse>{
        return await this.authService.loginWithBiometric(input);
    }
}
