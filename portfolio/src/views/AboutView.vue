<script setup lang="ts">
import kaiPic from '../assets/images/kaipic.webp'

interface QuickFact {
  label: string
  value: string
  symbol: string
}

interface MusicPick {
  artist: string
  title: string
  type: string
  description: string
}

const quickFacts: QuickFact[] = [
  {
    label: 'Name',
    value: 'Kai',
    symbol: '✦',
  },
  {
    label: 'Age',
    value: '27',
    symbol: '☾',
  },
  {
    label: 'From',
    value: 'Monterrey, Mexico',
    symbol: '⌖',
  },
  {
    label: 'Creative sides',
    value: 'Drawing, music, photography & writing',
    symbol: '✎',
  },
  {
    label: 'Currently learning',
    value: 'Japanese — aiming for the JLPT N4',
    symbol: 'あ',
  },
  {
    label: 'Favorite fruit',
    value: 'Peach',
    symbol: '🍑',
  },
]

const musicPicks: MusicPick[] = [
  {
    artist: 'Avril Lavigne',
    title: 'Favorite artist',
    type: 'Artist',
    description:
      'A defining influence on my love for music, individuality and self-expression.',
  },
  {
    artist: 'Evanescence',
    title: 'Sanctuary',
    type: 'Album',
    description:
      'An album that connects emotion, atmosphere and intensity in a way I deeply enjoy.',
  },
  {
    artist: 'Oasis',
    title: 'Champagne Supernova',
    type: 'Song',
    description:
      'A song that feels nostalgic, vast and almost otherworldly.',
  },
]

const favoriteGames: string[] = [
  'Kirby: Nightmare in Dream Land',
  'Super Mario Advance 4: Super Mario Bros. 3',
  'Animal Crossing: New Horizons',
  'Mario Party 4',
]

const funFacts: string[] = [
  'I collect CDs and DVDs.',
  'I collect Nintendo figures and consoles.',
  'I enjoy writing poetry.',
  'I practice martial arts.',
  'I enjoy baking desserts.',
  'Peaches are my favorite fruit.',
  'I love anime and animals.',
]
</script>

