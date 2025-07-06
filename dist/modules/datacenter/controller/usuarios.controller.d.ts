import { Request, Response } from 'express';
import { UsuariosService, Solicitacao } from '../service/usuarios.services';
import { AuthService } from '../../../auth/auth.service';
export declare class UsuariosController {
    private readonly usuariosService;
    private readonly authService;
    constructor(usuariosService: UsuariosService, authService: AuthService);
    getAllView(req: Request): {
        redirect: string;
        usuarios?: undefined;
        ambientesValidos?: undefined;
    } | {
        usuarios: any;
        ambientesValidos: string[];
        redirect?: undefined;
    };
    add(u: string, b: Solicitacao): any;
    remove(u: string, b: Solicitacao): any;
    downloadAndClear(req: Request, res: Response): Promise<void | Response<any, Record<string, any>>>;
}
