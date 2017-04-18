import React from 'react';
import _ from '../services/_.js';
import _get from 'lodash.get';
import Input from './Input';

const OptionButton = ({ text, href, image, onClick, params, generate, generateLimit, generateDefault }) => {
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
    const _href = _.substituteParamsInString(params, href);

    if (_href.indexOf('http') === -1) {
      _href = `http://${_href}`;
    }

    rendered = (
      <a target="_blank" href={_href}>
        {rendered}
      </a>
    );
  }

	if (generate) {
		rendered = null;

		const param = params[generate.replace(/[{}]/g, '')];

		if (param && param.value && param.value.length > 0) {
			const buttons = param.value;

			buttons = buttons
			.sort((a, b) => {
				if (_get(a, image)) return -1;
				if (_get(b, image)) return 1;
				return 0;
			});

			if (generateLimit) {
				buttons = buttons.slice(0, generateLimit);
			}

			buttons = buttons
			.map(val => {
				const gprops = {
					text: _get(val, text),
					href: _get(val, href),
					image: _get(val, image),
	        onClick: onClick,
					parms: params
				};

				return <OptionButton {...gprops} />;
			});

			rendered = (
				<div>
					{buttons}
				</div>
			);
		} else {
			const def = <h6>{generateDefault || 'No results'}</h6>;

			rendered = (
				<div>
					{def}
				</div>
			);
		}
	}

	return rendered;
};

const OptionIcon = ({ icon, text, onClick }) => (
  <div className="component-Input__cancel" onClick={onClick}>
    {text} <i className={icon} />
  </div>
);

const OptionInput = ({ label, placeholder, onInputSubmit }) => (
  <Input label={label} placeholder={placeholder} onInputSubmit={onInputSubmit} />
);

export {
	OptionButton,
	OptionIcon,
	OptionInput
};
