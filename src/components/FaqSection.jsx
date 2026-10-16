import {
	storyblokEditable,
	StoryblokServerRichText,
} from '@storyblok/react/rsc';
import { RICH_TEXT_BASE_CLASSES } from './richTextClasses';

const FaqSection = ({ blok }) => {
	const faqs = (blok.faqs || []).filter(
		(faq) => faq && typeof faq === 'object' && faq.content,
	);

	return (
		<section {...storyblokEditable(blok)} className="py-18">
			<div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-gutter md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-12">
				{blok.headline && (
					<h2 className="font-display text-display leading-[1.05] font-extrabold tracking-[-0.01em] text-balance">
						{blok.headline}
					</h2>
				)}
				<div>
					{faqs.map((faq, index) => (
						<details
							className="group border-t border-mist-200 last:border-b dark:border-deep-sea-700"
							key={faq.uuid}
							open={index === 0}
						>
							<summary className="flex cursor-pointer list-none justify-between gap-4 py-5 font-display text-xl font-semibold [&::-webkit-details-marker]:hidden after:font-mono after:text-lagoon-700 after:content-['+'] group-open:after:rotate-45 motion-safe:after:transition-transform motion-safe:after:duration-200 dark:after:text-lagoon-300">
								{faq.content.question}
							</summary>
							{faq.content.answer && (
								<div
									className={`${RICH_TEXT_BASE_CLASSES} prose-muted max-w-prose pb-5`}
								>
									<StoryblokServerRichText document={faq.content.answer} />
								</div>
							)}
						</details>
					))}
				</div>
			</div>
		</section>
	);
};

export default FaqSection;
