import manifest from '@/data/media.manifest.json';

export type PhotoSlot = {
  id: string;
  subject: string;
  alt: string;
  ratio: string;
  tone: string;
  file: string | null;
  remote: string;
};

const slots = new Map<string, PhotoSlot>(
  (manifest.photos as PhotoSlot[]).map((p) => [p.id, p])
);

export const allPhotoSlots = manifest.photos as PhotoSlot[];

export function getPhoto(id: string): PhotoSlot {
  const slot = slots.get(id);
  if (!slot) {
    throw new Error(
      `Unknown photo slot "${id}". Add it to src/data/media.manifest.json.`
    );
  }
  return slot;
}

/**
 * Resolution order: a real photo dropped into /public/photos, then a hosted
 * URL, then the generated art-directed plate.
 */
export function photoSrc(id: string): string {
  const slot = getPhoto(id);
  if (slot.file) return `/photos/${slot.file}`;
  if (slot.remote) return slot.remote;
  return `/photos/plate-${slot.id}.svg`;
}

export function isPlaceholder(id: string): boolean {
  const slot = getPhoto(id);
  return !slot.file && !slot.remote;
}
