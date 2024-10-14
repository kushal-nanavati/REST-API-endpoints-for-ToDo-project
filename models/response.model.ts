export interface AuthResponseData {
    username: string;
    userId: number;
    token: Error | string;
    expiresIn: number;
}