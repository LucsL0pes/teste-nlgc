import {
  Controller, Get, Post, Req, Res, Body, UnauthorizedException
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Get('login')
  getLogin(@Res() res:Response) { res.render('login'); }

  @Post('login')
  async postLogin(
    @Body() body:{username:string,password:string},
    @Res() res:Response
  ){
    const time = await this.auth.validateUser(body.username, body.password);
    if (!time) throw new UnauthorizedException('Usuário ou senha inválidos');

    res.cookie('user', body.username, {httpOnly:true});
    res.redirect('/usuarios');
  }

  @Get('logout')
  logout(@Res() res:Response){
    res.clearCookie('user');
    res.redirect('/login');
  }
}
