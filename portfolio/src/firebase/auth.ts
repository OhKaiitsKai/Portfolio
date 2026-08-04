import {
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'

import { auth } from './config'

export function login(email: string, password: string) {
  return signInWithEmailAndPassword(
    auth,
    email,
    password,
  )
}

export function logout() {
  return signOut(auth)
}