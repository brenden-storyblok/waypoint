'use client';

import { Suspense, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { switcherTargets } from '@/lib/language';

/**
 * The options as a disclosure: the summary shows the current code on narrow
 * screens and the current Language's name from md up; the list holds one link
 * per Language.
 */
function SwitcherView({ language, label, pathname, search }) {
	const targets = switcherTargets({ language, pathname, search });
	const current = targets.find((target) => target.current);
	const detailsRef = useRef(null);
	const summaryRef = useRef(null);

	// Close on a click outside the disclosure, and on Escape (focus returns to
	// the summary so keyboard users keep their place).
	useEffect(() => {
		const closeOnOutsideClick = (event) => {
			const details = detailsRef.current;
			if (details?.open && !details.contains(event.target))
				details.open = false;
		};
		const closeOnEscape = (event) => {
			const details = detailsRef.current;
			if (event.key !== 'Escape' || !details?.open) return;
			details.open = false;
			summaryRef.current?.focus();
		};
		document.addEventListener('click', closeOnOutsideClick);
		document.addEventListener('keydown', closeOnEscape);
		return () => {
			document.removeEventListener('click', closeOnOutsideClick);
			document.removeEventListener('keydown', closeOnEscape);
		};
	}, []);

	return (
		<nav aria-label={label} className="relative font-display text-sm">
			<details className="group" ref={detailsRef}>
				<summary
					ref={summaryRef}
					className="flex cursor-pointer list-none items-center gap-1 rounded-sm px-2 py-1 text-slate-500 marker:content-none hover:text-deep-sea-900 dark:text-slate-300 dark:hover:text-frost-200 [&::-webkit-details-marker]:hidden"
				>
					<span className="md:hidden">{language.toUpperCase()}</span>
					<span className="hidden md:inline">{current?.label}</span>
				</summary>
				<ul className="absolute end-0 z-10 mt-1 min-w-36 rounded-md border border-mist-200 bg-mist-50 py-1 shadow-md dark:border-deep-sea-700 dark:bg-deep-sea-950">
					{targets.map((target) => (
						<li key={target.code}>
							<Link
								href={target.href}
								lang={target.code}
								hrefLang={target.code}
								aria-current={target.current ? 'page' : undefined}
								className="block px-3 py-1.5 no-underline hover:bg-mist-100 aria-[current=page]:font-semibold dark:hover:bg-deep-sea-800"
							>
								{target.label}
							</Link>
						</li>
					))}
				</ul>
			</details>
		</nav>
	);
}

function SwitcherWithLocation({ language, label }) {
	const pathname = usePathname() ?? '/';
	const search = useSearchParams()?.toString() ?? '';
	return (
		<SwitcherView
			language={language}
			label={label}
			pathname={pathname}
			search={search}
		/>
	);
}

/**
 * Client Component: the target hrefs depend on the visitor's path and query,
 * which only the router knows. `language` and `label` (the accessible name,
 * a UI Label) come from the server Header.
 *
 * With Cache Components, a page the build did not prerender learns its path
 * at request time, so both hooks wait inside <Suspense>. The fallback in the
 * App Shell links each Language's home page until the real path streams in.
 */
export default function LanguageSwitcher({ language, label }) {
	return (
		<Suspense
			fallback={<SwitcherView language={language} label={label} pathname="/" />}
		>
			<SwitcherWithLocation language={language} label={label} />
		</Suspense>
	);
}
