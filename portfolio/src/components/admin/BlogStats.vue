<script setup lang="ts">
interface Props {
  total: number
  published: number
  drafts: number
}

defineProps<Props>()
</script>

<template>
  <section class="mt-10 grid gap-5 sm:grid-cols-3">
    <article
      class="rounded-3xl border border-nebula/20
             bg-cosmic/20 p-6"
    >
      <p
        class="text-xs uppercase tracking-[0.25em]
               text-nebula-light"
      >
        Total articles
      </p>

      <p class="mt-3 text-4xl font-bold">
        {{ total }}
      </p>
    </article>

    <article
      class="rounded-3xl border border-nebula/20
             bg-cosmic/20 p-6"
    >
      <p
        class="text-xs uppercase tracking-[0.25em]
               text-nebula-light"
      >
        Published
      </p>

      <p class="mt-3 text-4xl font-bold">
        {{ published }}
      </p>
    </article>

    <article
      class="rounded-3xl border border-nebula/20
             bg-cosmic/20 p-6"
    >
      <p
        class="text-xs uppercase tracking-[0.25em]
               text-nebula-light"
      >
        Drafts
      </p>

      <p class="mt-3 text-4xl font-bold">
        {{ drafts }}
      </p>
    </article>
  </section>
</template>