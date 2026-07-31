/**
 * Strip undefined keys from an object before sending to MongoDB.
 * Prevents accidental $unset of fields on update.
 */
export const sanitizeUpdate = <T extends object>(obj: T): Partial<T> => {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== '')
  ) as Partial<T>;
};
