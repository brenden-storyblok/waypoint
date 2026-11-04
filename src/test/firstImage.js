/** Returns the first `<img>` tag in rendered markup so tests can assert on its attributes. */
export const firstImage = (html) => /<img [^>]*>/.exec(html)[0];
