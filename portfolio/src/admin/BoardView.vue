<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
} from 'vue'
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from 'firebase/firestore'
import {
  deleteObject,
  ref as storageRef,
} from 'firebase/storage'
import {
  Check,
  Clock3,
  Image,
  LoaderCircle,
  RefreshCw,
  Search,
  Trash2,
  X,
} from 'lucide-vue-next'

import { db, storage } from '../firebase/config'
import type {
  DoodleStatus,
  DoodleSubmission,
} from '../types/board'

type BoardFilter = 'all' | DoodleStatus

interface AdminDoodle extends DoodleSubmission {
  storagePath: string
}

const doodles = ref<AdminDoodle[]>([])
const searchQuery = ref('')
const statusFilter = ref<BoardFilter>('pending')

const isLoading = ref(true)
const processingDoodleId = ref<string | null>(null)

const errorMessage = ref('')
const successMessage = ref('')

let unsubscribeDoodles: (() => void) | null = null

const pendingCount = computed(() => {
  return doodles.value.filter(
    (doodle) => doodle.status === 'pending',
  ).length
})

const approvedCount = computed(() => {
  return doodles.value.filter(
    (doodle) => doodle.status === 'approved',
  ).length
})

const rejectedCount = computed(() => {
  return doodles.value.filter(
    (doodle) => doodle.status === 'rejected',
  ).length
})

const filteredDoodles = computed(() => {
  const search = searchQuery.value
    .trim()
    .toLowerCase()

  return doodles.value.filter((doodle) => {
    const matchesStatus =
      statusFilter.value === 'all' ||
      doodle.status === statusFilter.value

    const matchesSearch =
      !search ||
      doodle.name.toLowerCase().includes(search)

    return matchesStatus && matchesSearch
  })
})

function subscribeToDoodles(): void {
  isLoading.value = true
  errorMessage.value = ''

  unsubscribeDoodles?.()

  const doodlesQuery = query(
    collection(db, 'doodles'),
    orderBy('createdAt', 'desc'),
  )

  unsubscribeDoodles = onSnapshot(
    doodlesQuery,
    (snapshot) => {
      doodles.value = snapshot.docs.map(
        (doodleDocument) => {
          const data = doodleDocument.data()

          return {
            id: doodleDocument.id,
            name: data.name ?? 'Anonymous',
            imageUrl: data.imageUrl ?? '',
            storagePath: data.storagePath ?? '',
            status:
              data.status === 'approved' ||
              data.status === 'rejected'
                ? data.status
                : 'pending',
            createdAt: data.createdAt ?? null,
            reviewedAt: data.reviewedAt ?? null,
          } satisfies AdminDoodle
        },
      )

      isLoading.value = false
    },
    (error) => {
      console.error(
        'Unable to load doodles:',
        error,
      )

      errorMessage.value =
        'The doodles could not be loaded from Firestore.'

      isLoading.value = false
    },
  )
}

async function updateDoodleStatus(
  doodle: AdminDoodle,
  status: DoodleStatus,
): Promise<void> {
  processingDoodleId.value = doodle.id
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await updateDoc(
      doc(db, 'doodles', doodle.id),
      {
        status,
        reviewedAt:
          status === 'pending'
            ? null
            : serverTimestamp(),
      },
    )

    doodle.status = status

    successMessage.value =
      status === 'approved'
        ? `"${doodle.name}" was approved.`
        : status === 'rejected'
          ? `"${doodle.name}" was rejected.`
          : `"${doodle.name}" was moved back to pending.`
  } catch (error: unknown) {
    console.error(
      'Unable to update doodle status:',
      error,
    )

    errorMessage.value =
      'The doodle status could not be updated.'
  } finally {
    processingDoodleId.value = null
  }
}

async function deleteStoredImage(
  storagePath: string,
): Promise<void> {
  if (!storagePath) return

  try {
    await deleteObject(
      storageRef(storage, storagePath),
    )
  } catch (error: unknown) {
    console.warn(
      'The doodle image could not be deleted:',
      error,
    )
  }
}

async function deleteDoodle(
  doodle: AdminDoodle,
): Promise<void> {
  const confirmed = window.confirm(
    `Delete the doodle submitted by "${doodle.name}" permanently?`,
  )

  if (!confirmed) return

  processingDoodleId.value = doodle.id
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await deleteDoc(
      doc(db, 'doodles', doodle.id),
    )

    await deleteStoredImage(
      doodle.storagePath,
    )

    successMessage.value =
      `The doodle submitted by "${doodle.name}" was deleted.`
  } catch (error: unknown) {
    console.error(
      'Unable to delete doodle:',
      error,
    )

    errorMessage.value =
      'The doodle could not be deleted.'
  } finally {
    processingDoodleId.value = null
  }
}

function formatDate(
  timestamp: Timestamp | null,
): string {
  if (!timestamp) {
    return 'Just now'
  }

  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(timestamp.toDate())
}

onMounted(subscribeToDoodles)

