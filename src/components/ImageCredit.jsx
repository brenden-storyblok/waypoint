import { imageCredit } from '@/lib/images';
import './ImageCredit.css';

const ImageCredit = ({ asset }) => {
	const credit = imageCredit(asset);
	if (!credit) return null;
	return <small className="image-credit">© {credit}</small>;
};

export default ImageCredit;
