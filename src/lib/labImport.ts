/**
 * Small hand-off for imported lab values.
 *
 * The import panel and the labs module are separate subtrees of the workup page, and the labs
 * module may mount after the user clicks "Populate form" (it lives inside a lazy section). The
 * latest payload is therefore retained until a subscriber consumes it.
 */

export interface ImportedLab {
  name: string;
  value: string;
  unit?: string;
  reference_range?: string;
  flag?: string;
}

type Subscriber = (labs: ImportedLab[]) => void;

let pending: ImportedLab[] | null = null;
const subscribers = new Set<Subscriber>();

export function publishImportedLabs(labs: ImportedLab[]): void {
  if (!labs.length) return;
  pending = labs;
  subscribers.forEach((subscriber) => subscriber(labs));
}

export function subscribeImportedLabs(subscriber: Subscriber): () => void {
  subscribers.add(subscriber);
  return () => {
    subscribers.delete(subscriber);
  };
}

/** Returns the retained payload once, so a late-mounting module still receives it. */
export function consumeImportedLabs(): ImportedLab[] | null {
  const labs = pending;
  pending = null;
  return labs;
}
