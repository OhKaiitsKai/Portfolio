import type { Timestamp } from 'firebase/firestore'

export type DoodleStatus =
  | 'pending'
  | 'approved'
  | 'rejected'

export interface DoodleSubmission {
  id: string
  name: string
  imageUrl: string
  status: DoodleStatus
  createdAt: Timestamp | null
  reviewedAt: Timestamp | null
}