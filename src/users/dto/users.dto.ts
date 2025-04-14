export class CreateUserDto {
    name: string;
    email: string;
    password: string;
    role?: 'ADMIN' | 'EDITOR' | 'VIEWER';
}

export class LoginUserDto {
    email: string;
    password: string;
}
