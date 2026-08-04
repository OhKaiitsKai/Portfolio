<script setup lang="ts">
interface Technology {
  name: string
  description: string
}

const technologies: Technology[] = [
  {
    name: 'Vue.js',
    description: 'The framework used to build the interface.',
  },
  {
    name: 'TypeScript',
    description: 'Used for safer and more maintainable code.',
  },
  {
    name: 'Tailwind CSS',
    description: 'Responsible for the responsive visual system.',
  },
  {
    name: 'Firebase',
    description: 'Used for dynamic content, storage and hosting.',
  },
]
</script>

<template>
  <main class="min-h-screen px-6 pt-32 text-starlight">
    <section
      class="mx-auto grid min-h-[calc(100vh-8rem)] max-w-7xl
             items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]"
    >
      <div>
        <p
          class="text-sm uppercase tracking-[0.35em]
                 text-nebula-light"
        >
          Kai Alexxandrite McCloud ~ The Portfolio
        </p>

        <h1
          class="mt-6 max-w-4xl text-5xl font-bold leading-tight
                 md:text-7xl lg:text-8xl"
        >
          Welcome to my universe.
        </h1>

        <p
          class="mt-6 max-w-2xl text-lg leading-8
                 text-nebula-light md:text-xl"
        >
          Explore my work, creative process, interests
          and personal projects.
        </p>

        <div class="mt-8 flex flex-wrap gap-4">
          <RouterLink
            :to="{ name: 'about' }"
            class="rounded-full bg-starlight px-6 py-3
                   font-semibold text-deep-space transition
                   hover:bg-nebula-light"
          >
            About Me
          </RouterLink>

          <RouterLink
            :to="{ name: 'board' }"
            class="rounded-full border border-nebula/60 px-6 py-3
                   font-semibold text-starlight transition
                   hover:border-starlight hover:bg-starlight/10"
          >
            Explore my work
          </RouterLink>
        </div>
      </div>

      <div class="relative mx-auto w-full max-w-md">
        <div
          class="absolute inset-0 rounded-full bg-nebula/25
                 blur-3xl"
        ></div>

        <div
          class="relative aspect-[4/5] overflow-hidden rounded-[3rem]
                 border border-nebula/30 bg-cosmic/50
                 shadow-2xl"
        >
          <img
            src="../assets/images/kaipic.webp"
            alt="Portrait of Kai"
            class="h-full w-full object-cover"
          />
        </div>
      </div>
    </section>
    <section class="px-6 py-24">
  <div class="mx-auto max-w-7xl">
    <p
      class="text-sm uppercase tracking-[0.3em]
             text-nebula-light"
    >
      Built with
    </p>

    <h2 class="mt-4 text-3xl font-bold text-starlight md:text-5xl">
      The technology behind this universe
    </h2>

    <div class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <article
        v-for="technology in technologies"
        :key="technology.name"
        class="rounded-3xl border border-nebula/20
               bg-cosmic/30 p-6 backdrop-blur-md
               transition hover:-translate-y-1
               hover:border-nebula/60"
      >
        <h3 class="text-xl font-semibold text-starlight">
          {{ technology.name }}
        </h3>

        <p class="mt-3 leading-7 text-nebula-light">
          {{ technology.description }}
        </p>
      </article>
    </div>
  </div>
</section>
  </main>
</template>