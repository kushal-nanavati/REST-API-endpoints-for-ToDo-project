export interface RegisteredUsers {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    password: string;
    contactNumber: string;
}

export interface LoggedInUsers {
    id: number;
    username: string;
    password: string;
    userId: number;
}