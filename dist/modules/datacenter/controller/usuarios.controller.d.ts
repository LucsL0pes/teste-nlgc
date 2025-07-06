import { Request, Response } from 'express';
import { UsuariosService, Solicitacao } from '../service/usuarios.service';
import { AuthService } from '../../auth/auth.service';
export declare class UsuariosController {
    private readonly usuariosService;
    private readonly authService;
    constructor(usuariosService: UsuariosService, authService: AuthService);
    getAllView(req: Request): {
        redirect: string;
        usuarios?: undefined;
        ambientesValidos?: undefined;
    } | {
        usuarios: {
            ambientesHabilitados: string[];
            ambientesDesabilitados: string[];
            solicitacoes: Solicitacao[];
            username: string;
            nome: string;
            time: string;
            ambientes?: import("../service/usuarios.service").Ambiente[];
        }[];
        ambientesValidos: string[];
        redirect?: undefined;
    };
    add(u: string, b: Solicitacao): import("../service/usuarios.service").Usuario;
    remove(u: string, b: Solicitacao): {
        ok: boolean;
    };
    downloadAndClear(req: Request, res: Response): Promise<void | Response<any, Record<string, any>>>;
}
