"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsuariosController = void 0;
const common_1 = require("@nestjs/common");
const usuarios_service_1 = require("../service/usuarios.service");
const auth_service_1 = require("../../auth/auth.service");
let UsuariosController = class UsuariosController {
    usuariosService;
    authService;
    constructor(usuariosService, authService) {
        this.usuariosService = usuariosService;
        this.authService = authService;
    }
    getAllView(req) {
        const username = req.cookies?.user;
        if (!username)
            return { redirect: '/login' };
        const team = this.authService.getTime(username);
        const usuarios = this.usuariosService.getAllEnrichedByTeam(team);
        return { usuarios, ambientesValidos: ['AWS', 'AZR', 'B3', 'GCP', 'EQX', 'LWB', 'STECH', 'CMD'] };
    }
    add(u, b) {
        return this.usuariosService.addSolicitacao(u, b);
    }
    remove(u, b) {
        return this.usuariosService.removeSolicitacao(u, b);
    }
    async downloadAndClear(req, res) {
        const username = req.cookies?.user;
        if (!username)
            return res.redirect('/login');
        const team = this.authService.getTime(username);
        const usuarios = this.usuariosService.getAllEnrichedByTeam(team);
        const pendentes = usuarios.flatMap(u => (u.solicitacoes ?? []).map(s => ({
            username: u.username,
            nome: u.nome,
            ambiente: s.ambiente,
            tipo: s.tipo,
        })));
        if (pendentes.length === 0)
            return res.status(400).json({ message: 'Sem solicitações pendentes.' });
        const pdf = this.usuariosService.buildPdfReport(pendentes, team);
        res
            .status(200)
            .set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="solicitacoes.pdf"',
            'Content-Length': pdf.length,
        })
            .send(pdf);
        this.usuariosService.zerarSolicitacoesByTeam(team);
    }
};
exports.UsuariosController = UsuariosController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.Render)('usuarios'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsuariosController.prototype, "getAllView", null);
__decorate([
    (0, common_1.Post)(':username/solicitacao'),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], UsuariosController.prototype, "add", null);
__decorate([
    (0, common_1.Delete)(':username/solicitacao'),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], UsuariosController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('solicitacoes/pdf'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsuariosController.prototype, "downloadAndClear", null);
exports.UsuariosController = UsuariosController = __decorate([
    (0, common_1.Controller)('usuarios'),
    __metadata("design:paramtypes", [usuarios_service_1.UsuariosService,
        auth_service_1.AuthService])
], UsuariosController);
//# sourceMappingURL=usuarios.controller.js.map