/** In-memory map that drops its oldest entry beyond `max` entries. */
export const boundedCache = <T>(max: number) => {
  const entries = new Map<string, T>()
  return {
    get: (key: string) => entries.get(key),
    set: (key: string, value: T) => {
      entries.delete(key)
      if (entries.size >= max) entries.delete(entries.keys().next().value!)
      entries.set(key, value)
    },
  }
}
