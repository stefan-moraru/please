import React from 'react';
import _ from '../services/_.js';
import _get from 'lodash.get';
import Input from './Input';

const OptionButton = ({ text, href, image, onClick  }) => {
	let rendered = null;
  let optionContent = text;
	let imageStyle = null;
	let imageStyleSpan = null;

	if (image) {
		imageStyle = {
			backgroundImage: `url(${image})`,
			backgroundSize: 'cover',
			width: '200px',
			height: '200px',
			position: 'relative'
		};

		imageStyleSpan = {
			backgroundColor: 'rgba(0, 0, 0, 0.8)',
	    display: 'block',
	    position: 'absolute',
	    bottom: '10px',
	    padding: '10px',
	    borderRadius: '5px',
			maxWidth: '80%',
			wordWrap: 'break-word'
		};
	}

  rendered = (
    <button className="btn" onClick={onClick} style={imageStyle}>
      <span style={imageStyleSpan}>{_.removeHTMLEntities(optionContent)}</span>
    </button>
  );

  if (href) {
    if (href.indexOf('http') === -1) {
      href = `http://${href}`;
    }

    rendered = (
      <a target="_blank" href={href}>
        {rendered}
      </a>
    );
  }

	return rendered;
};

const OptionIcon = ({ icon, text, onClick }) => (
  <div className="component-Input__cancel" onClick={onClick}>
    {text} <i className={icon} />
  </div>
);

const OptionInput = ({ label, placeholder, onInputSubmit }) => (
  <Input label={label} placeholder={placeholder} onInputSubmit={onInputSubmit} imagePattern="{name}" />
);

const OptionVideo = ({ id }) => {
	const iframeProps = {
		width: '200px',
		height: '200px',
		frameborder: '0',
		src: `https://www.youtube.com/embed/${id}`
	};

	return <iframe {...iframeProps} />;
};

export {
	OptionButton,
	OptionIcon,
	OptionInput,
	OptionVideo
};
