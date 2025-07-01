import * as SecureStore from 'expo-secure-store';

export async function saveToken(token: string) {
    await SecureStore.setItemAsync('jwt', token);
}

export async function getToken(): Promise<string | null> {
    const token = await SecureStore.getItemAsync('jwt')
    console.log('jwt: ', token)
    return token;
}

export async function deleteToken() {
    await SecureStore.deleteItemAsync('jwt');
}