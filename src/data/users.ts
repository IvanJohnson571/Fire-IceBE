interface User {
    id: number;
    username: string;
    passwordHash: string;
}

export const users: User[] = [];
