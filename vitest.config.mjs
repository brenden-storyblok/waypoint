import { fileURLToPath } from 'node:url';
import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
	resolve: {
		alias: {
			'next/root-params': fileURLToPath(
				new URL('./src/test/rootParams.js', import.meta.url),
			),
			'next/cache': fileURLToPath(
				new URL('./src/test/cache.js', import.meta.url),
			),
			'next/headers': fileURLToPath(
				new URL('./src/test/headers.js', import.meta.url),
			),
			'@': fileURLToPath(new URL('./src', import.meta.url)),
		},
	},
	esbuild: {
		jsx: 'automatic',
	},
	test: {
		environment: 'node',
		exclude: [...configDefaults.exclude, '.claude/**'],
	},
});
