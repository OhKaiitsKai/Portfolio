import { ref } from 'vue'
import { onAuthStateChanged } from 'firebase/auth'

import { auth } from '../firebase/config'

const user = ref(auth.currentUser)
const loading = ref(true)

onAuthStateChanged(auth, (firebaseUser) => {
  user.value = firebaseUser
  loading.value = false
})

export function useAuth() {
  return {
    user,
    loading,
  }
}