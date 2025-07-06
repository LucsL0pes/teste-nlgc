import PDFDocument from 'pdfkit';
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import * as fs from 'fs';
import * as path from 'path';
import { join } from 'path';

export interface Solicitacao { tipo: string; ambiente: string }
export interface Ambiente   { nome: string; grupos: string[] }

export interface Usuario {
  username:      string;
  nome:          string;
  time:          string;
  ambientes?:    Ambiente[];
  solicitacoes?: Solicitacao[];
}

const AMBIENTES_VALIDOS = ['AWS','AZR','B3','GCP','EQX','LWB','STECH','CMD'];

/* ────────────────────────── serviço ────────────────────────── */
@Injectable()
export class UsuariosService {
  /* paths */
  private readonly DATA_DIR = (() => {
    const dist = join(process.cwd(), 'dist', 'data');
    const src  = join(process.cwd(), 'src',  'data');
    return existsSync(dist) ? dist : src;
  })();
  private readonly DB_USER   = join(this.DATA_DIR, 'saida_convertida.json');

  /* helpers IO */
  private load(): Usuario[] {
    if (!existsSync(this.DB_USER))
      throw new BadRequestException(`Base não encontrada: ${this.DB_USER}`);
    return JSON.parse(readFileSync(this.DB_USER, 'utf-8'));
  }
  private save(users: Usuario[]) {
    writeFileSync(this.DB_USER, JSON.stringify(users, null, 2), 'utf-8');
  }

  /* ──────────────── queries ──────────────── */
  getAllEnrichedByTeam(team: string) {
    return this.load()
      .filter(u => u.time === team)
      .map(u => {
        const habilitados   = (u.ambientes ?? []).map(a => a.nome);
        const desabilitados = AMBIENTES_VALIDOS.filter(a => !habilitados.includes(a));
        return {
          ...u,
          ambientesHabilitados  : habilitados,
          ambientesDesabilitados: desabilitados,
          solicitacoes          : u.solicitacoes ?? [],
        };
      });
  }

  /* ──────────────── solicitações ──────────────── */
  addSolicitacao(username: string, { tipo, ambiente }: Solicitacao) {
    if (!tipo || !ambiente)
      throw new BadRequestException('Tipo e ambiente são obrigatórios');

    const users = this.load();
    const user  = users.find(u => u.username === username);
    if (!user) throw new NotFoundException('Usuário não encontrado');

    user.solicitacoes = user.solicitacoes ?? [];
    if (!user.solicitacoes.some(s => s.tipo === tipo && s.ambiente === ambiente)) {
      user.solicitacoes.push({ tipo, ambiente });
      this.save(users);
    }
    return user;
  }

  removeSolicitacao(username: string, { tipo, ambiente }: Solicitacao) {
    const users = this.load();
    const user  = users.find(u => u.username === username);
    if (!user) throw new NotFoundException();

    user.solicitacoes = (user.solicitacoes ?? [])
      .filter(s => !(s.tipo === tipo && s.ambiente === ambiente));

    this.save(users);
    return { ok: true };
  }

  zerarSolicitacoesByTeam(team: string) {
    const users = this.load();
    users
      .filter(u => u.time === team)
      .forEach(u => (u.solicitacoes = []));
    this.save(users);
  }

  /* ──────────────── relatório PDF ──────────────── */
  buildPdfReport(
    solicitacoes: {
      username: string; nome: string; tipo: string; ambiente: string;
    }[],
    team: string,
  ): Buffer {

    const doc    = new PDFDocument({ margin: 40, size: 'A4' });
    const chunks: Buffer[] = [];
    doc.on('data', c => chunks.push(c));

    /* — cabeçalho — */
    const azul = '#00a1f6';
    const logo = path.join(process.cwd(), 'public', 'logo-nelogica.png');
    if (fs.existsSync(logo))
      doc.image(logo, doc.page.width / 2 - 40, 20, { width: 80 });

    doc.moveDown(2.5)
       .fontSize(18).fillColor(azul).font('Helvetica-Bold')
       .text(`Solicitações pendentes – equipe ${team}`, { align: 'center' })
       .moveDown(1);

    /* — tabela — */
    const col = [70, 80, 120, doc.page.width - 40*2 - 70 - 80 - 120];
    const startY = doc.y;

    const drawHeader = (y: number) => {
      doc.rect(40, y, col.reduce((a,b)=>a+b,0), 22).fillAndStroke(azul, azul);
      doc.fillColor('#fff').fontSize(11).font('Helvetica-Bold')
         .text('Tipo',      44, y+6, { width: col[0] })
         .text('Ambiente',  44+col[0], y+6, { width: col[1] })
         .text('Usuário',   44+col[0]+col[1], y+6, { width: col[2] })
         .text('Nome',      44+col[0]+col[1]+col[2], y+6, { width: col[3] });
    };
    drawHeader(startY);

    let y = startY + 22;
    solicitacoes.forEach((r,i) => {
      if (y + 20 > doc.page.height - 50) {
        footer(); doc.addPage(); y = 40; drawHeader(y); y += 22;
      }
      doc.rect(40, y, col.reduce((a,b)=>a+b,0), 20)
         .fill(i%2 ? '#F6F8FA' : '#E9EDF2');
      doc.fillColor('#000').font('Helvetica').fontSize(10)
         .text(r.tipo,      44, y+6, { width: col[0] })
         .text(r.ambiente,  44+col[0], y+6, { width: col[1] })
         .text(r.username,  44+col[0]+col[1], y+6, { width: col[2] })
         .text(r.nome,      44+col[0]+col[1]+col[2], y+6, { width: col[3] });
      y += 20;
    });

    const footer = () => {
      const page = doc.page;
      doc.fontSize(8).fillColor('#666')
         .text(
           `Gerado em ${new Date().toLocaleString('pt-BR')} – página ${page.number}`,
           40,
           page.height - 30,
           { width: page.width - 80, align: 'center' },
         );
    };
    footer();
    doc.end();
    return Buffer.concat(chunks);
  }
}
