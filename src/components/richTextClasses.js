// Rich text renders with `prose` (ADR 0001). Its headings match component
// headings: display font, the same leading and tracking, balanced wrapping.
export const RICH_TEXT_BASE_CLASSES =
	'prose dark:prose-invert prose-headings:font-display prose-headings:leading-[1.05] prose-headings:tracking-[-0.01em] prose-headings:text-balance';

/** A body of rich text, e.g. a Text block or a Destination's bio. */
export const RICH_TEXT_CLASSES = `${RICH_TEXT_BASE_CLASSES} max-w-[64ch] text-lg`;
