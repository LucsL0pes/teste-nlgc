"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsuariosService = void 0;
const pdfkit_1 = require("pdfkit");
const common_1 = require("@nestjs/common");
const fs_1 = require("fs");
const fs = require("fs");
const path = require("path");
const path_1 = require("path");
const AMBIENTES_VALIDOS = ['AWS', 'AZR', 'B3', 'GCP', 'EQX', 'LWB', 'STECH', 'CMD'];
let UsuariosService = class UsuariosService {
    DATA_DIR = (() => {
        const dist = (0, path_1.join)(process.cwd(), 'dist', 'data');
        const src = (0, path_1.join)(process.cwd(), 'src', 'data');
        return (0, fs_1.existsSync)(dist) ? dist : src;
    })();
    DB_USER = (0, path_1.join)(this.DATA_DIR, 'saida_convertida.json');
    load() {
        if (!(0, fs_1.existsSync)(this.DB_USER))
            throw new common_1.BadRequestException(`Base não encontrada: ${this.DB_USER}`);
        return JSON.parse((0, fs_1.readFileSync)(this.DB_USER, 'utf-8'));
    }
    save(users) {
        (0, fs_1.writeFileSync)(this.DB_USER, JSON.stringify(users, null, 2), 'utf-8');
    }
    getAllEnrichedByTeam(team) {
        return this.load()
            .filter(u => u.time === team)
            .map(u => {
            const habilitados = (u.ambientes ?? []).map(a => a.nome);
            const desabilitados = AMBIENTES_VALIDOS.filter(a => !habilitados.includes(a));
            return {
                ...u,
                ambientesHabilitados: habilitados,
                ambientesDesabilitados: desabilitados,
                solicitacoes: u.solicitacoes ?? [],
            };
        });
    }
    addSolicitacao(username, { tipo, ambiente }) {
        if (!tipo || !ambiente)
            throw new common_1.BadRequestException('Tipo e ambiente são obrigatórios');
        const users = this.load();
        const user = users.find(u => u.username === username);
        if (!user)
            throw new common_1.NotFoundException('Usuário não encontrado');
        user.solicitacoes = user.solicitacoes ?? [];
        if (!user.solicitacoes.some(s => s.tipo === tipo && s.ambiente === ambiente)) {
            user.solicitacoes.push({ tipo, ambiente });
            this.save(users);
        }
        return user;
    }
    removeSolicitacao(username, { tipo, ambiente }) {
        const users = this.load();
        const user = users.find(u => u.username === username);
        if (!user)
            throw new common_1.NotFoundException();
        user.solicitacoes = (user.solicitacoes ?? [])
            .filter(s => !(s.tipo === tipo && s.ambiente === ambiente));
        this.save(users);
        return { ok: true };
    }
    zerarSolicitacoesByTeam(team) {
        const users = this.load();
        users
            .filter(u => u.time === team)
            .forEach(u => (u.solicitacoes = []));
        this.save(users);
    }
    buildPdfReport(solicitacoes, team) {
        const doc = new pdfkit_1.default({ margin: 40, size: 'A4' });
        const chunks = [];
        doc.on('data', c => chunks.push(c));
        const azul = '#00a1f6';
        const logo = path.join(process.cwd(), 'public', 'logo-nelogica.png');
        if (fs.existsSync(logo))
            doc.image(logo, doc.page.width / 2 - 40, 20, { width: 80 });
        doc.moveDown(2.5)
            .fontSize(18).fillColor(azul).font('Helvetica-Bold')
            .text(`Solicitações pendentes – equipe ${team}`, { align: 'center' })
            .moveDown(1);
        const col = [70, 80, 120, doc.page.width - 40 * 2 - 70 - 80 - 120];
        const startY = doc.y;
        const drawHeader = (y) => {
            doc.rect(40, y, col.reduce((a, b) => a + b, 0), 22).fillAndStroke(azul, azul);
            doc.fillColor('#fff').fontSize(11).font('Helvetica-Bold')
                .text('Tipo', 44, y + 6, { width: col[0] })
                .text('Ambiente', 44 + col[0], y + 6, { width: col[1] })
                .text('Usuário', 44 + col[0] + col[1], y + 6, { width: col[2] })
                .text('Nome', 44 + col[0] + col[1] + col[2], y + 6, { width: col[3] });
        };
        drawHeader(startY);
        let y = startY + 22;
        solicitacoes.forEach((r, i) => {
            if (y + 20 > doc.page.height - 50) {
                footer();
                doc.addPage();
                y = 40;
                drawHeader(y);
                y += 22;
            }
            doc.rect(40, y, col.reduce((a, b) => a + b, 0), 20)
                .fill(i % 2 ? '#F6F8FA' : '#E9EDF2');
            doc.fillColor('#000').font('Helvetica').fontSize(10)
                .text(r.tipo, 44, y + 6, { width: col[0] })
                .text(r.ambiente, 44 + col[0], y + 6, { width: col[1] })
                .text(r.username, 44 + col[0] + col[1], y + 6, { width: col[2] })
                .text(r.nome, 44 + col[0] + col[1] + col[2], y + 6, { width: col[3] });
            y += 20;
        });
        const footer = () => {
            const page = doc.page;
            doc.fontSize(8).fillColor('#666')
                .text(`Gerado em ${new Date().toLocaleString('pt-BR')} – página ${page.number}`, 40, page.height - 30, { width: page.width - 80, align: 'center' });
        };
        footer();
        doc.end();
        return Buffer.concat(chunks);
    }
};
exports.UsuariosService = UsuariosService;
exports.UsuariosService = UsuariosService = __decorate([
    (0, common_1.Injectable)()
], UsuariosService);
//# sourceMappingURL=usuarios.service.js.map