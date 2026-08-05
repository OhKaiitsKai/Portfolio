import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore'
import {
  getDownloadURL,
  ref as storageRef,
  uploadBytes,
} from 'firebase/storage'

import { db, storage } from '../firebase/config'
import type { DoodleSubmission } from '../types/board'

export async function submitDoodle(
  name: string,
  imageBlob: Blob,
): Promise<void> {
  const doodleId = crypto.randomUUID()

  const imageReference = storageRef(
    storage,
    `board/doodles/${doodleId}.webp`,
  )

  await uploadBytes(imageReference, imageBlob, {
    contentType: 'image/webp',
  })

  const imageUrl = await getDownloadURL(
    imageReference,
  )

  await addDoc(collection(db, 'doodles'), {
    name: name.trim(),
    imageUrl,
    storagePath: imageReference.fullPath,
    status: 'pending',
    createdAt: serverTimestamp(),
    reviewedAt: null,
  })
}

export function subscribeToApprovedDoodles(
  callback: (doodles: DoodleSubmission[]) => void,
  onError: (error: Error) => void,
): () => void {
  const doodlesQuery = query(
    collection(db, 'doodles'),
    where('status', '==', 'approved'),
    orderBy('createdAt', 'desc'),
  )

  return onSnapshot(
    doodlesQuery,
    (snapshot) => {
      const doodles = snapshot.docs.map(
        (doodleDocument) => {
          const data = doodleDocument.data()

          return {
            id: doodleDocument.id,
            name: data.name ?? 'Anonymous',
            imageUrl: data.imageUrl ?? '',
            status: data.status,
            createdAt: data.createdAt ?? null,
            reviewedAt: data.reviewedAt ?? null,
          } satisfies DoodleSubmission
        },
      )

      callback(doodles)
    },
    (error) => {
      onError(error)
    },
  )
}