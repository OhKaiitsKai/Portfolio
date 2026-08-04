<script setup lang="ts">
import type { Component } from 'vue'
import {
  ArrowUpRight,
  Coffee,
  Github,
  Instagram,
  Mail,
  MessageCircle,
  Music2,
} from 'lucide-vue-next'

interface SocialLink {
  category: string
  platform: string
  username: string
  description: string
  action: string
  url: string
  icon: Component
  external: boolean
  glowClass: string
}

const socials: SocialLink[] = [
  {
    category: 'Code',
    platform: 'GitHub',
    username: '@ohkaiitskai',
    description:
      'Projects, experiments and ideas built through code & imagination.',
    action: 'Visit GitHub',
    url: 'https://github.com/OhKaiitsKai',
    icon: Github,
    external: true,
    glowClass: 'group-hover:bg-blue-300/20',
  },
  {
    category: 'Gallery',
    platform: 'Instagram',
    username: '@KaiLuxAeterna',
    description:
      'Art, photography, creative moments & fragments of my everyday universe.',
    action: 'Explore Instagram',
    url: 'https://www.instagram.com/kailuxaeterna/',
    icon: Instagram,
    external: true,
    glowClass: 'group-hover:bg-pink-300/20',
  },
  {
    category: 'Music',
    platform: 'Apple Music',
    username: '@_ohkaiitskai',
    description:
      'The artists, albums & songs that accompany my creative process.',
    action: 'Listen on Apple Music',
    url: 'https://music.apple.com/profile/aymeealvarezv',
    icon: Music2,
    external: true,
    glowClass: 'group-hover:bg-red-300/20',
  },
  {
    category: 'Talk',
    platform: 'Discord',
    username: 'Connect with me',
    description:
      'A place for conversations about projects, games, art & shared ideas.',
    action: 'Open Discord',
    url: 'https://discord.gg/tPRpy6A6qf',
    icon: MessageCircle,
    external: true,
    glowClass: 'group-hover:bg-indigo-300/20',
  },
  {
    category: 'Contact',
    platform: 'Email',
    username: 'Send me a signal',
    description:
      'For collaborations, professional opportunities or simply saying hello.',
    action: 'Write an email',
    url: 'mailto:aymeealvarez@gmail.com',
    icon: Mail,
    external: false,
    glowClass: 'group-hover:bg-cyan-300/20',
  },
  {
    category: 'Support',
    platform: 'Buy Me a Coffee',
    username: 'Support my creations',
    description:
      'Help me continue building personal projects & exploring new ideas.',
    action: 'Support my work',
    url: 'https://www.buymeacoffee.com/kailuxaeterna',
    icon: Coffee,
    external: true,
    glowClass: 'group-hover:bg-amber-200/20',
  },
]
</script>

