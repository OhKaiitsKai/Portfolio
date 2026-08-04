<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'

interface Doodle {
  id: string
  name: string
  image: string
  createdAt: string
}

const STORAGE_KEY = 'portfolio-doodles'

const canvasRef = ref<HTMLCanvasElement | null>(null)
const name = ref('')
const color = ref('#062B43')
const brushSize = ref(5)
const isDrawing = ref(false)
const hasDrawing = ref(false)
const errorMessage = ref('')
const doodles = ref<Doodle[]>([])

let context: CanvasRenderingContext2D | null = null

function prepareCanvas(): void {
  const canvas = canvasRef.value

  if (!canvas) return

  context = canvas.getContext('2d')

  if (!context) return

  context.lineCap = 'round'
  context.lineJoin = 'round'

  clearCanvas()
}

function getPointerPosition(event: PointerEvent) {
  const canvas = canvasRef.value

  if (!canvas) {
    return { x: 0, y: 0 }
  }

  const bounds = canvas.getBoundingClientRect()

  return {
    x: (event.clientX - bounds.left) * (canvas.width / bounds.width),
    y: (event.clientY - bounds.top) * (canvas.height / bounds.height),
  }
}

function startDrawing(event: PointerEvent): void {
  if (!context || !canvasRef.value) return

  isDrawing.value = true
  hasDrawing.value = true
  errorMessage.value = ''

  canvasRef.value.setPointerCapture(event.pointerId)

  const { x, y } = getPointerPosition(event)

  context.beginPath()
  context.moveTo(x, y)
}

function draw(event: PointerEvent): void {
  if (!isDrawing.value || !context) return

  const { x, y } = getPointerPosition(event)

  context.strokeStyle = color.value
  context.lineWidth = brushSize.value
  context.lineTo(x, y)
  context.stroke()
}

function stopDrawing(event?: PointerEvent): void {
  if (!isDrawing.value) return

  isDrawing.value = false
  context?.closePath()

  if (
    event &&
    canvasRef.value?.hasPointerCapture(event.pointerId)
  ) {
    canvasRef.value.releasePointerCapture(event.pointerId)
  }
}

function clearCanvas(): void {
  const canvas = canvasRef.value

  if (!canvas || !context) return

  context.clearRect(0, 0, canvas.width, canvas.height)

  context.fillStyle = '#C7DCED'
  context.fillRect(0, 0, canvas.width, canvas.height)

  hasDrawing.value = false
  errorMessage.value = ''
}

function loadDoodles(): void {
  const storedDoodles = localStorage.getItem(STORAGE_KEY)

  if (!storedDoodles) return

  try {
    doodles.value = JSON.parse(storedDoodles) as Doodle[]
  } catch {
    localStorage.removeItem(STORAGE_KEY)
  }
}

function saveDoodles(): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(doodles.value),
  )
}

function submitDoodle(): void {
  const canvas = canvasRef.value
  const trimmedName = name.value.trim()

  if (!trimmedName) {
    errorMessage.value = 'Please enter your name.'
    return
  }

  if (!hasDrawing.value) {
    errorMessage.value = 'Please draw something before submitting.'
    return
  }

  if (!canvas) return

  const newDoodle: Doodle = {
    id: crypto.randomUUID(),
    name: trimmedName,
    image: canvas.toDataURL('image/webp', 0.85),
    createdAt: new Date().toISOString(),
  }

  doodles.value.unshift(newDoodle)
  saveDoodles()

  name.value = ''
  clearCanvas()
}

function deleteDoodle(id: string): void {
  doodles.value = doodles.value.filter(
    (doodle) => doodle.id !== id,
  )

  saveDoodles()
}

function formatTimestamp(timestamp: string): string {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(timestamp))
}

onMounted(async () => {
  loadDoodles()
  await nextTick()
  prepareCanvas()
})
</script>

