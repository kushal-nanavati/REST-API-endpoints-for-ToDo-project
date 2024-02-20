export interface RegisteredUsers {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    password: string;
    mobileNumber: number;
}

export interface LoggedInUsers {
    id: number;
    username: string;
    password: string;
    userId: number;
}