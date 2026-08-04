import type { Timestamp } from 'firebase/firestore'

export type PostStatus = 'draft' | 'published'
export type StatusFilter = 'all' | PostStatus

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage: string
  category: string
  tags: string[]
  status: PostStatus
  readingTime: number
  createdAt: Timestamp | null
  updatedAt: Timestamp | null
  publishedAt: Timestamp | null
}