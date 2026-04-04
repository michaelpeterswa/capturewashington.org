import { EntryStatus, MediaType, UserRole } from "@prisma/client";
export { EntryStatus, MediaType, UserRole };

export interface EntryListItem {
  id: string;
  title: string;
  slug: string;
  locationName: string;
  lat: number;
  lng: number;
  capturedAt: string;
  thumbnailUrl: string | null;
  tags: TagItem[];
}

export interface EntryDetail extends EntryListItem {
  body: string;
  bodyHtml: string;
  status: EntryStatus;
  createdAt: string;
  updatedAt: string;
  media: MediaItem[];
}

export interface MediaItem {
  id: string;
  url: string;
  type: MediaType;
  mimeType: string;
  sortOrder: number;
}

export interface TagItem {
  id: string;
  name: string;
}

export interface UserItem {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  entries: T[];
  nextCursor: string | null;
}

export interface SearchResponse extends PaginatedResponse<EntryListItem> {
  totalCount: number;
}

export const ACCEPTED_PHOTO_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

export const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/webm"] as const;

export const ACCEPTED_MEDIA_TYPES = [
  ...ACCEPTED_PHOTO_TYPES,
  ...ACCEPTED_VIDEO_TYPES,
] as const;

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
export const MAX_FILES_PER_ENTRY = 20;
