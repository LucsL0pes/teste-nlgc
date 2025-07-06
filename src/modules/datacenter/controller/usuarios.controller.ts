import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Render,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { UsuariosService, Solicitacao } from '../service/usuarios.service';
import { AuthService } from '../../auth/auth.service';

@Controller('usuarios')
export class UsuariosController {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly authService: AuthService,
  ) {}

  /* ──────────────── view ──────────────── */
  @Get()
  @Render('usuarios')
  getAllView(@Req() req: Request) {
    const username = (req.cookies as any)?.user;
    if (!username) return { redirect: '/login' };

    const team      = this.authService.getTime(username);
    const usuarios  = this.usuariosService.getAllEnrichedByTeam(team!);

    return { usuarios, ambientesValidos: ['AWS','AZR','B3','GCP','EQX','LWB','STECH','CMD'] };
  }

  /* ──────────────── API CRUD solicitações ──────────────── */
  @Post(':username/solicitacao')
  add(@Param('username') u: string, @Body() b: Solicitacao) {
    return this.usuariosService.addSolicitacao(u, b);
  }

  @Delete(':username/solicitacao')
  remove(@Param('username') u: string, @Body() b: Solicitacao) {
    return this.usuariosService.removeSolicitacao(u, b);
  }

  /* ──────────────── PDF + clean ──────────────── */
  @Post('solicitacoes/pdf')
  async downloadAndClear(
    @Req()  req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const username = req.cookies?.user;
    if (!username) return res.redirect('/login');

    const team  = this.authService.getTime(username)!;
    const usuarios = this.usuariosService.getAllEnrichedByTeam(team);

    const pendentes = usuarios.flatMap(u =>
      (u.solicitacoes ?? []).map(s => ({
        username : u.username,
        nome     : u.nome,
        ambiente : s.ambiente,
        tipo     : s.tipo,
      })),
    );

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
}
