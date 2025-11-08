// app/types/snb_event.ts

export type MediaType = "image" | "video" | "audio" | "document";

export interface EventMedia {
  id: number;
  type: MediaType;
  mime: string;
  blobName: string;
  sasUrl: string;
  posterSasUrl?: string | null;
  variants: Record<string, string>;
  sortOrder: number;
  width?: number | null;
  height?: number | null;
  durationSecs?: number | null;
  sizeBytes?: number | null;
  createdAt: string;
}

export interface SnBEvent {
  id: number;
  title: string;
  description?: string | null;
  location?: string | null;
  start_time: string;
  end_time?: string | null;
  max_participants?: number | null;
  creator_id?: string | null;
  host_id?: string | null;
  is_online?: boolean;
  media?: EventMedia[];           // Optional, nur wenn include_media=true
  participant_count?: number;     // Optional, nur wenn include_participants=true
  available_spots?: number | null; // Optional, nur wenn include_participants=true (null = unlimited)
}

// Helper-Funktion, um das erste Bild eines Events zu bekommen
export function getEventThumbnail(event: SnBEvent): string | null {
  if (!event.media || event.media.length === 0) {
    return null;
  }
  
  // Erstes Bild finden
  const firstImage = event.media
    .filter(m => m.type === "image")
    .sort((a, b) => a.sortOrder - b.sortOrder)[0];
  
  return firstImage?.sasUrl || null;
}

// Helper-Funktion, um alle Bilder eines Events zu bekommen
export function getEventImages(event: SnBEvent): EventMedia[] {
  if (!event.media) {
    return [];
  }
  
  return event.media
    .filter(m => m.type === "image")
    .sort((a, b) => a.sortOrder - b.sortOrder);
}