<template>
  <main class="min-h-screen px-6 py-32 text-starlight">
    <section class="mx-auto max-w-7xl">
      <header class="max-w-3xl">
        <p
          class="text-sm uppercase tracking-[0.35em]
                 text-nebula-light"
        >
          Creative space
        </p>

        <h1 class="mt-4 text-5xl font-bold md:text-6xl">
          Board
        </h1>

        <p class="mt-5 text-lg leading-8 text-nebula-light">
          Leave a small doodle in my universe.
        </p>
      </header>

      <div
        class="mt-12 rounded-3xl border border-nebula/30
               bg-cosmic/30 p-5 backdrop-blur-md"
      >
        <div
          class="mb-5 flex flex-col gap-4
                 lg:flex-row lg:items-end"
        >
          <label class="flex-1">
            <span class="mb-2 block text-sm text-nebula-light">
              Name
            </span>

            <input
              v-model="name"
              type="text"
              maxlength="40"
              required
              placeholder="Write your name"
              class="w-full rounded-xl border border-nebula/30
                     bg-deep-space/60 px-4 py-3 text-starlight
                     outline-none transition
                     placeholder:text-nebula-light/50
                     focus:border-nebula-light"
            />
          </label>

          <label>
            <span class="mb-2 block text-sm text-nebula-light">
              Color
            </span>

            <input
              v-model="color"
              type="color"
              class="h-12 w-16 cursor-pointer rounded-lg
                     border border-nebula/30 bg-transparent"
            />
          </label>

          <label class="min-w-48">
            <span class="mb-2 block text-sm text-nebula-light">
              Brush: {{ brushSize }}px
            </span>

            <input
              v-model.number="brushSize"
              type="range"
              min="1"
              max="30"
              class="w-full"
            />
          </label>

          <button
            type="button"
            class="rounded-full border border-nebula/40
                   px-6 py-3 transition
                   hover:bg-starlight/10"
            @click="clearCanvas"
          >
            Clear
          </button>
        </div>

        <canvas
          ref="canvasRef"
          width="1200"
          height="650"
          class="block aspect-[12/6.5] w-full touch-none
                 cursor-crosshair rounded-2xl bg-starlight"
          @pointerdown="startDrawing"
          @pointermove="draw"
          @pointerup="stopDrawing"
          @pointercancel="stopDrawing"
          @pointerleave="stopDrawing"
        />

        <p
          v-if="errorMessage"
          class="mt-4 text-sm text-red-300"
          role="alert"
        >
          {{ errorMessage }}
        </p>

        <div class="mt-5 flex justify-end">
          <button
            type="button"
            class="rounded-full bg-starlight px-7 py-3
                   font-semibold text-deep-space transition
                   hover:bg-nebula-light"
            @click="submitDoodle"
          >
            Submit doodle
          </button>
        </div>
      </div>

      <section class="mt-24">
        <div>
          <p
            class="text-sm uppercase tracking-[0.35em]
                   text-nebula-light"
          >
            Recent messages
          </p>

          <h2 class="mt-4 text-4xl font-bold">
            Doodles left behind
          </h2>
        </div>

        <p
          v-if="doodles.length === 0"
          class="mt-10 text-nebula-light"
        >
          No doodles have been submitted yet.
        </p>

        <div
          v-else
          class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          <article
            v-for="doodle in doodles"
            :key="doodle.id"
            class="overflow-hidden rounded-3xl border
                   border-nebula/20 bg-cosmic/25"
          >
            <img
              :src="doodle.image"
              :alt="`Doodle created by ${doodle.name}`"
              class="aspect-[12/6.5] w-full object-cover"
            />

            <div class="p-5">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <h3 class="font-semibold text-starlight">
                    {{ doodle.name }}
                  </h3>

                  <time
                    :datetime="doodle.createdAt"
                    class="mt-1 block text-sm text-nebula-light"
                  >
                    {{ formatTimestamp(doodle.createdAt) }}
                  </time>
                </div>

                <button
                  type="button"
                  class="text-sm text-nebula-light transition
                         hover:text-starlight"
                  @click="deleteDoodle(doodle.id)"
                >
                  Delete
                </button>
              </div>
            </div>
          </article>
        </div>
      </section>
    </section>
  </main>
</template>