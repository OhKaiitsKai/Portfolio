<script setup lang="ts">
import type { Component } from 'vue'
import { useRouter } from 'vue-router'
import {
  BookOpen,
  Brush,
  LogOut,
  Mail,
  Plus,
  Settings,
  Sparkles,
} from 'lucide-vue-next'

import { logout } from '../firebase/auth'

interface DashboardItem {
  title: string
  description: string
  routeName: string
  icon: Component
  action: string
}

const router = useRouter()

const dashboardItems: DashboardItem[] = [
  {
    title: 'Blog',
    description:
      'Create, edit & publish articles from your personal journal.',
    routeName: 'admin-blog',
    icon: BookOpen,
    action: 'Manage posts',
  },
  {
    title: 'Board',
    description:
      'Review doodles submitted by visitors & approve or reject them.',
    routeName: 'admin-board',
    icon: Brush,
    action: 'Moderate doodles',
  },
  {
    title: 'Messages',
    description:
      'Read messages submitted through the contact form.',
    routeName: 'admin-messages',
    icon: Mail,
    action: 'View inbox',
  },
  {
    title: 'Settings',
    description:
      'Manage portfolio information & administrative preferences.',
    routeName: 'admin-settings',
    icon: Settings,
    action: 'Open settings',
  },
]

async function handleLogout(): Promise<void> {
  try {
    await logout()

    await router.replace({
      name: 'admin-login',
    })
  } catch (error) {
    console.error('Unable to log out:', error)
  }
}
</script>

