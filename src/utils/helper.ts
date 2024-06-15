
import { HttpException, HttpStatus } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

///Any service can call the functions here to perform their tasks


///Generates random code
export function generateOtp(
    {length = 6, upper_case =false, lower_case = false, random_num = true}
     :{length: number, upper_case?: boolean, lower_case?: boolean, random_num?: boolean}) : string{
    let result: string = '';
    if (upper_case)  result = "ABCDEFGHIJKLMNOPQRSTUVWZYZ" ;
    if (lower_case)  result += "abcdefghijklmnopqrstuvwxyz" ;
    if (random_num) result += '0123456789';
    let otp = "";
    for (let p = 0; p < length; p++) {
        otp += result[Math.floor(Math.random() * result.length)];
    }
    return otp;
}

export async function hashPassword(password: string){
    try{
        const n = generateOtp({length: 15, upper_case: true, lower_case: true, random_num: true});
        const s = await bcrypt.genSalt(parseInt(process.env.SALT));
        const h = await bcrypt.hash(n, s);
        return  await bcrypt.hash(password, h);
    } catch (error){
        throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}