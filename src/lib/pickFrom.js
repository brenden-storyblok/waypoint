/**
 * A reader for an editor-picked option: returns the value when it is one of
 * `allowedValues`, otherwise undefined, so the caller picks its own fallback
 * with `??`.
 */
export const pickFrom = (allowedValues) => (editorValue) =>
	allowedValues.includes(editorValue) ? editorValue : undefined;
