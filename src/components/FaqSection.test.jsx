import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import FaqSection from '@/components/FaqSection';

const faqStory = (uuid, question) => ({
	uuid,
	content: {
		question,
		answer: {
			type: 'doc',
			content: [
				{
					type: 'paragraph',
					content: [{ type: 'text', text: `${question} answer` }],
				},
			],
		},
	},
});

const renderFaqs = (faqs) =>
	renderToStaticMarkup(
		<FaqSection
			blok={{
				_uid: 'faq-uid',
				component: 'faq_section',
				headline: 'FAQ',
				faqs,
			}}
		/>,
	);

const classTokens = (html) =>
	[...html.matchAll(/class="([^"]*)"/g)].flatMap((classMatch) =>
		classMatch[1].split(' '),
	);

describe('FaqSection', () => {
	it('opens only the first question', () => {
		const html = renderFaqs([
			faqStory('one', 'When'),
			faqStory('two', 'Where'),
		]);
		const detailsTags = html.match(/<details[^>]*>/g);
		expect(detailsTags).toHaveLength(2);
		expect(detailsTags[0]).toMatch(/\sopen(=""|\s|>)/);
		expect(detailsTags[1]).not.toMatch(/\sopen(=""|\s|>)/);
	});

	it('skips FAQ references that did not resolve to a story', () => {
		const html = renderFaqs(['unresolved-uuid', faqStory('two', 'Where')]);
		expect(html.match(/<details/g)).toHaveLength(1);
		expect(html).toContain('Where answer');
	});

	it('animates the open marker only when the visitor allows motion', () => {
		const tokens = classTokens(renderFaqs([faqStory('one', 'When')]));
		const transitionTokens = tokens.filter((token) =>
			/(^|:)transition(-|$)/.test(token),
		);
		expect(transitionTokens.length).toBeGreaterThan(0);
		for (const token of transitionTokens) {
			expect(token).toMatch(/(^|:)motion-safe:/);
		}
	});
});
