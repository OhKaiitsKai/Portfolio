<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  FirebaseError,
} from 'firebase/app'
import {
  signInWithEmailAndPassword,
} from 'firebase/auth'
import {
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
} from 'lucide-vue-next'

import { auth } from '../firebase/config'

const router = useRouter()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')

const formIsValid = computed(() => {
  return email.value.trim() !== '' && password.value !== ''
})

function getAuthErrorMessage(error: unknown): string {
  if (!(error instanceof FirebaseError)) {
    return 'An unexpected error occurred. Please try again.'
  }

  switch (error.code) {
    case 'auth/invalid-email':
      return 'Please enter a valid email address.'

    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'The email or password is incorrect.'

    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait before trying again.'

    case 'auth/network-request-failed':
      return 'The network connection failed. Please try again.'

    default:
      return 'Unable to sign in. Please try again.'
  }
}

async function login(): Promise<void> {
  errorMessage.value = ''

  const trimmedEmail = email.value.trim()

  if (!trimmedEmail || !password.value) {
    errorMessage.value = 'Please enter your email and password.'
    return
  }

  isLoading.value = true

  try {
    await signInWithEmailAndPassword(
      auth,
      trimmedEmail,
      password.value,
    )

    await router.replace({
      name: 'admin-dashboard',
    })
  } catch (error: unknown) {
    errorMessage.value = getAuthErrorMessage(error)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <main
    class="relative flex min-h-screen items-center justify-center
           overflow-hidden px-6 py-24 text-starlight"
  >
    <!-- Decorative background -->
    <div
      class="pointer-events-none absolute -left-40 -top-40
             h-96 w-96 rounded-full bg-nebula/20 blur-3xl"
    ></div>

    <div
      class="pointer-events-none absolute -bottom-40 -right-40
             h-96 w-96 rounded-full
             bg-nebula-light/10 blur-3xl"
    ></div>

    <section class="relative w-full max-w-md">
      <div class="mb-8 text-center">
        <RouterLink
          :to="{ name: 'home' }"
          class="inline-flex items-center gap-2
                 text-sm text-nebula-light transition
                 hover:text-starlight"
        >
          <span aria-hidden="true">←</span>
          Return to portfolio
        </RouterLink>
      </div>

      <div
        class="relative overflow-hidden rounded-[2.5rem]
               border border-nebula/30 bg-cosmic/30
               p-7 shadow-2xl backdrop-blur-xl sm:p-10"
      >
        <div
          class="pointer-events-none absolute -right-20 -top-20
                 h-56 w-56 rounded-full
                 bg-nebula/15 blur-3xl"
        ></div>

        <div class="relative">
          <div
            class="flex h-16 w-16 items-center justify-center
                   rounded-2xl border border-nebula/30
                   bg-deep-space/60 text-nebula-light"
          >
            <LockKeyhole
              :size="30"
              :stroke-width="1.7"
              aria-hidden="true"
            />
          </div>

          <p
            class="mt-8 text-xs uppercase tracking-[0.35em]
                   text-nebula-light"
          >
            Administration portal
          </p>

          <h1 class="mt-4 text-4xl font-bold">
            Welcome back, Kai.
          </h1>

          <p class="mt-4 leading-7 text-nebula-light">
            Only authorized explorers may enter this constellation.
          </p>

          <form
            class="mt-9 space-y-6"
            novalidate
            @submit.prevent="login"
          >
            <div>
              <label
                for="admin-email"
                class="mb-2 block text-sm text-nebula-light"
              >
                Email
              </label>

              <div class="relative">
                <Mail
                  :size="19"
                  class="pointer-events-none absolute left-4
                         top-1/2 -translate-y-1/2
                         text-nebula-light"
                  aria-hidden="true"
                />

                <input
                  id="admin-email"
                  v-model="email"
                  type="email"
                  autocomplete="email"
                  placeholder="you@example.com"
                  class="w-full rounded-2xl border
                         border-nebula/30 bg-deep-space/60
                         py-3 pl-12 pr-4 text-starlight
                         outline-none transition
                         placeholder:text-nebula-light/40
                         focus:border-nebula-light"
                  :disabled="isLoading"
                />
              </div>
            </div>

            <div>
              <label
                for="admin-password"
                class="mb-2 block text-sm text-nebula-light"
              >
                Password
              </label>

              <div class="relative">
                <LockKeyhole
                  :size="19"
                  class="pointer-events-none absolute left-4
                         top-1/2 -translate-y-1/2
                         text-nebula-light"
                  aria-hidden="true"
                />

                <input
                  id="admin-password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="current-password"
                  placeholder="Enter your password"
                  class="w-full rounded-2xl border
                         border-nebula/30 bg-deep-space/60
                         py-3 pl-12 pr-12 text-starlight
                         outline-none transition
                         placeholder:text-nebula-light/40
                         focus:border-nebula-light"
                  :disabled="isLoading"
                />

                <button
                  type="button"
                  class="absolute right-4 top-1/2
                         -translate-y-1/2 text-nebula-light
                         transition hover:text-starlight"
                  :aria-label="
                    showPassword
                      ? 'Hide password'
                      : 'Show password'
                  "
                  @click="showPassword = !showPassword"
                >
                  <EyeOff
                    v-if="showPassword"
                    :size="20"
                    aria-hidden="true"
                  />

                  <Eye
                    v-else
                    :size="20"
                    aria-hidden="true"
                  />
                </button>
              </div>
            </div>

            <p
              v-if="errorMessage"
              class="rounded-2xl border border-red-300/30
                     bg-red-300/10 px-4 py-3
                     text-sm text-red-200"
              role="alert"
            >
              {{ errorMessage }}
            </p>

            <button
              type="submit"
              class="flex w-full items-center justify-center
                     gap-3 rounded-full bg-starlight
                     px-7 py-4 font-semibold text-deep-space
                     transition hover:bg-nebula-light
                     disabled:cursor-not-allowed
                     disabled:opacity-50"
              :disabled="!formIsValid || isLoading"
            >
              <LoaderCircle
                v-if="isLoading"
                :size="20"
                class="animate-spin"
                aria-hidden="true"
              />

              {{ isLoading ? 'Entering...' : 'Enter dashboard' }}
            </button>
          </form>
        </div>
      </div>

      <p class="mt-7 text-center text-sm text-nebula-light/70">
        My soul creates galaxies~
      </p>
    </section>
  </main>
</template>