<template>
  <main class="min-h-screen pb-24 pt-28 text-starlight">
    <!-- Hero -->
    <section
      class="mx-auto grid min-h-[calc(100vh-7rem)] max-w-7xl
             items-center gap-14 px-6 py-20
             lg:grid-cols-[0.9fr_1.1fr]"
    >
      <div class="relative mx-auto w-full max-w-md">
        <div
          class="absolute inset-0 rounded-full bg-nebula/25 blur-3xl"
        ></div>

        <div
          class="relative aspect-[4/5] overflow-hidden rounded-[3rem]
                 border border-nebula/30 bg-cosmic/40"
        >
          <img
            :src="kaiPic"
            alt="Portrait of Kai"
            class="h-full w-full object-cover"
          />
        </div>
      </div>

      <div>
        <p
          class="text-sm uppercase tracking-[0.35em]
                 text-nebula-light"
        >
          Meet the dreamer
        </p>

        <h1
          class="mt-5 text-5xl font-bold leading-tight
                 md:text-7xl"
        >
          My soul creates galaxies~
        </h1>

        <p class="mt-7 text-xl italic text-nebula-light">
          Reckless, loyal, and a romantic dreamer.
        </p>

        <div
          class="mt-8 max-w-2xl space-y-5
                 text-lg leading-8 text-nebula-light"
        >
          <p>
            Hi, I’m Kai. I’m a multimedia creator from Mexico
            with a deep love for languages, music, writing,
            Nintendo, anime and animals.
          </p>

          <p>
            I’m endlessly curious and always looking for something
            new to learn, create or imagine. Programming is another
            creative tool for me: I love bringing an idea to life
            entirely by myself.
          </p>

          <p>
            Through my work, I hope to inspire others to embrace
            their imagination and the parts of themselves that make
            them different.
          </p>
        </div>

        <div class="mt-9 flex flex-wrap gap-4">
          <RouterLink
            :to="{ name: 'contact' }"
            class="rounded-full bg-starlight px-6 py-3
                   font-semibold text-deep-space transition
                   hover:bg-nebula-light"
          >
            Contact me
          </RouterLink>

          <a
            href="#dreams"
            class="rounded-full border border-nebula/50 px-6 py-3
                   font-semibold text-starlight transition
                   hover:border-starlight hover:bg-starlight/10"
          >
            See my dreams
          </a>
        </div>
      </div>
    </section>

    <!-- Quick facts -->
    <section class="mx-auto mt-20 max-w-7xl px-6">
      <div class="max-w-3xl">
        <p
          class="text-sm uppercase tracking-[0.35em]
                 text-nebula-light"
        >
          Quick facts
        </p>

        <h2 class="mt-4 text-4xl font-bold md:text-5xl">
          A little more about me.
        </h2>
      </div>

      <div class="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="fact in quickFacts"
          :key="fact.label"
          class="rounded-3xl border border-nebula/20
                 bg-cosmic/25 p-6 transition duration-300
                 hover:-translate-y-1 hover:border-nebula/60"
        >
          <span class="text-2xl text-nebula-light">
            {{ fact.symbol }}
          </span>

          <p
            class="mt-5 text-xs uppercase tracking-[0.25em]
                   text-nebula-light"
          >
            {{ fact.label }}
          </p>

          <p class="mt-2 text-lg font-semibold text-starlight">
            {{ fact.value }}
          </p>
        </article>
      </div>
    </section>

    <!-- Music -->
    <section class="mx-auto mt-32 max-w-7xl px-6">
      <div class="max-w-3xl">
        <p
          class="text-sm uppercase tracking-[0.35em]
                 text-nebula-light"
        >
          Soundtrack of my universe
        </p>

        <h2 class="mt-4 text-4xl font-bold md:text-5xl">
          Music that lives among my stars.
        </h2>

        <p class="mt-5 text-lg leading-8 text-nebula-light">
          Music is one of the strongest parts of my creative world.
          These artists and songs represent different sides of it.
        </p>
      </div>

      <div class="mt-10 grid gap-6 lg:grid-cols-3">
        <article
          v-for="pick in musicPicks"
          :key="`${pick.artist}-${pick.title}`"
          class="group rounded-[2rem] border border-nebula/20
                 bg-cosmic/25 p-7 transition duration-300
                 hover:-translate-y-1 hover:border-nebula/60
                 hover:bg-cosmic/40"
        >
          <p
            class="text-xs uppercase tracking-[0.25em]
                   text-nebula-light"
          >
            {{ pick.type }}
          </p>

          <h3 class="mt-5 text-2xl font-semibold">
            {{ pick.title }}
          </h3>

          <p class="mt-2 text-nebula-light">
            {{ pick.artist }}
          </p>

          <p class="mt-5 leading-7 text-nebula-light">
            {{ pick.description }}
          </p>

          <span
            class="mt-7 inline-block text-xl text-nebula-light
                   transition group-hover:translate-x-1
                   group-hover:text-starlight"
          >
            ♪
          </span>
        </article>
      </div>
    </section>

    <!-- Nintendo -->
    <section class="mx-auto mt-32 max-w-7xl px-6">
      <div
        class="grid gap-10 rounded-[2.5rem] border
               border-nebula/20 bg-cosmic/20 p-8
               md:p-12 lg:grid-cols-[0.8fr_1.2fr]"
      >
        <div>
          <p
            class="text-sm uppercase tracking-[0.35em]
                   text-nebula-light"
          >
            Nintendo corner
          </p>

          <h2 class="mt-4 text-4xl font-bold">
            Player one since childhood.
          </h2>

          <p class="mt-5 leading-8 text-nebula-light">
            Nintendo games are a major part of my memories,
            creativity and personal collections. I especially enjoy
            games that feel imaginative, colorful and full of
            personality.
          </p>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <article
            v-for="game in favoriteGames"
            :key="game"
            class="rounded-2xl border border-nebula/20
                   bg-deep-space/40 p-5 transition duration-300
                   hover:border-nebula/60 hover:bg-deep-space/60"
          >
            <span class="text-nebula-light">✦</span>

            <h3 class="mt-3 font-semibold leading-7">
              {{ game }}
            </h3>
          </article>
        </div>
      </div>
    </section>

    <!-- Fun facts -->
    <section class="mx-auto mt-32 max-w-7xl px-6">
      <div class="max-w-3xl">
        <p
          class="text-sm uppercase tracking-[0.35em]
                 text-nebula-light"
        >
          Fun facts
        </p>

        <h2 class="mt-4 text-4xl font-bold md:text-5xl">
          Small things that make up my world.
        </h2>
      </div>

      <div class="mt-10 grid gap-4 md:grid-cols-2">
        <article
          v-for="fact in funFacts"
          :key="fact"
          class="flex items-start gap-4 rounded-2xl
                 border border-nebula/20 bg-cosmic/20 p-5
                 transition duration-300 hover:border-nebula/60"
        >
          <span class="mt-1 text-nebula-light">
            ✦
          </span>

          <p class="leading-7 text-nebula-light">
            {{ fact }}
          </p>
        </article>
      </div>
    </section>

    <!-- Dreams -->
    <section
      id="dreams"
      class="mx-auto mt-32 max-w-7xl scroll-mt-28 px-6"
    >
      <div
        class="relative overflow-hidden rounded-[3rem]
               border border-nebula/30 bg-cosmic/30
               px-8 py-16 text-center md:px-16"
      >
        <div
          class="absolute left-1/2 top-0 h-64 w-64
                 -translate-x-1/2 rounded-full
                 bg-nebula/20 blur-3xl"
        ></div>

        <div
          class="absolute -bottom-20 -left-20 h-64 w-64
                 rounded-full bg-nebula-light/10 blur-3xl"
        ></div>

        <div class="relative mx-auto max-w-4xl">
          <p
            class="text-sm uppercase tracking-[0.35em]
                   text-nebula-light"
          >
            Constellation of dreams
          </p>

          <h2 class="mt-5 text-4xl font-bold md:text-6xl">
            The universe I’m building toward.
          </h2>

          <p class="mt-7 text-lg leading-8 text-nebula-light">
            I dream of studying Astrophysics in Spain, building a
            great collection of Nintendo and the things I love,
            travelling frequently to Japan, mastering seven
            languages and composing music of my own.
          </p>

          <p class="mt-8 text-xl italic leading-8 text-starlight">
            I want my work to inspire imagination, connection and
            the courage to create something with a vision of your own.
          </p>
        </div>
      </div>
    </section>
  </main>
</template>