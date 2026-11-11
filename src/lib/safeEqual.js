import { timingSafeEqual } from 'node:crypto';

/** Whether two strings are equal, compared in constant time when their lengths match. */
export function safeEqual(actual, expected) {
	const actualBytes = Buffer.from(actual);
	const expectedBytes = Buffer.from(expected);
	return (
		actualBytes.length === expectedBytes.length &&
		timingSafeEqual(actualBytes, expectedBytes)
	);
}
