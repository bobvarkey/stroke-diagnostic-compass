/** Turns a protocol status or step id into a single sentence-case label. */
export function labelFromId(id: string): string {
  const words = id.replace(/_/g, " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}
