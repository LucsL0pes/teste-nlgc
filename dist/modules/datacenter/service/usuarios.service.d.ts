export interface Solicitacao {
    tipo: string;
    ambiente: string;
}
export interface Ambiente {
    nome: string;
    grupos: string[];
}
export interface Usuario {
    username: string;
    nome: string;
    time: string;
    ambientes?: Ambiente[];
    solicitacoes?: Solicitacao[];
}
export declare class UsuariosService {
    private readonly DATA_DIR;
    private readonly DB_USER;
    private load;
    private save;
    getAllEnrichedByTeam(team: string): {
        ambientesHabilitados: string[];
        ambientesDesabilitados: string[];
        solicitacoes: Solicitacao[];
        username: string;
        nome: string;
        time: string;
        ambientes?: Ambiente[];
    }[];
    addSolicitacao(username: string, { tipo, ambiente }: Solicitacao): Usuario;
    removeSolicitacao(username: string, { tipo, ambiente }: Solicitacao): {
        ok: boolean;
    };
    zerarSolicitacoesByTeam(team: string): void;
    buildPdfReport(solicitacoes: {
        username: string;
        nome: string;
        tipo: string;
        ambiente: string;
    }[], team: string): Buffer;
}