<template>
  <main class="min-h-screen overflow-hidden pb-24 pt-28 text-starlight">
    <!-- Background decoration -->
    <div
      class="pointer-events-none fixed -left-40 -top-40
             h-96 w-96 rounded-full bg-nebula/15 blur-3xl"
    ></div>

    <div
      class="pointer-events-none fixed -bottom-40 -right-40
             h-96 w-96 rounded-full
             bg-nebula-light/10 blur-3xl"
    ></div>

    <!-- Header -->
    <section class="relative mx-auto max-w-7xl px-6">
      <div
        class="flex flex-col gap-8 border-b border-nebula/20
               pb-10 md:flex-row md:items-end
               md:justify-between"
      >
        <div class="max-w-3xl">
          <p
            class="text-sm uppercase tracking-[0.35em]
                   text-nebula-light"
          >
            Administration portal
          </p>

          <h1
            class="mt-4 text-5xl font-bold leading-tight
                   md:text-7xl"
          >
            Welcome back, Kai.
          </h1>

          <p class="mt-5 text-lg leading-8 text-nebula-light">
            Manage the different constellations of your portfolio
            from one place.
          </p>
        </div>

        <button
          type="button"
          class="inline-flex items-center justify-center gap-3
                 rounded-full border border-nebula/40
                 px-6 py-3 font-semibold text-starlight
                 transition hover:border-starlight
                 hover:bg-starlight/10"
          @click="handleLogout"
        >
          <LogOut
            :size="20"
            aria-hidden="true"
          />

          Log out
        </button>
      </div>
    </section>

    <!-- Quick action -->
    <section class="relative mx-auto mt-10 max-w-7xl px-6">
      <RouterLink
        :to="{ name: 'admin-blog-new' }"
        class="group flex flex-col gap-6 overflow-hidden
               rounded-[2.5rem] border border-nebula/30
               bg-cosmic/30 p-8 transition duration-300
               hover:-translate-y-1 hover:border-nebula/70
               hover:bg-cosmic/45 md:flex-row
               md:items-center md:justify-between"
      >
        <div class="flex items-start gap-5">
          <div
            class="flex h-16 w-16 shrink-0 items-center
                   justify-center rounded-2xl border
                   border-nebula/30 bg-deep-space/60
                   text-nebula-light transition
                   group-hover:text-starlight"
          >
            <Plus
              :size="30"
              aria-hidden="true"
            />
          </div>

          <div>
            <p
              class="text-xs uppercase tracking-[0.3em]
                     text-nebula-light"
            >
              Quick action
            </p>

            <h2 class="mt-2 text-2xl font-semibold">
              Create a new article
            </h2>

            <p class="mt-2 max-w-2xl leading-7 text-nebula-light">
              Write a new entry, upload a cover image & publish it
              directly to your blog.
            </p>
          </div>
        </div>

        <span
          class="inline-flex items-center gap-2 font-semibold
                 text-starlight"
        >
          Start writing
          <span
            class="transition group-hover:translate-x-1"
            aria-hidden="true"
          >
            →
          </span>
        </span>
      </RouterLink>
    </section>

    <!-- Dashboard cards -->
    <section class="relative mx-auto mt-10 max-w-7xl px-6">
      <div class="grid gap-6 md:grid-cols-2">
        <RouterLink
          v-for="item in dashboardItems"
          :key="item.title"
          :to="{ name: item.routeName }"
          class="group relative min-h-80 overflow-hidden
                 rounded-[2rem] border border-nebula/20
                 bg-cosmic/25 p-7 transition duration-300
                 hover:-translate-y-2 hover:border-nebula/70
                 hover:bg-cosmic/40"
        >
          <div
            class="pointer-events-none absolute -right-20 -top-20
                   h-56 w-56 rounded-full bg-nebula/5
                   blur-3xl transition duration-500
                   group-hover:bg-nebula/20"
          ></div>

          <span
            class="absolute right-7 top-7 text-xl
                   text-nebula-light/40 transition
                   group-hover:rotate-45
                   group-hover:text-starlight"
            aria-hidden="true"
          >
            ✦
          </span>

          <div
            class="relative flex h-16 w-16 items-center
                   justify-center rounded-2xl border
                   border-nebula/25 bg-deep-space/50
                   text-nebula-light transition duration-300
                   group-hover:scale-110
                   group-hover:text-starlight"
          >
            <component
              :is="item.icon"
              :size="30"
              :stroke-width="1.7"
              aria-hidden="true"
            />
          </div>

          <div class="relative mt-8">
            <h2 class="text-3xl font-semibold">
              {{ item.title }}
            </h2>

            <p class="mt-4 max-w-lg leading-7 text-nebula-light">
              {{ item.description }}
            </p>
          </div>

          <div
            class="relative mt-10 flex items-center
                   justify-between border-t
                   border-nebula/20 pt-5"
          >
            <span class="font-semibold">
              {{ item.action }}
            </span>

            <span
              class="text-xl text-nebula-light transition
                     group-hover:translate-x-1
                     group-hover:text-starlight"
              aria-hidden="true"
            >
              →
            </span>
          </div>
        </RouterLink>
      </div>
    </section>

    <!-- Status -->
    <section class="relative mx-auto mt-10 max-w-7xl px-6">
      <div
        class="flex flex-col gap-5 rounded-[2rem]
               border border-nebula/20 bg-cosmic/20
               p-7 md:flex-row md:items-center
               md:justify-between"
      >
        <div class="flex items-start gap-4">
          <Sparkles
            :size="26"
            class="mt-1 shrink-0 text-nebula-light"
            aria-hidden="true"
          />

          <div>
            <h2 class="text-xl font-semibold">
              Your universe is connected.
            </h2>

            <p class="mt-2 leading-7 text-nebula-light">
              Firebase Authentication, Firestore & Storage are ready
              to support your portfolio.
            </p>
          </div>
        </div>

        <RouterLink
          :to="{ name: 'home' }"
          class="shrink-0 rounded-full border
                 border-nebula/40 px-5 py-2
                 text-sm font-semibold transition
                 hover:border-starlight
                 hover:bg-starlight/10"
        >
          View portfolio
        </RouterLink>
      </div>
    </section>
  </main>
</template>