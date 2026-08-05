<script setup lang="ts">
import {
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
} from 'vue'
import { LoaderCircle } from 'lucide-vue-next'

import BoardTools from '../components/board/BoardTools.vue'
import {
  submitDoodle as uploadDoodle,
  subscribeToApprovedDoodles,
} from '../services/board'
import type { DoodleSubmission } from '../types/board'

type DrawingTool = 'pencil' | 'eraser'

const DEFAULT_BACKGROUND = '#C7DCED'

const canvasRef = ref<HTMLCanvasElement | null>(null)

const name = ref('')
const color = ref('#062B43')
const brushSize = ref(5)
const activeTool = ref<DrawingTool>('pencil')
const canvasBackground = ref(DEFAULT_BACKGROUND)

const isDrawing = ref(false)
const hasDrawing = ref(false)
const isSubmitting = ref(false)
const isLoadingDoodles = ref(true)

const errorMessage = ref('')
const successMessage = ref('')

const doodles = ref<DoodleSubmission[]>([])

let context: CanvasRenderingContext2D | null = null
let unsubscribeDoodles: (() => void) | null = null

function prepareCanvas(): void {
  const canvas = canvasRef.value

  if (!canvas) return

  context = canvas.getContext('2d')

  if (!context) return

  context.lineCap = 'round'
  context.lineJoin = 'round'

  clearCanvas()
}

function getPointerPosition(
  event: PointerEvent,
): {
  x: number
  y: number
} {
  const canvas = canvasRef.value

  if (!canvas) {
    return {
      x: 0,
      y: 0,
    }
  }

  const bounds = canvas.getBoundingClientRect()

  return {
    x:
      (event.clientX - bounds.left) *
      (canvas.width / bounds.width),

    y:
      (event.clientY - bounds.top) *
      (canvas.height / bounds.height),
  }
}

function configureDrawingContext(): void {
  if (!context) return

  context.strokeStyle =
    activeTool.value === 'eraser'
      ? canvasBackground.value
      : color.value

  context.lineWidth =
    activeTool.value === 'eraser'
      ? brushSize.value * 2
      : brushSize.value
}

function startDrawing(
  event: PointerEvent,
): void {
  const canvas = canvasRef.value

  if (!context || !canvas) return

  isDrawing.value = true
  hasDrawing.value = true

  errorMessage.value = ''
  successMessage.value = ''

  canvas.setPointerCapture(event.pointerId)

  const { x, y } = getPointerPosition(event)

  configureDrawingContext()

  context.beginPath()
  context.moveTo(x, y)

  context.lineTo(x + 0.01, y + 0.01)
  context.stroke()
}

function draw(
  event: PointerEvent,
): void {
  if (!isDrawing.value || !context) return

  const { x, y } = getPointerPosition(event)

  configureDrawingContext()

  context.lineTo(x, y)
  context.stroke()
}

function stopDrawing(
  event?: PointerEvent,
): void {
  if (!isDrawing.value) return

  isDrawing.value = false
  context?.closePath()

  const canvas = canvasRef.value

  if (
    event &&
    canvas?.hasPointerCapture(event.pointerId)
  ) {
    canvas.releasePointerCapture(event.pointerId)
  }
}

function paintCanvas(
  backgroundColor: string,
): void {
  const canvas = canvasRef.value

  if (!canvas || !context) return

  context.fillStyle = backgroundColor

  context.fillRect(
    0,
    0,
    canvas.width,
    canvas.height,
  )
}

function fillCanvas(): void {
  canvasBackground.value = color.value

  paintCanvas(canvasBackground.value)

  hasDrawing.value = true
  activeTool.value = 'pencil'

  errorMessage.value = ''
  successMessage.value = ''
}

function clearCanvas(): void {
  const canvas = canvasRef.value

  if (!canvas || !context) return

  context.clearRect(
    0,
    0,
    canvas.width,
    canvas.height,
  )

  canvasBackground.value = DEFAULT_BACKGROUND

  paintCanvas(canvasBackground.value)

  hasDrawing.value = false
  isDrawing.value = false
  activeTool.value = 'pencil'

  errorMessage.value = ''
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
          return
        }

        reject(
          new Error(
            'The canvas could not be converted into an image.',
          ),
        )
      },
      'image/webp',
      0.85,
    )
  })
}

