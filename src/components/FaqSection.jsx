import {
	storyblokEditable,
	StoryblokServerRichText,
} from '@storyblok/react/rsc';
import './FaqSection.css';

const FaqSection = ({ blok }) => {
	const faqs = (blok.faqs || []).filter(
		(faq) => faq && typeof faq === 'object' && faq.content,
	);

	return (
		<section {...storyblokEditable(blok)} className="faq wp-section">
			<div className="wp-wrap wp-split">
				{blok.headline && <h2 className="wp-section-title">{blok.headline}</h2>}
				<div className="faq__list">
					{faqs.map((faq, index) => (
						<details className="faq__item" key={faq.uuid} open={index === 0}>
							<summary className="faq__question">{faq.content.question}</summary>
							{faq.content.answer && (
								<div className="faq__answer">
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
