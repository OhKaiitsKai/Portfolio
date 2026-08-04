<script setup lang="ts">
interface Technology {
  name: string
  description: string
  label: string
}

const technologies: Technology[] = [
  {
    name: 'Vue.js',
    label: 'Frontend framework',
    description:
      'Used to create a reactive, component-based and maintainable interface.',
  },
  {
    name: 'TypeScript',
    label: 'Type safety',
    description:
      'Helps prevent errors and keeps the project easier to understand as it grows.',
  },
  {
    name: 'Tailwind CSS',
    label: 'Visual system',
    description:
      'Used to build the responsive layout and the custom galactic interface.',
  },
  {
    name: 'Firebase',
    label: 'Backend services',
    description:
      'Provides storage, dynamic content, authentication and deployment tools.',
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
      <div
         class="absolute inset-x-0 bottom-0 h-px
         bg-gradient-to-r
         from-transparent
         via-nebula/50
         to-transparent"
          ></div>
    </section>
    
    <section class="relative px-6 py-24">
     <div class="mx-auto max-w-7xl">
      <div class="max-w-3xl">
      <p
        class="text-sm uppercase tracking-[0.35em]
               text-nebula-light"
       >
        Built with
      </p>

      <h2
        class="mt-4 text-4xl font-bold tracking-tight
               text-starlight md:text-5xl"
      >
        The technology behind this universe.
      </h2>

      <p
        class="mt-6 text-lg leading-8
               text-nebula-light"
      >
        This portfolio combines modern web technologies with a
        visual identity inspired by galaxies, creative exploration
        and digital art.
      </p>
    </div>

    <div
      class="mt-12 grid gap-6
             sm:grid-cols-2 lg:grid-cols-4"
    >
      <article
        v-for="technology in technologies"
        :key="technology.name"
        class="group relative overflow-hidden rounded-3xl
               border border-nebula/20 bg-cosmic/25 p-7
               backdrop-blur-md transition duration-300
               hover:-translate-y-2 hover:border-nebula/60
               hover:bg-cosmic/40"
      >
        <div
          class="absolute -right-10 -top-10 h-28 w-28
                 rounded-full bg-nebula/10 blur-2xl
                 transition duration-300
                 group-hover:bg-nebula/25"
        ></div>

        <p
          class="relative text-xs uppercase tracking-[0.25em]
                 text-nebula-light"
        >
          {{ technology.label }}
        </p>

        <h3
          class="relative mt-5 text-2xl font-semibold
                 text-starlight"
        >
          {{ technology.name }}
        </h3>

        <p
          class="relative mt-4 leading-7
                 text-nebula-light"
        >
          {{ technology.description }}
        </p>
      </article>
    </div>
  </div>
</section>
  </main>
</template>