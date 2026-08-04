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
  CalendarDays,
  Check,
  CheckCheck,
  Inbox,
  LoaderCircle,
  Mail,
  MailOpen,
  RefreshCw,
  Search,
  Trash2,
  User,
  X,
} from 'lucide-vue-next'

import { db } from '../firebase/config'

type MessageStatus = 'unread' | 'read'
type MessageFilter = 'all' | MessageStatus

interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string
  message: string
  status: MessageStatus
  createdAt: Timestamp | null
  readAt: Timestamp | null
}

const messages = ref<ContactMessage[]>([])
const selectedMessage = ref<ContactMessage | null>(null)

const searchQuery = ref('')
const statusFilter = ref<MessageFilter>('all')

const isLoading = ref(true)
const processingMessageId = ref<string | null>(null)

const errorMessage = ref('')
const successMessage = ref('')

let unsubscribeMessages: (() => void) | null = null

const unreadCount = computed(() => {
  return messages.value.filter(
    (message) => message.status === 'unread',
  ).length
})

const readCount = computed(() => {
  return messages.value.filter(
    (message) => message.status === 'read',
  ).length
})

const filteredMessages = computed(() => {
  const search = searchQuery.value
    .trim()
    .toLowerCase()

  return messages.value.filter((message) => {
    const matchesStatus =
      statusFilter.value === 'all' ||
      message.status === statusFilter.value

    const matchesSearch =
      !search ||
      message.name.toLowerCase().includes(search) ||
      message.email.toLowerCase().includes(search) ||
      message.subject.toLowerCase().includes(search) ||
      message.message.toLowerCase().includes(search)

    return matchesStatus && matchesSearch
  })
})

function subscribeToMessages(): void {
  isLoading.value = true
  errorMessage.value = ''

  unsubscribeMessages?.()

  const messagesQuery = query(
    collection(db, 'contactMessages'),
    orderBy('createdAt', 'desc'),
  )

  unsubscribeMessages = onSnapshot(
    messagesQuery,
    (snapshot) => {
      messages.value = snapshot.docs.map(
        (messageDocument) => {
          const data = messageDocument.data()

          return {
            id: messageDocument.id,
            name: data.name ?? 'Unknown sender',
            email: data.email ?? '',
            subject: data.subject ?? 'No subject',
            message: data.message ?? '',
            status:
              data.status === 'read'
                ? 'read'
                : 'unread',
            createdAt: data.createdAt ?? null,
            readAt: data.readAt ?? null,
          } satisfies ContactMessage
        },
      )

      isLoading.value = false
    },
    (error) => {
      console.error(
        'Unable to load contact messages:',
        error,
      )

      errorMessage.value =
        'The messages could not be loaded from Firestore.'

      isLoading.value = false
    },
  )
}

async function openMessage(
  message: ContactMessage,
): Promise<void> {
  selectedMessage.value = message

  if (message.status === 'unread') {
    await markAsRead(message)
  }
}

function closeMessage(): void {
  selectedMessage.value = null
}

async function markAsRead(
  message: ContactMessage,
): Promise<void> {
  if (message.status === 'read') return

  processingMessageId.value = message.id
  errorMessage.value = ''

  try {
    await updateDoc(
      doc(db, 'contactMessages', message.id),
      {
        status: 'read',
        readAt: serverTimestamp(),
      },
    )

    message.status = 'read'
  } catch (error) {
    console.error(
      'Unable to mark message as read:',
      error,
    )

    errorMessage.value =
      'The message could not be marked as read.'
  } finally {
    processingMessageId.value = null
  }
}

async function markAsUnread(
  message: ContactMessage,
): Promise<void> {
  if (message.status === 'unread') return

  processingMessageId.value = message.id
  errorMessage.value = ''

  try {
    await updateDoc(
      doc(db, 'contactMessages', message.id),
      {
        status: 'unread',
        readAt: null,
      },
    )

    message.status = 'unread'

    if (
      selectedMessage.value?.id === message.id
    ) {
      selectedMessage.value.status = 'unread'
    }

    successMessage.value =
      `"${message.subject}" was marked as unread.`
  } catch (error) {
    console.error(
      'Unable to mark message as unread:',
      error,
    )

    errorMessage.value =
      'The message could not be marked as unread.'
  } finally {
    processingMessageId.value = null
  }
}

