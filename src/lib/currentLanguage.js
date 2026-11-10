import { lang } from 'next/root-params';

/**
 * The Language of the page being rendered, from the [lang] root segment.
 * Server Components and server utilities only: the import fails the build
 * inside a Client Component.
 */
export const getCurrentLanguage = () => lang();
