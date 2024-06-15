import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserResponse } from './model/user.model';
import { CreateUseInput } from './dto/create.user.dto';
import { User } from '@prisma/client';
import { hashPassword } from '../utils/helper';
import { UpdateUserBiometricInput } from './dto/update-biometric.user.dto';
import { AuthUser } from '../auth/custom-decorators/authenticated-user-decorator';
import * as bcrypt from 'bcrypt';


@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService ){}

    async register(input: CreateUseInput): Promise<UserResponse>{
        //check if the user with email alrady exists.
        const userExists = await this.findOneByEmail(input.email.trim());
        if(userExists) throw new BadRequestException("User already exists");
        const hashedPassword = await hashPassword(input.password);
        const user = this.prisma.user.create({
            data:{
                email: input.email.trim().toLowerCase(),
                password: hashedPassword
            }
        });
        return user;
    }

    async findUsers(): Promise<User[]>{
        return await this.prisma.user.findMany();
    }

    async findOneById(id: number): Promise<User>{
        const user = await this.prisma.user.findUnique({
            where:{
                id
            }
        });
        if(!user) throw new BadRequestException("User not found");
        return user;
    }

    async findOneByEmail(email: string): Promise<User>{
        const user = await this.prisma.user.findUnique({
            where: {
                email
            }
        });
        return user;
    }

    //I am using the email from the user that has the bearer token because I do not want user to reset biometricKey for another.
    //That means you can only change biometricKey for yourself.
    async updateBiometric({input, authUser}:{input: UpdateUserBiometricInput, authUser: AuthUser}): Promise<UserResponse>{
        const user = await this.findOneByEmail(authUser.email);
        if(!user) throw new BadRequestException("User not found!");

        //To ensure biometric key is unique, check if a user has the biometric already.
        const users = await this.prisma.user.findMany();
        for (const u of users){

            if(u.biometricKey && await bcrypt.compare(input.biometricKey, u.biometricKey) && user.email != u.email){
                //Biometric key belongs to another user.
                throw new BadRequestException("Biometric key already used.");
            }
        }
        
        //Update the user's biometric key
        await this.prisma.user.update({
            data: {
                biometricKey: await hashPassword(input.biometricKey.trim())
            },
            where:{
                email: authUser.email
            }
        });
        return user;
    }

    async findOneWithBiometricKey(biometricKey: string): Promise<User>{
        const user = await this.prisma.user.findFirst({
            where:{
                biometricKey
            }
        });
        if(!user) throw new BadRequestException("User nott found!");
        return user;
    }
}
