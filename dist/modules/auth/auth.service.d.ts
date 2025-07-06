import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
export declare class AuthService implements OnModuleInit, OnModuleDestroy {
    private readonly log;
    private readonly admins;
    onModuleInit(): void;
    onModuleDestroy(): void;
    validateUser(username: string, plain: string): Promise<boolean>;
    createOrUpdate(username: string, plain: string, time?: string): Promise<string>;
    getTime(username: string): string | undefined;
    listAdmins(): string[];
    private persist;
}
