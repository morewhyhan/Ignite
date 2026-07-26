import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  fetchOptions: {
    credentials: 'include',
  },
})

export const { signIn, signUp, signOut, useSession } = authClient
