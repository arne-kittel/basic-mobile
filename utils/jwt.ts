import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
    exp: number;
    [key: string]: any; 
}

export function isTokenValid(token: string): boolean {
    try {
        const decoded = jwtDecode<JwtPayload>(token);
        const now = Date.now() / 1000;
        return decoded.exp > now;
    } catch (error) {
        return false;
    }
}