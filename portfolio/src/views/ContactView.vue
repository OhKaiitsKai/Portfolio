<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

interface ContactForm {
  name: string
  email: string
  subject: string
  message: string
}

const form = reactive<ContactForm>({
  name: '',
  email: '',
  subject: '',
  message: '',
})

const isSubmitted = ref(false)
const errorMessage = ref('')

const emailIsValid = computed(() => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
})

function resetForm(): void {
  form.name = ''
  form.email = ''
  form.subject = ''
  form.message = ''
}

function submitForm(): void {
  errorMessage.value = ''
  isSubmitted.value = false

  if (
    !form.name.trim() ||
    !form.email.trim() ||
    !form.subject.trim() ||
    !form.message.trim()
  ) {
    errorMessage.value = 'Please complete every field.'
    return
  }

  if (!emailIsValid.value) {
    errorMessage.value = 'Please enter a valid email address.'
    return
  }

  isSubmitted.value = true
  resetForm()
}
</script>

<template>
  <main class="min-h-screen px-6 pb-24 pt-32 text-starlight">
    <section
      class="mx-auto grid max-w-7xl gap-16
             lg:grid-cols-[0.85fr_1.15fr]"
    >
      <!-- Introduction -->
      <div>
        <p
          class="text-sm uppercase tracking-[0.35em]
                 text-nebula-light"
        >
          Contact me
        </p>

        <h1
          class="mt-5 text-5xl font-bold leading-tight
                 md:text-7xl"
        >
          Send a signal into my universe.
        </h1>

        <p
          class="mt-7 max-w-xl text-lg leading-8
                 text-nebula-light"
        >
          Whether you want to collaborate, talk about a project,
          share an idea or simply say hello, you can leave me a
          message here.
        </p>

        <div class="mt-12 space-y-6">
          <article
            class="rounded-3xl border border-nebula/20
                   bg-cosmic/25 p-6"
          >
            <p
              class="text-xs uppercase tracking-[0.25em]
                     text-nebula-light"
            >
              Collaborations
            </p>

            <h2 class="mt-3 text-xl font-semibold">
              Creative and digital projects
            </h2>

            <p class="mt-3 leading-7 text-nebula-light">
              I am interested in websites, interactive experiences,
              artistic projects and ideas that combine technology
              with imagination.
            </p>
          </article>

          <article
            class="rounded-3xl border border-nebula/20
                   bg-cosmic/25 p-6"
          >
            <p
              class="text-xs uppercase tracking-[0.25em]
                     text-nebula-light"
            >
              Languages
            </p>

            <h2 class="mt-3 text-xl font-semibold">
              English or Spanish
            </h2>

            <p class="mt-3 leading-7 text-nebula-light">
              You can contact me in either English or Spanish.
            </p>
          </article>

          <article
            class="rounded-3xl border border-nebula/20
                   bg-cosmic/25 p-6"
          >
            <p
              class="text-xs uppercase tracking-[0.25em]
                     text-nebula-light"
            >
              Response time
            </p>

            <h2 class="mt-3 text-xl font-semibold">
              Usually within a few days
            </h2>

            <p class="mt-3 leading-7 text-nebula-light">
              I read every message, although response time may vary.
            </p>
          </article>
        </div>
      </div>

      <!-- Contact form -->
      <div
        class="relative overflow-hidden rounded-[2.5rem]
               border border-nebula/30 bg-cosmic/30
               p-6 backdrop-blur-md md:p-10"
      >
        <div
          class="absolute -right-20 -top-20 h-64 w-64
                 rounded-full bg-nebula/15 blur-3xl"
        ></div>

        <form
          class="relative space-y-6"
          novalidate
          @submit.prevent="submitForm"
        >
          <div>
            <label
              for="name"
              class="mb-2 block text-sm text-nebula-light"
            >
              Name
            </label>

            <input
              id="name"
              v-model="form.name"
              type="text"
              maxlength="60"
              autocomplete="name"
              placeholder="Your name"
              class="w-full rounded-2xl border border-nebula/30
                     bg-deep-space/60 px-4 py-3 text-starlight
                     outline-none transition
                     placeholder:text-nebula-light/40
                     focus:border-nebula-light"
            />
          </div>

          <div>
            <label
              for="email"
              class="mb-2 block text-sm text-nebula-light"
            >
              Email
            </label>

            <input
              id="email"
              v-model="form.email"
              type="email"
              maxlength="120"
              autocomplete="email"
              placeholder="you@example.com"
              class="w-full rounded-2xl border border-nebula/30
                     bg-deep-space/60 px-4 py-3 text-starlight
                     outline-none transition
                     placeholder:text-nebula-light/40
                     focus:border-nebula-light"
            />
          </div>

          <div>
            <label
              for="subject"
              class="mb-2 block text-sm text-nebula-light"
            >
              Subject
            </label>

            <input
              id="subject"
              v-model="form.subject"
              type="text"
              maxlength="100"
              placeholder="What would you like to talk about?"
              class="w-full rounded-2xl border border-nebula/30
                     bg-deep-space/60 px-4 py-3 text-starlight
                     outline-none transition
                     placeholder:text-nebula-light/40
                     focus:border-nebula-light"
            />
          </div>

          <div>
            <div class="mb-2 flex items-center justify-between gap-4">
              <label
                for="message"
                class="block text-sm text-nebula-light"
              >
                Message
              </label>

              <span class="text-xs text-nebula-light/70">
                {{ form.message.length }}/1000
              </span>
            </div>

            <textarea
              id="message"
              v-model="form.message"
              maxlength="1000"
              rows="8"
              placeholder="Write your message here..."
              class="w-full resize-none rounded-2xl border
                     border-nebula/30 bg-deep-space/60
                     px-4 py-3 text-starlight outline-none
                     transition placeholder:text-nebula-light/40
                     focus:border-nebula-light"
            ></textarea>
          </div>

          <p
            v-if="errorMessage"
            class="rounded-2xl border border-red-300/30
                   bg-red-300/10 px-4 py-3 text-sm text-red-200"
            role="alert"
          >
            {{ errorMessage }}
          </p>

          <p
            v-if="isSubmitted"
            class="rounded-2xl border border-nebula-light/30
                   bg-nebula-light/10 px-4 py-3
                   text-sm text-starlight"
            role="status"
          >
            Your message has been prepared successfully.
            Real delivery will be connected later.
          </p>

          <button
            type="submit"
            class="w-full rounded-full bg-starlight px-7 py-4
                   font-semibold text-deep-space transition
                   hover:bg-nebula-light
                   focus-visible:outline-2
                   focus-visible:outline-offset-4
                   focus-visible:outline-starlight"
          >
            Send message
          </button>
        </form>
      </div>
    </section>

    <!-- Closing message -->
    <section class="mx-auto mt-32 max-w-7xl">
      <div
        class="relative overflow-hidden rounded-[3rem]
               border border-nebula/20 bg-cosmic/20
               px-8 py-16 text-center"
      >
        <div
          class="absolute left-1/2 top-0 h-56 w-56
                 -translate-x-1/2 rounded-full
                 bg-nebula/20 blur-3xl"
        ></div>

        <div class="relative mx-auto max-w-3xl">
          <p
            class="text-sm uppercase tracking-[0.35em]
                   text-nebula-light"
          >
            A new connection
          </p>

          <h2 class="mt-5 text-4xl font-bold md:text-5xl">
            Every idea begins with a small signal.
          </h2>

          <p class="mt-6 text-lg leading-8 text-nebula-light">
            Tell me what you are imagining, and perhaps we can
            create something meaningful together.
          </p>
        </div>
      </div>
    </section>
  </main>
</template>