async function submitDoodle(): Promise<void> {
  const canvas = canvasRef.value
  const trimmedName = name.value.trim()

  errorMessage.value = ''
  successMessage.value = ''

  if (!trimmedName) {
    errorMessage.value =
      'Please enter your name.'
    return
  }

  if (!hasDrawing.value) {
    errorMessage.value =
      'Please draw something before submitting.'
    return
  }

  if (!canvas) {
    errorMessage.value =
      'The canvas is not available.'
    return
  }

  isSubmitting.value = true

  try {
    const imageBlob = await canvasToBlob(canvas)

    await uploadDoodle(
      trimmedName,
      imageBlob,
    )

    name.value = ''
    clearCanvas()

    successMessage.value =
      'Your doodle was submitted and is waiting for approval.'
  } catch (error: unknown) {
    console.error(
      'Unable to submit doodle:',
      error,
    )

    errorMessage.value =
      'Your doodle could not be submitted. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}

function formatTimestamp(
  timestamp: DoodleSubmission['createdAt'],
): string {
  if (!timestamp) {
    return 'Recently approved'
  }

  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(timestamp.toDate())
}

onMounted(async () => {
  await nextTick()
  prepareCanvas()

  unsubscribeDoodles =
    subscribeToApprovedDoodles(
      (approvedDoodles) => {
        doodles.value = approvedDoodles
        isLoadingDoodles.value = false
      },
      (error) => {
        console.error(
          'Unable to load approved doodles:',
          error,
        )

        errorMessage.value =
          'The approved doodles could not be loaded.'

        isLoadingDoodles.value = false
      },
    )
})

onBeforeUnmount(() => {
  unsubscribeDoodles?.()
})
</script>

<template>
  <main
    class="min-h-screen px-6
           pb-24 pt-32 text-starlight"
  >
    <section class="mx-auto max-w-7xl">
      <!-- Heading -->
      <header class="max-w-3xl">
        <p
          class="text-sm uppercase
                 tracking-[0.35em]
                 text-nebula-light"
        >
          Creative space
        </p>

        <h1
          class="mt-4 text-5xl font-bold
                 md:text-6xl"
        >
          Board
        </h1>

        <p
          class="mt-5 text-lg leading-8
                 text-nebula-light"
        >
          Leave a small doodle in my universe.
        </p>

        <p
          class="mt-4 max-w-2xl text-sm
                 leading-7 text-nebula-light/80"
        >
          Every submission is reviewed before it appears
          publicly on the board.
        </p>
      </header>

      <!-- Drawing area -->
      <section
        class="mt-12 rounded-3xl border
               border-nebula/30
               bg-cosmic/30 p-5
               backdrop-blur-md"
      >
        <label class="block">
          <span
            class="mb-2 block text-sm
                   text-nebula-light"
          >
            Name
          </span>

          <input
            v-model="name"
            type="text"
            maxlength="40"
            required
            autocomplete="name"
            placeholder="Write your name"
            class="w-full rounded-xl border
                   border-nebula/30
                   bg-deep-space/60
                   px-4 py-3 text-starlight
                   outline-none transition
                   placeholder:text-nebula-light/50
                   focus:border-nebula-light"
            :disabled="isSubmitting"
          />
        </label>

        <div class="mt-5">
          <BoardTools
            v-model:color="color"
            v-model:brush-size="brushSize"
            v-model:active-tool="activeTool"
            @fill="fillCanvas"
            @clear="clearCanvas"
          />
        </div>

        <canvas
          ref="canvasRef"
          width="1200"
          height="650"
          class="mt-5 block
                 aspect-[12/6.5] w-full
                 touch-none cursor-crosshair
                 rounded-2xl"
          :style="{
            backgroundColor: canvasBackground,
          }"
          @pointerdown="startDrawing"
          @pointermove="draw"
          @pointerup="stopDrawing"
          @pointercancel="stopDrawing"
          @pointerleave="stopDrawing"
        />

        <p
          v-if="errorMessage"
          class="mt-4 rounded-xl
                 border border-red-300/30
                 bg-red-300/10
                 px-4 py-3 text-sm
                 text-red-200"
          role="alert"
        >
          {{ errorMessage }}
        </p>

        <p
          v-if="successMessage"
          class="mt-4 rounded-xl
                 border border-nebula-light/30
                 bg-nebula-light/10
                 px-4 py-3 text-sm
                 text-starlight"
          role="status"
        >
          {{ successMessage }}
        </p>

        <div class="mt-5 flex justify-end">
          <button
            type="button"
            class="inline-flex items-center
                   justify-center gap-3
                   rounded-full bg-starlight
                   px-7 py-3 font-semibold
                   text-deep-space transition
                   hover:bg-nebula-light
                   disabled:cursor-not-allowed
                   disabled:opacity-50"
            :disabled="isSubmitting"
            @click="submitDoodle"
          >
            <LoaderCircle
              v-if="isSubmitting"
              :size="19"
              class="animate-spin"
              aria-hidden="true"
            />

            {{
              isSubmitting
                ? 'Submitting...'
                : 'Submit doodle'
            }}
          </button>
        </div>
      </section>

      <!-- Approved doodles -->
      <section class="mt-24">
        <div>
          <p
            class="text-sm uppercase
                   tracking-[0.35em]
                   text-nebula-light"
          >
            Approved signals
          </p>

          <h2
            class="mt-4 text-4xl font-bold"
          >
            Doodles left behind
          </h2>

          <p
            class="mt-4 max-w-2xl
                   leading-7 text-nebula-light"
          >
            These drawings were reviewed and approved
            before joining the public board.
          </p>
        </div>

        <div
          v-if="isLoadingDoodles"
          class="flex min-h-72 items-center
                 justify-center"
        >
          <div
            class="flex items-center gap-3
                   text-nebula-light"
          >
            <LoaderCircle
              :size="24"
              class="animate-spin"
              aria-hidden="true"
            />

            Loading doodles...
          </div>
        </div>

        <p
          v-else-if="doodles.length === 0"
          class="mt-10 text-nebula-light"
        >
          No approved doodles have been published yet.
        </p>

        <div
          v-else
          class="mt-10 grid gap-6
                 sm:grid-cols-2
                 lg:grid-cols-3"
        >
          <article
            v-for="doodle in doodles"
            :key="doodle.id"
            class="overflow-hidden rounded-3xl
                   border border-nebula/20
                   bg-cosmic/25"
          >
            <img
              :src="doodle.imageUrl"
              :alt="`Doodle created by ${doodle.name}`"
              class="aspect-[12/6.5]
                     w-full object-cover"
            />

            <div class="p-5">
              <h3
                class="font-semibold
                       text-starlight"
              >
                {{ doodle.name }}
              </h3>

              <time
                :datetime="
                  doodle.createdAt
                    ?.toDate()
                    .toISOString()
                "
                class="mt-1 block text-sm
                       text-nebula-light"
              >
                {{
                  formatTimestamp(
                    doodle.createdAt,
                  )
                }}
              </time>
            </div>
          </article>
        </div>
      </section>
    </section>
  </main>
</template>