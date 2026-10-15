import { storyblokEditable } from '@storyblok/react/rsc';
import './UspItem.css';

const UspItem = ({ blok }) => (
	<div {...storyblokEditable(blok)} className="usp-item">
		<h3 className="usp-item__title">{blok.title}</h3>
		{blok.text && <p className="usp-item__text">{blok.text}</p>}
	</div>
);

export default UspItem;
