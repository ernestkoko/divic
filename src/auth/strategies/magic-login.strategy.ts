import { PassportStrategy } from "@nestjs/passport";
import Strategy from "passport-magic-login";

export class MagicLoginStrategy extends PassportStrategy(Strategy){
    constructor(){
        super({
            secret: process.env.JWT_SECRET
        });
    }
}