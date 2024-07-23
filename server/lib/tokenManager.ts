import { decode, sign, verify } from "hono/jwt"

const tokenManager = {
    generateAccessToken: async (payload: any) => {
        return await sign({
            ...payload,
            exp: Math.floor(Date.now() / 1000) + 60 * 15
        }, process.env.ACCESS_TOKEN_SECRET!)
    },
    generateRefreshToken: async (payload: any) => {
        return await sign({
            ...payload,
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 3
        }, process.env.REFRESH_TOKEN_SECRET!)
    },
    verifyAccessToken: async (token: string) => {
        try {
            return await verify(token, process.env.ACCESS_TOKEN_SECRET!)
        } catch (error) {
            return null
        }
    },
    verifyRefreshToken: async (token: string) => {
        try {
            return await verify(token, process.env.REFRESH_TOKEN_SECRET!)
        } catch (error) {
            return null
        }
    },
    decode: (token: string) => {
        return decode(token)
    }
}

export default tokenManager