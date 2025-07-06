import { Response } from 'express';
import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly auth;
    constructor(auth: AuthService);
    getLogin(res: Response): void;
    postLogin(body: {
        username: string;
        password: string;
    }, res: Response): Promise<void>;
    logout(res: Response): void;
}
