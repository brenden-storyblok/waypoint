/** Stand-in for next/headers, which only works inside a Next request: no Draft Mode. */
export const draftMode = async () => ({ isEnabled: false });
