'use client';

import { Children, useEffect, useId, useRef, useState } from 'react';

// The row starts scrolled to its beginning. Until the browser measures an
// overflow, the arrows stay hidden: without JavaScript they do nothing, and
// every card may fit.
const INITIAL_POSITION = { overflows: false, atStart: true, atEnd: false };

// Allows for sub-pixel scroll offsets when deciding whether a row is at an end.
const EDGE_TOLERANCE = 1;

const ARROW_CLASS =
	'grid size-10 cursor-pointer place-items-center rounded-full border border-mist-200 bg-white text-deep-sea-900 hover:border-deep-sea-900 aria-disabled:cursor-default aria-disabled:opacity-40 aria-disabled:hover:border-mist-200 dark:border-deep-sea-700 dark:bg-deep-sea-800 dark:text-frost-200 dark:hover:border-frost-200 dark:aria-disabled:hover:border-deep-sea-700';

// Where the list sits within its scroll range.
const measurePosition = (list) => {
	const { scrollLeft, scrollWidth, clientWidth } = list;
	return {
		overflows: scrollWidth > clientWidth + EDGE_TOLERANCE,
		atStart: scrollLeft <= EDGE_TOLERANCE,
		atEnd: scrollLeft + clientWidth >= scrollWidth - EDGE_TOLERANCE,
	};
};

// The distance one arrow click moves: every card fully in view, measured as
// card width plus gap from one card's start edge to the next. Scroll-snap
// then settles the row on the nearest card start.
const stepDistance = (list) => {
	// clientWidth includes the padding that keeps focus rings inside the row.
	const { paddingLeft, paddingRight } = window.getComputedStyle(list);
	const viewWidth =
		list.clientWidth - parseFloat(paddingLeft) - parseFloat(paddingRight);
	const [firstCard, secondCard] = list.children;
	if (!firstCard) return viewWidth;
	const stride = secondCard
		? secondCard.offsetLeft - firstCard.offsetLeft
		: firstCard.offsetWidth;
	const gap = stride - firstCard.offsetWidth;
	const wholeCards = Math.floor((viewWidth + gap) / stride);
	return Math.max(wholeCards, 1) * stride;
};

const Arrow = ({ direction }) => (
	<svg
		aria-hidden="true"
		viewBox="0 0 20 20"
		className="size-5"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path d={direction === 'previous' ? 'M12 4l-6 6 6 6' : 'M8 4l6 6-6 6'} />
	</svg>
);

/**
 * A Pool's Destinations as a Carousel: the headline and Destination count above
 * one row of cards that visitors swipe through. The row is a native
 * overflow scroller with CSS scroll-snap, so it scrolls without JavaScript
 * and Tab scrolls each focused card into view. Previous and Next buttons
 * step a full view of whole cards at a time and hide when every card fits.
 *
 * Props:
 *   headline     the grid headline; the region is named "Destinations"
 *                without one
 *   placesLabel  the Destination count, e.g. "6 places"; left out for an
 *                empty Pool
 *   children     one rendered DestinationCard per Destination, in Pool order
 */
const DestinationCarousel = ({ headline, placesLabel, children }) => {
	const headlineId = useId();
	const listId = useId();
	const listRef = useRef(null);
	const [position, setPosition] = useState(INITIAL_POSITION);
	const labelProps = headline
		? { 'aria-labelledby': headlineId }
		: { 'aria-label': 'Destinations' };

	const cardCount = Children.count(children);

	// Measures again when the row resizes, when a card resizes, and when
	// cards are added or removed, e.g. live in the Visual Editor.
	useEffect(() => {
		const list = listRef.current;
		const updatePosition = () => setPosition(measurePosition(list));
		// The observer also reports once on start, which takes the first measure.
		const resizeObserver = new ResizeObserver(updatePosition);
		resizeObserver.observe(list);
		for (const item of list.children) resizeObserver.observe(item);
		list.addEventListener('scroll', updatePosition, { passive: true });
		return () => {
			resizeObserver.disconnect();
			list.removeEventListener('scroll', updatePosition);
		};
	}, [cardCount]);

	const showPrevious = () => {
		if (!position.atStart) step(-1);
	};
	const showNext = () => {
		if (!position.atEnd) step(1);
	};

	const step = (direction) => {
		const list = listRef.current;
		const reducedMotion = window.matchMedia(
			'(prefers-reduced-motion: reduce)',
		).matches;
		list.scrollBy({
			left: direction * stepDistance(list),
			behavior: reducedMotion ? 'instant' : 'smooth',
		});
	};

	return (
		<section aria-roledescription="carousel" {...labelProps}>
			<div className="mb-8 flex flex-wrap items-end justify-between gap-4">
				{headline && (
					<h2
						id={headlineId}
						className="font-display text-display leading-[1.05] font-extrabold tracking-[-0.01em] text-balance"
					>
						{headline}
					</h2>
				)}
				{/* The Carousel controls: the Destination count and the arrows. */}
				<div className="flex items-center gap-4">
					{placesLabel && (
						<span className="font-mono text-xs text-slate-500 dark:text-slate-300">
							{placesLabel}
						</span>
					)}
					<div className="flex gap-2" hidden={!position.overflows}>
						<button
							type="button"
							aria-label="Previous destinations"
							aria-controls={listId}
							aria-disabled={position.atStart}
							className={ARROW_CLASS}
							onClick={showPrevious}
						>
							<Arrow direction="previous" />
						</button>
						<button
							type="button"
							aria-label="Next destinations"
							aria-controls={listId}
							aria-disabled={position.atEnd}
							className={ARROW_CLASS}
							onClick={showNext}
						>
							<Arrow direction="next" />
						</button>
					</div>
				</div>
			</div>
			{/* The padding keeps each card's focus ring inside the scroller. */}
			<ul
				ref={listRef}
				id={listId}
				role="list"
				className="-m-2 flex snap-x snap-mandatory scroll-px-2 gap-6 overflow-x-auto overscroll-x-contain p-2 pb-4 [scrollbar-color:var(--color-slate-300)_transparent] dark:[scrollbar-color:var(--color-slate-500)_transparent]"
			>
				{Children.toArray(children).map((card) => (
					<li
						key={card.key}
						className="shrink-0 grow-0 basis-[calc((100%_-_1.5rem)/1.2)] snap-start sm:basis-[calc((100%_-_3rem)/2.2)] md:basis-[calc((100%_-_4.5rem)/3.2)]"
					>
						{card}
					</li>
				))}
			</ul>
		</section>
	);
};

export default DestinationCarousel;
