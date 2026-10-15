'use client';

import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { parseChoices, serialiseChoices } from '@/lib/destinationSearch';

/**
 * The visitor's search choices, kept in the URL.
 *
 * Returns [choices, setChoices]. `choices` comes from the current URL through
 * the destination search module, so the URL is the only source of truth.
 * `setChoices(next)` writes the full `next` choices to the URL, replacing the
 * history entry and keeping every other param and the hash. Next syncs
 * replaceState into useSearchParams, so `choices` updates without a server
 * round-trip.
 *
 * Calls useSearchParams: render the caller inside <Suspense>.
 */
export function useSearchChoices() {
	const params = useSearchParams();
	const choices = useMemo(() => parseChoices(params), [params]);

	const setChoices = useCallback((next) => {
		const { pathname, search, hash } = window.location;
		const qs = serialiseChoices(next, search);
		window.history.replaceState(null, '', `${pathname}${qs ? `?${qs}` : ''}${hash}`);
	}, []);

	return [choices, setChoices];
}
