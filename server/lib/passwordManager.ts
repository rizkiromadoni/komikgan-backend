const passwordManager = {
    hash: async (password: string) => {
        return await Bun.password.hash(password, "bcrypt")
    },
    verify: async (password: string, hash: string) => {
        return await Bun.password.verify(password, hash, "bcrypt")
    }
}

export default passwordManager