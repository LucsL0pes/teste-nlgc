"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = require("bcryptjs");
const fs_1 = require("fs");
const path_1 = require("path");
const STORAGE_DIR = (0, path_1.join)(process.cwd(), 'storage');
const ADM_FILE = (0, path_1.join)(STORAGE_DIR, 'admin-users.json');
const SALT_ROUNDS = 10;
function timeFromUsername(username) {
    const m = username.match(/^admin_(.+)$/i);
    return m ? m[1].toUpperCase() : undefined;
}
let AuthService = AuthService_1 = class AuthService {
    log = new common_1.Logger(AuthService_1.name);
    admins = new Map();
    onModuleInit() {
        if (!(0, fs_1.existsSync)(STORAGE_DIR))
            (0, fs_1.mkdirSync)(STORAGE_DIR, { recursive: true });
        if ((0, fs_1.existsSync)(ADM_FILE)) {
            try {
                const rawTxt = (0, fs_1.readFileSync)(ADM_FILE, 'utf-8');
                const raw = JSON.parse(rawTxt);
                if (Array.isArray(raw)) {
                    raw.forEach(r => this.admins.set(r.username, { hash: r.hash, time: r.time }));
                }
                else {
                    Object.entries(raw).forEach(([u, h]) => this.admins.set(u, { hash: h }));
                }
                this.log.log(`Admin-users carregados: ${this.admins.size}`);
                let changed = false;
                this.admins.forEach((v, u) => {
                    if (!v.time) {
                        const t = timeFromUsername(u);
                        if (t) {
                            v.time = t;
                            changed = true;
                        }
                    }
                });
                if (changed)
                    this.persist();
            }
            catch (e) {
                this.log.error('Falha ao ler admin-users.json', e);
            }
        }
        if (this.admins.size === 0) {
            void this.createOrUpdate('admin_si', '123456', 'SI');
            this.log.warn('Nenhum admin encontrado. Usuário padrão "admin_si / 123456" criado.');
        }
    }
    onModuleDestroy() {
        this.persist();
    }
    async validateUser(username, plain) {
        const entry = this.admins.get(username);
        const ok = entry ? await bcrypt.compare(plain, entry.hash) : false;
        this.log.debug(`validateUser(${username}) → ${ok}`);
        return ok;
    }
    async createOrUpdate(username, plain, time) {
        const hash = await bcrypt.hash(plain, SALT_ROUNDS);
        this.admins.set(username, { hash, time });
        this.persist();
        this.log.log(`Admin "${username}" criado/atualizado`);
        return hash;
    }
    getTime(username) {
        return this.admins.get(username)?.time;
    }
    listAdmins() {
        return Array.from(this.admins.keys());
    }
    persist() {
        const out = Array.from(this.admins.entries()).map(([u, { hash, time }]) => ({ username: u, hash, time }));
        try {
            (0, fs_1.writeFileSync)(ADM_FILE, JSON.stringify(out, null, 2), 'utf-8');
            this.log.log('admin-users.json salvo.');
        }
        catch (e) {
            this.log.error('Falha ao salvar admin-users.json', e);
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)()
], AuthService);
//# sourceMappingURL=auth.service.js.map