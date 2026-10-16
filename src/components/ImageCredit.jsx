import { imageCredit } from '@/lib/images';

const ImageCredit = ({ asset }) => {
	const credit = imageCredit(asset);
	if (!credit) return null;
	return (
		<small className="pointer-events-none absolute right-2 bottom-2 z-1 max-w-[calc(100%-1rem)] truncate rounded-sm bg-shade-70 px-1.5 py-0.5 font-mono text-xs text-white">
			© {credit}
		</small>
	);
};

export default ImageCredit;
