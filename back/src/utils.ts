import bcrypt from "bcrypt";

export async function hashSecretData(secretData: string) {
    return await bcrypt.hash(secretData, 12)
}
export async function compareSecretData(secretData: string, hashedSecretData: string){
    return await bcrypt.compare(secretData, hashedSecretData)
}
