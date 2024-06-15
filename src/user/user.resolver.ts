import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { UserService } from './user.service';
import { UserResponse } from './model/user.model';
import { CreateUseInput } from './dto/create.user.dto';
import { UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateUserBiometricInput } from './dto/update-biometric.user.dto';
import { AuthUser, UserDecorator } from '../auth/custom-decorators/authenticated-user-decorator';


@Resolver('user')
export class UserResolver {
    constructor(private readonly userService: UserService){}

    @Mutation(()=> UserResponse)
    async register(@Args('data') input: CreateUseInput):Promise<UserResponse>{
        return await this.userService.register(input);
    }

    @Query(()=> [UserResponse])
    @UseGuards(JwtGuard)
    async users(): Promise<UserResponse[]>{
        return this.userService.findUsers();
    }


    @Query(()=> [UserResponse])
    @UseGuards(JwtGuard)
    async user(): Promise<UserResponse[]>{
        return this.userService.findUsers();
    }

    @Mutation(()=> UserResponse)
    @UseGuards(JwtGuard) //Use should be loggedin to update biometric
    async updateBiometric(@Args('data') input: UpdateUserBiometricInput, @UserDecorator() authUser: AuthUser):Promise<UserResponse>{
        return await this.userService.updateBiometric({input, authUser});
    }
}
