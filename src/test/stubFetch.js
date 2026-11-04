import { vi } from 'vitest';

/** Replaces the global fetch with a stub that resolves to the response, and returns the stub. */
export const stubFetch = (response) => {
	const fetchStub = vi.fn().mockResolvedValue(response);
	vi.stubGlobal('fetch', fetchStub);
	return fetchStub;
};
