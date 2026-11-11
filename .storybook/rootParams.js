/**
 * Stand-in for next/root-params in Storybook. A story picks the current
 * Language by setting `globalThis.storybookLanguage` in `beforeEach`.
 */
export const lang = async () => globalThis.storybookLanguage ?? 'en';