async function deleteMessage(
  message: ContactMessage,
): Promise<void> {
  const confirmed = window.confirm(
    `Delete the message "${message.subject}" from ${message.name}?`,
  )

  if (!confirmed) return

  processingMessageId.value = message.id
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await deleteDoc(
      doc(db, 'contactMessages', message.id),
    )

    if (
      selectedMessage.value?.id === message.id
    ) {
      closeMessage()
    }

    successMessage.value =
      `"${message.subject}" was deleted.`
  } catch (error) {
    console.error(
      'Unable to delete message:',
      error,
    )

    errorMessage.value =
      'The message could not be deleted.'
  } finally {
    processingMessageId.value = null
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

function formatShortDate(
  timestamp: Timestamp | null,
): string {
  if (!timestamp) {
    return 'Now'
  }

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
  }).format(timestamp.toDate())
}

onMounted(subscribeToMessages)

onBeforeUnmount(() => {
  unsubscribeMessages?.()
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
            Contact inbox
          </p>

          <h1
            class="mt-4 text-5xl font-bold
                   md:text-6xl"
          >
            Messages from the universe.
          </h1>

          <p
            class="mt-5 text-lg leading-8
                   text-nebula-light"
          >
            Read and manage the signals sent through
            your contact form.
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
          @click="subscribeToMessages"
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
        class="mt-10 grid gap-5 sm:grid-cols-3"
      >
        <article
          class="rounded-3xl border
                 border-nebula/20 bg-cosmic/20 p-6"
        >
          <p
            class="text-xs uppercase tracking-[0.25em]
                   text-nebula-light"
          >
            Total messages
          </p>

          <p class="mt-3 text-4xl font-bold">
            {{ messages.length }}
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
            Unread
          </p>

          <p class="mt-3 text-4xl font-bold">
            {{ unreadCount }}
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
            Read
          </p>

          <p class="mt-3 text-4xl font-bold">
            {{ readCount }}
          </p>
        </article>
      </section>

      <!-- Search and filters -->
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
              Search messages
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
              placeholder="Search by sender, email, subject or content..."
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
            aria-label="Filter messages by status"
            class="rounded-2xl border
                   border-nebula/30 bg-deep-space
                   px-4 py-3 text-starlight
                   outline-none transition
                   focus:border-nebula-light"
          >
            <option value="all">
              All messages
            </option>

            <option value="unread">
              Unread
            </option>

            <option value="read">
              Read
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

          Loading messages...
        </div>
      </div>

      <!-- Empty inbox -->
      <section
        v-else-if="messages.length === 0"
        class="mt-10 rounded-[3rem] border
               border-dashed border-nebula/30
               bg-cosmic/15 px-8 py-24
               text-center"
      >
        <Inbox
          :size="52"
          class="mx-auto text-nebula-light"
          aria-hidden="true"
        />

        <h2 class="mt-6 text-3xl font-semibold">
          Your inbox is empty.
        </h2>

        <p
          class="mx-auto mt-4 max-w-xl
                 leading-7 text-nebula-light"
        >
          Messages submitted through the contact form
          will appear here automatically.
        </p>
      </section>

      <!-- No matching messages -->
      <section
        v-else-if="filteredMessages.length === 0"
        class="mt-10 rounded-[2rem] border
               border-nebula/20 bg-cosmic/20
               px-8 py-16 text-center"
      >
        <h2 class="text-2xl font-semibold">
          No matching messages.
        </h2>

        <p class="mt-3 text-nebula-light">
          Try another search term or status.
        </p>
      </section>

      <!-- Inbox list -->
      <section
        v-else
        class="mt-10 overflow-hidden rounded-[2rem]
               border border-nebula/20 bg-cosmic/15"
      >
        <article
          v-for="message in filteredMessages"
          :key="message.id"
          class="group grid cursor-pointer gap-5
                 border-b border-nebula/15 p-6
                 transition last:border-b-0
                 hover:bg-cosmic/35
                 md:grid-cols-[auto_1fr_auto]"
          :class="
            message.status === 'unread'
              ? 'bg-nebula/10'
              : ''
          "
          tabindex="0"
          role="button"
          @click="openMessage(message)"
          @keydown.enter="openMessage(message)"
        >
          <!-- Icon -->
          <div
            class="flex h-12 w-12 shrink-0
                   items-center justify-center
                   rounded-2xl border
                   border-nebula/30 bg-deep-space/50
                   text-nebula-light transition
                   group-hover:text-starlight"
          >
            <Mail
              v-if="message.status === 'unread'"
              :size="22"
              aria-hidden="true"
            />

            <MailOpen
              v-else
              :size="22"
              aria-hidden="true"
            />
          </div>

          <!-- Summary -->
          <div class="min-w-0">
            <div
              class="flex flex-wrap items-center gap-3"
            >
              <h2
                class="truncate text-lg"
                :class="
                  message.status === 'unread'
                    ? 'font-bold text-starlight'
                    : 'font-semibold'
                "
              >
                {{ message.name }}
              </h2>

              <span
                v-if="message.status === 'unread'"
                class="rounded-full
                       bg-starlight px-2 py-1
                       text-[0.65rem] font-bold
                       uppercase tracking-[0.15em]
                       text-deep-space"
              >
                New
              </span>
            </div>

            <p
              class="mt-1 truncate font-semibold
                     text-nebula-light"
            >
              {{ message.subject }}
            </p>

            <p
              class="mt-2 line-clamp-2
                     leading-7 text-nebula-light/80"
            >
              {{ message.message }}
            </p>
          </div>

          <!-- Date and actions -->
          <div
            class="flex items-center justify-between
                   gap-5 md:flex-col md:items-end"
          >
            <time
              :datetime="
                message.createdAt
                  ?.toDate()
                  .toISOString()
              "
              class="whitespace-nowrap text-sm
                     text-nebula-light"
            >
              {{ formatShortDate(message.createdAt) }}
            </time>

            <div
              class="flex gap-2"
              @click.stop
            >
              <button
                v-if="message.status === 'unread'"
                type="button"
                class="flex h-9 w-9 items-center
                       justify-center rounded-full
                       border border-nebula/30
                       text-nebula-light transition
                       hover:border-starlight
                       hover:text-starlight
                       disabled:opacity-50"
                :disabled="
                  processingMessageId === message.id
                "
                aria-label="Mark message as read"
                @click="markAsRead(message)"
              >
                <Check
                  :size="17"
                  aria-hidden="true"
                />
              </button>

              <button
                v-else
                type="button"
                class="flex h-9 w-9 items-center
                       justify-center rounded-full
                       border border-nebula/30
                       text-nebula-light transition
                       hover:border-starlight
                       hover:text-starlight
                       disabled:opacity-50"
                :disabled="
                  processingMessageId === message.id
                "
                aria-label="Mark message as unread"
                @click="markAsUnread(message)"
              >
                <Mail
                  :size="17"
                  aria-hidden="true"
                />
              </button>

              <button
                type="button"
                class="flex h-9 w-9 items-center
                       justify-center rounded-full
                       border border-red-300/25
                       text-red-200 transition
                       hover:bg-red-300/10
                       disabled:opacity-50"
                :disabled="
                  processingMessageId === message.id
                "
                aria-label="Delete message"
                @click="deleteMessage(message)"
              >
                <Trash2
                  :size="17"
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>
        </article>
      </section>
    </section>

    <!-- Message modal -->
    <Teleport to="body">
      <div
        v-if="selectedMessage"
        class="fixed inset-0 z-[100]
               flex items-center justify-center
               bg-deep-space/85 px-6 py-10
               backdrop-blur-md"
        @click.self="closeMessage"
      >
        <section
          class="relative max-h-[90vh] w-full
                 max-w-3xl overflow-y-auto
                 rounded-[2.5rem] border
                 border-nebula/30 bg-deep-space
                 p-7 shadow-2xl md:p-10"
          role="dialog"
          aria-modal="true"
          aria-labelledby="message-title"
        >
          <button
            type="button"
            class="absolute right-6 top-6
                   flex h-10 w-10 items-center
                   justify-center rounded-full
                   border border-nebula/30
                   text-nebula-light transition
                   hover:border-starlight
                   hover:text-starlight"
            aria-label="Close message"
            @click="closeMessage"
          >
            <X
              :size="20"
              aria-hidden="true"
            />
          </button>

          <p
            class="text-sm uppercase tracking-[0.35em]
                   text-nebula-light"
          >
            Incoming signal
          </p>

          <h2
            id="message-title"
            class="mt-4 pr-12 text-4xl font-bold"
          >
            {{ selectedMessage.subject }}
          </h2>

          <!-- Sender -->
          <div
            class="mt-8 grid gap-4 rounded-[2rem]
                   border border-nebula/20
                   bg-cosmic/20 p-5
                   sm:grid-cols-2"
          >
            <div class="flex items-start gap-3">
              <User
                :size="20"
                class="mt-1 shrink-0
                       text-nebula-light"
                aria-hidden="true"
              />

              <div>
                <p
                  class="text-xs uppercase
                         tracking-[0.2em]
                         text-nebula-light"
                >
                  Sender
                </p>

                <p class="mt-1 font-semibold">
                  {{ selectedMessage.name }}
                </p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <Mail
                :size="20"
                class="mt-1 shrink-0
                       text-nebula-light"
                aria-hidden="true"
              />

              <div class="min-w-0">
                <p
                  class="text-xs uppercase
                         tracking-[0.2em]
                         text-nebula-light"
                >
                  Email
                </p>

                <a
                  :href="`mailto:${selectedMessage.email}`"
                  class="mt-1 block truncate
                         font-semibold transition
                         hover:text-nebula-light"
                >
                  {{ selectedMessage.email }}
                </a>
              </div>
            </div>

            <div
              class="flex items-start gap-3
                     sm:col-span-2"
            >
              <CalendarDays
                :size="20"
                class="mt-1 shrink-0
                       text-nebula-light"
                aria-hidden="true"
              />

              <div>
                <p
                  class="text-xs uppercase
                         tracking-[0.2em]
                         text-nebula-light"
                >
                  Received
                </p>

                <p class="mt-1 font-semibold">
                  {{
                    formatDate(
                      selectedMessage.createdAt,
                    )
                  }}
                </p>
              </div>
            </div>
          </div>

          <!-- Message -->
          <div
            class="mt-6 whitespace-pre-wrap
                   rounded-[2rem] border
                   border-nebula/20 bg-cosmic/20
                   p-6 text-lg leading-8
                   text-nebula-light"
          >
            {{ selectedMessage.message }}
          </div>

          <!-- Modal actions -->
          <div
            class="mt-8 flex flex-col-reverse gap-3
                   border-t border-nebula/20 pt-6
                   sm:flex-row sm:justify-end"
          >
            <button
              type="button"
              class="inline-flex items-center
                     justify-center gap-2 rounded-full
                     border border-red-300/30
                     px-6 py-3 font-semibold
                     text-red-200 transition
                     hover:bg-red-300/10"
              @click="deleteMessage(selectedMessage)"
            >
              <Trash2
                :size="18"
                aria-hidden="true"
              />

              Delete
            </button>

            <button
              v-if="
                selectedMessage.status === 'read'
              "
              type="button"
              class="inline-flex items-center
                     justify-center gap-2 rounded-full
                     border border-nebula/40
                     px-6 py-3 font-semibold
                     transition hover:border-starlight
                     hover:bg-starlight/10"
              @click="
                markAsUnread(selectedMessage)
              "
            >
              <Mail
                :size="18"
                aria-hidden="true"
              />

              Mark unread
            </button>

            <a
              :href="
                `mailto:${selectedMessage.email}` +
                `?subject=${encodeURIComponent(
                  `Re: ${selectedMessage.subject}`,
                )}`
              "
              class="inline-flex items-center
                     justify-center gap-2 rounded-full
                     bg-starlight px-6 py-3
                     font-semibold text-deep-space
                     transition hover:bg-nebula-light"
            >
              <CheckCheck
                :size="18"
                aria-hidden="true"
              />

              Reply by email
            </a>
          </div>
        </section>
      </div>
    </Teleport>
  </main>
</template>