onBeforeUnmount(() => {
  unsubscribeDoodles?.()
})
</script>

<template>
  <main class="min-h-screen pb-24 pt-12 text-starlight">
    <section class="mx-auto max-w-7xl px-6">
      <!-- Heading -->
      <div
        class="flex flex-col gap-7 border-b
               border-nebula/20 pb-9
               lg:flex-row lg:items-end
               lg:justify-between"
      >
        <div class="max-w-3xl">
          <p
            class="text-sm uppercase tracking-[0.35em]
                   text-nebula-light"
          >
            Board moderation
          </p>

          <h1
            class="mt-4 text-5xl font-bold
                   md:text-6xl"
          >
            Review incoming doodles.
          </h1>

          <p
            class="mt-5 text-lg leading-8
                   text-nebula-light"
          >
            Approve the drawings that can join the public board,
            reject unsuitable submissions or remove them permanently.
          </p>
        </div>

        <button
          type="button"
          class="inline-flex items-center justify-center
                 gap-2 rounded-full border
                 border-nebula/40 px-6 py-3
                 font-semibold transition
                 hover:border-starlight
                 hover:bg-starlight/10
                 disabled:cursor-not-allowed
                 disabled:opacity-50"
          :disabled="isLoading"
          @click="subscribeToDoodles"
        >
          <RefreshCw
            :size="19"
            :class="{
              'animate-spin': isLoading,
            }"
            aria-hidden="true"
          />

          Refresh
        </button>
      </div>

      <!-- Statistics -->
      <section
        class="mt-10 grid gap-5
               sm:grid-cols-2 xl:grid-cols-4"
      >
        <article
          class="rounded-3xl border
                 border-nebula/20 bg-cosmic/20 p-6"
        >
          <p
            class="text-xs uppercase tracking-[0.25em]
                   text-nebula-light"
          >
            Total doodles
          </p>

          <p class="mt-3 text-4xl font-bold">
            {{ doodles.length }}
          </p>
        </article>

        <article
          class="rounded-3xl border
                 border-nebula/20 bg-cosmic/20 p-6"
        >
          <p
            class="text-xs uppercase tracking-[0.25em]
                   text-nebula-light"
          >
            Pending
          </p>

          <p class="mt-3 text-4xl font-bold">
            {{ pendingCount }}
          </p>
        </article>

        <article
          class="rounded-3xl border
                 border-nebula/20 bg-cosmic/20 p-6"
        >
          <p
            class="text-xs uppercase tracking-[0.25em]
                   text-nebula-light"
          >
            Approved
          </p>

          <p class="mt-3 text-4xl font-bold">
            {{ approvedCount }}
          </p>
        </article>

        <article
          class="rounded-3xl border
                 border-nebula/20 bg-cosmic/20 p-6"
        >
          <p
            class="text-xs uppercase tracking-[0.25em]
                   text-nebula-light"
          >
            Rejected
          </p>

          <p class="mt-3 text-4xl font-bold">
            {{ rejectedCount }}
          </p>
        </article>
      </section>

      <!-- Filters -->
      <section
        class="mt-8 rounded-[2rem] border
               border-nebula/20 bg-cosmic/20 p-5"
      >
        <div
          class="grid gap-4
                 lg:grid-cols-[minmax(0,1fr)_14rem]"
        >
          <label class="relative">
            <span class="sr-only">
              Search doodles
            </span>

            <Search
              :size="19"
              class="pointer-events-none absolute
                     left-4 top-1/2 -translate-y-1/2
                     text-nebula-light"
              aria-hidden="true"
            />

            <input
              v-model="searchQuery"
              type="search"
              placeholder="Search by creator name..."
              class="w-full rounded-2xl border
                     border-nebula/30 bg-deep-space/60
                     py-3 pl-12 pr-4 text-starlight
                     outline-none transition
                     placeholder:text-nebula-light/40
                     focus:border-nebula-light"
            />
          </label>

          <select
            v-model="statusFilter"
            aria-label="Filter doodles by status"
            class="rounded-2xl border
                   border-nebula/30 bg-deep-space
                   px-4 py-3 text-starlight
                   outline-none transition
                   focus:border-nebula-light"
          >
            <option value="all">
              All doodles
            </option>

            <option value="pending">
              Pending
            </option>

            <option value="approved">
              Approved
            </option>

            <option value="rejected">
              Rejected
            </option>
          </select>
        </div>
      </section>

      <!-- Feedback -->
      <p
        v-if="errorMessage"
        class="mt-6 rounded-2xl border
               border-red-300/30 bg-red-300/10
               px-4 py-3 text-sm text-red-200"
        role="alert"
      >
        {{ errorMessage }}
      </p>

      <p
        v-if="successMessage"
        class="mt-6 rounded-2xl border
               border-nebula-light/30
               bg-nebula-light/10 px-4 py-3
               text-sm text-starlight"
        role="status"
      >
        {{ successMessage }}
      </p>

      <!-- Loading -->
      <div
        v-if="isLoading"
        class="flex min-h-96 items-center
               justify-center"
      >
        <div
          class="flex items-center gap-3
                 text-nebula-light"
        >
          <LoaderCircle
            :size="26"
            class="animate-spin"
            aria-hidden="true"
          />

          Loading doodles...
        </div>
      </div>

      <!-- Empty -->
      <section
        v-else-if="doodles.length === 0"
        class="mt-10 rounded-[3rem] border
               border-dashed border-nebula/30
               bg-cosmic/15 px-8 py-24
               text-center"
      >
        <Image
          :size="52"
          class="mx-auto text-nebula-light"
          aria-hidden="true"
        />

        <h2 class="mt-6 text-3xl font-semibold">
          No doodles have arrived yet.
        </h2>

        <p
          class="mx-auto mt-4 max-w-xl
                 leading-7 text-nebula-light"
        >
          New submissions from the public Board will appear here
          automatically.
        </p>
      </section>

      <!-- No results -->
      <section
        v-else-if="filteredDoodles.length === 0"
        class="mt-10 rounded-[2rem] border
               border-nebula/20 bg-cosmic/20
               px-8 py-16 text-center"
      >
        <h2 class="text-2xl font-semibold">
          No matching doodles.
        </h2>

        <p class="mt-3 text-nebula-light">
          Try another name or moderation status.
        </p>
      </section>

      <!-- Doodles -->
      <section
        v-else
        class="mt-10 grid gap-6
               md:grid-cols-2 xl:grid-cols-3"
      >
        <article
          v-for="doodle in filteredDoodles"
          :key="doodle.id"
          class="overflow-hidden rounded-[2rem]
                 border border-nebula/20
                 bg-cosmic/20 transition
                 hover:border-nebula/50"
        >
          <div
            class="relative overflow-hidden
                   bg-deep-space/60"
          >
            <img
              :src="doodle.imageUrl"
              :alt="`Doodle submitted by ${doodle.name}`"
              class="aspect-[12/6.5]
                     w-full object-cover"
            />

            <span
              class="absolute left-4 top-4 rounded-full
                     border px-3 py-1 text-xs
                     font-semibold uppercase
                     tracking-[0.15em] backdrop-blur"
              :class="{
                'border-amber-200/40 bg-amber-200/15 text-amber-100':
                  doodle.status === 'pending',
                'border-nebula-light/40 bg-nebula-light/15 text-starlight':
                  doodle.status === 'approved',
                'border-red-300/40 bg-red-300/15 text-red-100':
                  doodle.status === 'rejected',
              }"
            >
              {{ doodle.status }}
            </span>
          </div>

          <div class="p-6">
            <h2 class="text-2xl font-semibold">
              {{ doodle.name }}
            </h2>

            <div
              class="mt-3 flex items-center gap-2
                     text-sm text-nebula-light"
            >
              <Clock3
                :size="16"
                aria-hidden="true"
              />

              {{ formatDate(doodle.createdAt) }}
            </div>

            <div
              class="mt-6 flex flex-wrap gap-3
                     border-t border-nebula/20 pt-5"
            >
              <button
                v-if="doodle.status !== 'approved'"
                type="button"
                class="inline-flex flex-1 items-center
                       justify-center gap-2 rounded-full
                       bg-starlight px-4 py-2
                       font-semibold text-deep-space
                       transition hover:bg-nebula-light
                       disabled:opacity-50"
                :disabled="
                  processingDoodleId === doodle.id
                "
                @click="
                  updateDoodleStatus(
                    doodle,
                    'approved',
                  )
                "
              >
                <LoaderCircle
                  v-if="
                    processingDoodleId === doodle.id
                  "
                  :size="17"
                  class="animate-spin"
                  aria-hidden="true"
                />

                <Check
                  v-else
                  :size="17"
                  aria-hidden="true"
                />

                Approve
              </button>

              <button
                v-if="doodle.status !== 'rejected'"
                type="button"
                class="inline-flex flex-1 items-center
                       justify-center gap-2 rounded-full
                       border border-nebula/40
                       px-4 py-2 font-semibold
                       transition hover:border-starlight
                       hover:bg-starlight/10
                       disabled:opacity-50"
                :disabled="
                  processingDoodleId === doodle.id
                "
                @click="
                  updateDoodleStatus(
                    doodle,
                    'rejected',
                  )
                "
              >
                <X
                  :size="17"
                  aria-hidden="true"
                />

                Reject
              </button>

              <button
                type="button"
                class="inline-flex items-center
                       justify-center gap-2 rounded-full
                       border border-red-300/30
                       px-4 py-2 font-semibold
                       text-red-200 transition
                       hover:bg-red-300/10
                       disabled:opacity-50"
                :disabled="
                  processingDoodleId === doodle.id
                "
                @click="deleteDoodle(doodle)"
              >
                <Trash2
                  :size="17"
                  aria-hidden="true"
                />

                Delete
              </button>
            </div>
          </div>
        </article>
      </section>
    </section>
  </main>
</template>