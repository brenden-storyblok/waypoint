export const imageBytes = Buffer.from('tiny');

/** Returns a fetch Response that holds a tiny image body with the given content type. */
export const imageResponse = (contentType = 'image/jpeg') =>
	new Response(imageBytes, { headers: { 'content-type': contentType } });
