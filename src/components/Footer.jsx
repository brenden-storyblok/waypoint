import Link from 'next/link';
import {
	storyblokEditable,
	StoryblokServerComponent,
} from '@storyblok/react/rsc';

const Footer = ({ blok }) => (
	<footer
		{...storyblokEditable(blok)}
		className="bg-deep-sea-900 pt-14 pb-7 text-frost-100 dark:bg-frost-200 dark:text-deep-sea-950"
	>
		<div className="mx-auto max-w-7xl px-gutter">
			<div className="grid grid-cols-2 gap-8 md:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]">
				<Link
					className="self-start justify-self-start font-display text-xl font-extrabold tracking-tight no-underline"
					href="/"
				>
					way<span className="text-sun-400 dark:text-sun-300">point</span>
				</Link>
				{(blok.columns || []).map((column) => (
					<StoryblokServerComponent blok={column} key={column._uid} />
				))}
			</div>
			{blok.legal_text && (
				<p className="mt-12 border-t border-frost-100/20 pt-5 font-mono text-xs opacity-70 dark:border-deep-sea-950/20">
					{blok.legal_text}
				</p>
			)}
		</div>
	</footer>
);

export default Footer;
