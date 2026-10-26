// The page defaults src/app/layout.js sets on <html> and <body>: background,
// serif body copy at text-lg, ink colour, both colour schemes. Storybook wraps
// every story in it, and Claude Design wraps every design in it.
const SiteRoot = ({ children }) => (
	<div className="scheme-light-dark bg-mist-50 font-serif text-lg leading-relaxed text-pretty text-deep-sea-900 antialiased dark:bg-deep-sea-950 dark:text-frost-200">
		{children}
	</div>
);

export default SiteRoot;
