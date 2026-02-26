import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Manages a piece of state with optimistic UI updates and a debounced API commit.
 *
 * - `set(v)`: instantly updates the UI, then commits to the server after `delay` ms.
 *             Rolls back the UI if the commit throws.
 * - `sync(v)`: syncs UI state and committed ref from server data (no API call).
 * - `onSettle`: optional callback always called after each commit attempt (success or failure),
 *               useful for `queryClient.invalidateQueries`.
 */
export function useOptimisticDebounce<T>(
  initialValue: T,
  onCommit: (newValue: T) => Promise<void>,
  onSettle?: () => void,
  delay = 500,
) {
  const [value, setValue] = useState(initialValue);
  const committedRef = useRef(initialValue);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Always call the latest version of onCommit/onSettle without re-creating `set`
  const onCommitRef = useRef(onCommit);
  const onSettleRef = useRef(onSettle);
  useEffect(() => { onCommitRef.current = onCommit; });
  useEffect(() => { onSettleRef.current = onSettle; });

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const set = useCallback((newValue: T) => {
    setValue(newValue);
    if (timerRef.current) clearTimeout(timerRef.current);
    const prev = committedRef.current;
    timerRef.current = setTimeout(async () => {
      if (Object.is(newValue, committedRef.current)) {
        timerRef.current = null;
        return;
      }
      committedRef.current = newValue;
      try {
        await onCommitRef.current(newValue);
      } catch {
        setValue(prev);
        committedRef.current = prev;
      } finally {
        timerRef.current = null;
        onSettleRef.current?.();
      }
    }, delay);
  }, [delay]);

  const sync = useCallback((serverValue: T) => {
    // Skip if a user action is pending — optimistic state is more current than server data
    if (timerRef.current !== null) return;
    setValue(serverValue);
    committedRef.current = serverValue;
  }, []);

  return { value, set, sync };
}
