import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import TextBlock from '@/components/TextBlock';

const paragraphDocument = (text) => ({
	type: 'doc',
	content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
});

describe('TextBlock', () => {
	it('renders the headline and wraps the rich text in prose for both color schemes', () => {
		const html = renderToStaticMarkup(
			<TextBlock
				blok={{
					_uid: 'text-uid',
					component: 'text_block',
					headline: 'Getting there',
					text: paragraphDocument('Fly into Reykjavik.'),
				}}
			/>,
		);
		expect(html).toMatch(/<h2[^>]*>Getting there<\/h2>/);
		const proseWrapper = html.match(
			/<div class="([^"]*)">(?:<div>)*<p>Fly into Reykjavik\.<\/p>/,
		);
		expect(proseWrapper).not.toBeNull();
		const proseClasses = proseWrapper[1].split(' ');
		expect(proseClasses).toContain('prose');
		expect(proseClasses).toContain('dark:prose-invert');
	});

	it('leaves out the headline and body when the editor left them empty', () => {
		const html = renderToStaticMarkup(
			<TextBlock blok={{ _uid: 'text-uid', component: 'text_block' }} />,
		);
		expect(html).not.toContain('<h2');
		expect(html).not.toContain('prose');
	});
});
