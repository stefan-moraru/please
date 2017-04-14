import React from 'react';
import _ from '../services/_.js';
import _get from 'lodash.get';
import Input from './Input';

const OptionButton = ({ text, href, onClick, params, generate }) => {
	let rendered = null;
  let optionContent = text;

  rendered = (
    <button className="btn" onClick={onClick}>
      {optionContent}
    </button>
  );

  if (href) {
    const _href = _.substituteParamsInString(params, href);

    if (_href.indexOf('http') === -1) {
      _href = `http://${href}`;
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

		if (param && param.value) {
			const buttons = param.value;

			buttons = buttons.map(val => {
				console.log('val', val);
				const gprops = {
					text: _get(val, text),
					href: _get(val, href),
	        onClick: onClick,
					parms: params
				};

				console.log('gprops', gprops);

				return <OptionButton {...gprops} />;
			});

			rendered = (
				<div>
					{buttons}
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
