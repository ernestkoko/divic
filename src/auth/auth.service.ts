import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { LoginResponse } from './dto/login-response';
import { User } from '@prisma/client';
import { JwtService} from '@nestjs/jwt'
import { LoginUserWithBiometric } from './dto/login-user-with-biometric.input';

@Injectable()
export class AuthService {
    constructor(private readonly userService: UserService, 
        private readonly jwtService: JwtService
    ){}

    async validateUser({email, password}:{email: string, password: string}): Promise<User>{
        const user = await this.userService.findOneByEmail(email);
        if(!user) throw new BadRequestException("Invalid login credentials"); //The email is not correct;
        if(!user.password) throw new BadRequestException("User does not have a password");
        const isCorrect = await bcrypt.compare(password, user.password);
        if(!isCorrect){
            //Password passed in is not correct.
            throw new BadRequestException("Invalid login credentials"); //Not passing the exact message so the client doesnt know it is the password that is not correct for security reasons.
        }
    
        //User is found with correct password and email
        delete user.password; //I do not want the password to go with the usr object. I am deleting it.
        return user;
    }

    //Handles login
    async  login(user: User): Promise<LoginResponse> {
        //Sign the payload.
        const token = await this.signPayload({id: user.id, email: user.email});
        return {
            token,
            user,
        };
    }


    async loginWithBiometric(input: LoginUserWithBiometric): Promise<LoginResponse>{
        
        ///I would prefer getting the biometric key and the email from the client at login as opposed to only using the biometricKey
        ///because in a situation I have a large number of users this for-loop will increase the latency off the app.
        const users = await this.userService.findUsers();
        for(const user of users){
            if(user.biometricKey && await bcrypt.compare(input.biometricKey, user.biometricKey)){
                const token = await this.signPayload({id: user.id, email: user.email});
                return {
                    token,
                    user,
                };
            }
        }
        throw new BadRequestException("Invalid credential");
    }

    ///Sign the payload for the token
    async signPayload(payload: any): Promise<string>{
        try {
            const token =
            await this.jwtService.signAsync(payload, {
                secret: process.env.JWT_SECRET,
            });
        return token;
        }catch(error){
            throw new InternalServerErrorException('Internal server exception!');
        }
    }
}
