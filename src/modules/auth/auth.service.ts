// src/modules/auth/auth.service.ts
import {
  Injectable, Logger,
  OnModuleInit, OnModuleDestroy,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const STORAGE_DIR = join(process.cwd(), 'storage');
const ADM_FILE    = join(STORAGE_DIR, 'admin-users.json');
const SALT_ROUNDS = 10;

interface AdminFileEntry { username: string; hash: string; time?: string; }

@Injectable()
export class AuthService implements OnModuleInit, OnModuleDestroy {
  private readonly log = new Logger(AuthService.name);

  /**
   * username → { hash, time }
   */
  private readonly admins = new Map<string, { hash: string; time?: string }>();

  /* ----------------------------------------------------------------------- */
  /*  CICLO DE VIDA                                                          */
  /* ----------------------------------------------------------------------- */
  onModuleInit() {
    if (!existsSync(STORAGE_DIR)) mkdirSync(STORAGE_DIR, { recursive: true });

    if (existsSync(ADM_FILE)) {
      try {
        const rawTxt = readFileSync(ADM_FILE, 'utf-8');
        const raw    = JSON.parse(rawTxt) as
          | Record<string, string>          // formato antigo
          | AdminFileEntry[];               // formato novo

        if (Array.isArray(raw)) {
          raw.forEach(r =>
            this.admins.set(r.username, { hash: r.hash, time: r.time }),
          );
        } else {
          Object.entries(raw).forEach(([u, h]) =>
            this.admins.set(u, { hash: h }),
          );
        }
        this.log.log(`Admin-users carregados: ${this.admins.size}`);
      } catch (e) {
        this.log.error('Falha ao ler admin-users.json', e as any);
      }
    }

    // fallback (ambiente novo)
    if (this.admins.size === 0) {
      void this.createOrUpdate('admin_si', '123456', 'SI');
      this.log.warn(
        'Nenhum admin encontrado. Usuário padrão "admin_si / 123456" criado.',
      );
    }
  }

  onModuleDestroy() {
    this.persist();
  }

  /* ----------------------------------------------------------------------- */
  /*  API PÚBLICA                                                            */
  /* ----------------------------------------------------------------------- */
  async validateUser(username: string, plain: string): Promise<boolean> {
    const entry = this.admins.get(username);
    const ok    = entry ? await bcrypt.compare(plain, entry.hash) : false;
    this.log.debug(`validateUser(${username}) → ${ok}`);
    return ok;
  }

  async createOrUpdate(
    username: string,
    plain: string,
    time?: string,
  ): Promise<string> {
    const hash = await bcrypt.hash(plain, SALT_ROUNDS);
    this.admins.set(username, { hash, time });
    this.persist();
    this.log.log(`Admin "${username}" criado/atualizado`);
    return hash;
  }

  getTime(username: string): string | undefined {
    return this.admins.get(username)?.time;
  }

  listAdmins(): string[] {
    return Array.from(this.admins.keys());
  }

  /* ----------------------------------------------------------------------- */
  /*  PERSISTÊNCIA                                                           */
  /* ----------------------------------------------------------------------- */
  private persist(): void {
    const out: AdminFileEntry[] = Array.from(this.admins.entries()).map(
      ([u, { hash, time }]) => ({ username: u, hash, time }),
    );

    try {
      writeFileSync(ADM_FILE, JSON.stringify(out, null, 2), 'utf-8');
      this.log.log('admin-users.json salvo.');
    } catch (e) {
      this.log.error('Falha ao salvar admin-users.json', e as any);
    }
  }
}