<template>
  <main class="min-h-screen overflow-hidden pb-24 pt-32 text-starlight">
    <!-- Hero -->
    <section class="relative mx-auto max-w-7xl px-6">
      <div
        class="pointer-events-none absolute -left-40 -top-44 h-96 w-96
               rounded-full bg-nebula/15 blur-3xl"
      ></div>

      <div
        class="pointer-events-none absolute right-0 top-16 h-80 w-80
               rounded-full bg-nebula-light/10 blur-3xl"
      ></div>

      <div class="relative max-w-4xl">
        <p
          class="text-sm uppercase tracking-[0.35em]
                 text-nebula-light"
        >
          Communication hub
        </p>

        <h1
          class="mt-5 text-5xl font-bold leading-tight
                 md:text-7xl"
        >
          Find me around the universe.
        </h1>

        <p
          class="mt-7 max-w-2xl text-lg leading-8
                 text-nebula-light md:text-xl"
        >
          Every platform represents a different part of my story.
          Choose a destination and explore my code, art, music &
          creative world.
        </p>
      </div>
    </section>

    <!-- Social cards -->
    <section class="relative mx-auto mt-16 max-w-7xl px-6">
      <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <a
          v-for="social in socials"
          :key="social.platform"
          :href="social.url"
          :target="social.external ? '_blank' : undefined"
          :rel="social.external ? 'noopener noreferrer' : undefined"
          class="group relative flex min-h-96 flex-col
                 overflow-hidden rounded-[2rem]
                 border border-nebula/20 bg-cosmic/25
                 p-7 backdrop-blur-md
                 transition duration-500
                 hover:-translate-y-2
                 hover:border-nebula/70
                 hover:bg-cosmic/40
                 focus-visible:outline-2
                 focus-visible:outline-offset-4
                 focus-visible:outline-starlight"
        >
          <!-- Hover glow -->
          <div
            class="pointer-events-none absolute -right-20 -top-20
                   h-56 w-56 rounded-full bg-nebula/5
                   blur-3xl transition duration-500"
            :class="social.glowClass"
          ></div>

          <!-- Decorative star -->
          <span
            class="absolute right-7 top-7 text-xl
                   text-nebula-light/40 transition duration-500
                   group-hover:rotate-45
                   group-hover:text-starlight"
            aria-hidden="true"
          >
            ✦
          </span>

          <div
            class="relative flex h-20 w-20 items-center justify-center
                   rounded-3xl border border-nebula/25
                   bg-deep-space/50 text-nebula-light
                   shadow-lg transition duration-500
                   group-hover:scale-110
                   group-hover:border-nebula/70
                   group-hover:text-starlight"
          >
            <component
              :is="social.icon"
              :size="42"
              :stroke-width="1.6"
              aria-hidden="true"
            />
          </div>

          <div class="relative mt-8">
            <p
              class="text-xs uppercase tracking-[0.3em]
                     text-nebula-light"
            >
              {{ social.category }}
            </p>

            <h2 class="mt-3 text-3xl font-semibold text-starlight">
              {{ social.platform }}
            </h2>

            <p class="mt-2 text-sm text-nebula-light">
              {{ social.username }}
            </p>
          </div>

          <p
            class="relative mt-6 flex-1 text-base leading-7
                   text-nebula-light"
          >
            {{ social.description }}
          </p>

          <div
            class="relative mt-8 flex items-center justify-between
                   border-t border-nebula/20 pt-5"
          >
            <span class="font-semibold text-starlight">
              {{ social.action }}
            </span>

            <ArrowUpRight
              :size="22"
              class="text-nebula-light transition duration-300
                     group-hover:-translate-y-1
                     group-hover:translate-x-1
                     group-hover:text-starlight"
              aria-hidden="true"
            />
          </div>
        </a>
      </div>
    </section>

    <!-- Closing section -->
    <section class="mx-auto mt-32 max-w-7xl px-6">
      <div
        class="relative overflow-hidden rounded-[3rem]
               border border-nebula/25 bg-cosmic/25
               px-8 py-16 text-center md:px-16"
      >
        <div
          class="pointer-events-none absolute left-1/2 top-0
                 h-64 w-64 -translate-x-1/2 rounded-full
                 bg-nebula/20 blur-3xl"
        ></div>

        <div class="relative mx-auto max-w-3xl">
          <p
            class="text-sm uppercase tracking-[0.35em]
                   text-nebula-light"
          >
            New connections
          </p>

          <h2 class="mt-5 text-4xl font-bold md:text-5xl">
            Our universes may have something in common.
          </h2>

          <p class="mt-6 text-lg leading-8 text-nebula-light">
            Whether you found me through code, art, music or games,
            you are welcome to send a message & share your ideas.
          </p>

          <RouterLink
            :to="{ name: 'contact' }"
            class="mt-9 inline-flex items-center gap-3 rounded-full
                   bg-starlight px-7 py-3 font-semibold
                   text-deep-space transition
                   hover:bg-nebula-light"
          >
            Contact me

            <ArrowUpRight
              :size="20"
              aria-hidden="true"
            />
          </RouterLink>
        </div>
      </div>
    </section>
  </main>
</template>