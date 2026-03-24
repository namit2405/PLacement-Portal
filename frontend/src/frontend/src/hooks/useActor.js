/**
 * Compatibility shim — actor pattern replaced by direct REST calls.
 */
export function useActor() {
  return { actor, isFetching: false };
}
