import React, { Component } from 'react';
import RenderWithTimeout from './RenderWithTimeout';
import Input from './Input';
import request from 'superagent';
import _get from 'lodash.get';
import ReactTooltip from 'react-tooltip';
import _ from '../services/_';
import { OptionButton, OptionIcon, OptionInput, OptionVideo } from './Option';
import superagentjsonp from 'superagent-jsonp';

// TODO: Fix all Console warnings & errors
// TODO: HAVE LONG MATCHES! Important for calculating match probability

export default class Conversation extends Component {
  state = {
    currentPlugin: null
  };

  startBestMatchingPlugin(input, settings) {
    if (!input || !settings || (settings && !settings.plugins)) {
      return;
    }

    this.setState({
      currentPlugin: _.bestPluginMatch(settings, input),
      settings: settings
    });
  }

  componentWillReceiveProps(nextProps) {
    const input = nextProps.input;
    const settings = nextProps.settings;

    if (this.props !== nextProps) {
      this.startBestMatchingPlugin(input, settings);
    }
  }

  changeStep(option) {
    this.setState({
      currentPlugin: _.pluginAtStep(this.state.currentPlugin, option)
    });
  }

  renderConversationStepText(text, params) {
    let contentText = null;

    if (text) {
      text = _.substituteParamsInString(params, text);

      contentText = (
        <div>
          <h4 className="u-m-0">{text}</h4>
        </div>
      );
    }

    return contentText;
  }

  updateParamAndChangeStepFromInput(option, input) {
		const plugin = _.pluginWithUpdatedParamAndStep(this.state.currentPlugin, option.step, option.input.param.replace(/[{}]/g, ''), input.text);

    this.setState({
      plugin: plugin
    });
  }

  generateButton(option, params) {
		const props = {
			text: option.button.text,
			href: _.substituteParamsInString(params, option.button.href),
      image: option.button.image,
      onClick: this.changeStep.bind(this, option),
			params: params
		};

		return <OptionButton {...props} />;
  }

  // TODO: Stateless components for conversation steps
  renderOption(params, option) {
    let renderedOption = null;

    if (option.button) {
			renderedOption = this.generateButton(option, params);
    } else if (option.icon) {
			const props = {
				icon: option.icon,
				text: option.text,
        onClick: this.changeStep.bind(this, option)
			};

			renderedOption = <OptionIcon {...props} />;
    } else if (option.input) {
			const props = {
				label: option.input.label,
				placeholder: option.input.placeholder,
        onInputSubmit: this.updateParamAndChangeStepFromInput.bind(this, option)
			};

      renderedOption = <OptionInput {...props} />;
    } else if (option.video) {
      const props = {
        id: option.video.id
      };

      renderedOption = <OptionVideo {...props} />;
    }

  	if (option.generate) {
  		renderedOption = null;

  		const param = params[option.generate.replace(/[{}]/g, '')];

  		if (param && param.value && param.value.length > 0) {
  			const items = param.value;

  			if (option.generateLimit) {
  				items = items.slice(0, option.generateLimit);
  			}

  			items = items
  			.map(val => {
          if (option.button) {
            const newOption = Object.assign({}, option);

            newOption.button = Object.assign({}, option.button);

            newOption.button.text = _get(val, option.button.text);
            newOption.button.href = _get(val, option.button.href);
            newOption.button.image = _get(val, option.button.image);

            return this.generateButton(newOption, params);
          }

          return val;
  			});

        renderedOption = (
  				<div>
  					{items}
  				</div>
  			);
  		} else {
  			const def = <h6>{option.generateDefault || 'No results'}</h6>;

  			renderedOption = (
  				<div>
  					{def}
  				</div>
  			);
  		}
  	}

		const renderedOptionTitle = !option.title ? null : (
			<h4 className="u-m-b-10 u-m-t-0">{option.title}</h4>
		);

    return (
      <div className="component-Conversation__step__options__option">
				{renderedOptionTitle}
        {renderedOption}
      </div>
    );
  }

  renderConversationStepOptions(options, params) {
    let rendered = null;

    if (options) {
      if (!options.cancel) {
        options.cancel = {
          icon: 'ion-close-circled',
					text: 'Cancel',
          step: 'cancel'
        };
      }

			options = _.sortOptions(options);

      rendered = options.map(option => {
        return this.renderOption(params, option);
      });
    }

    return (
      <div className="component-Conversation__step__options">
        {rendered}
      </div>
    );
  }

  updateParamFromQuery(paramName, value, plugin, stepKey) {
    this.setState({
      currentPlugin: _.pluginWithUpdatedParam(plugin, stepKey, paramName, value)
    });
  }

  renderConversationStep(stepKey, step, params, plugin, settings, fromHistory = false) {
    let contentText = <h4>Thank you for using Please!</h4>;
    let contentOptions = null;

    if (step) {
      contentText = step.text ? this.renderConversationStepText(step.text, params) : null;
      contentOptions = step.options ? this.renderConversationStepOptions(step.options, params) : null;

      if (step.query && !step.queryDone && !fromHistory) {
        const query = step.query;

        // TODO: Move this to _
        request[query.method.toLowerCase()](query.url)
        .use(superagentjsonp({
          timeout: 10000
        }))
        .query(_.substituteParamsInString(params, query.params))
        .then((response) => {
          const data = response.body;

          console.log('got data from query', data);

          return this.updateParamFromQuery(query.fill.replace(/[{}]/g, ''), _get(data, query.responsePath), this.state.currentPlugin, stepKey);
        }, (error) => {
          console.error(error);
          // TODO: Failsafe
        })
      }
    }

    if (step.jumpToStep && !fromHistory) {
      setTimeout(() => {
        this.changeStep({
          step: step.jumpToStep
        });
      }, step.jumpToStepDelay || 1000);
    }

    const contentBot = (
      <div className="component-Conversation__step__bot" data-tip={plugin.title}>
        <img src={plugin.image} alt={plugin.title} />
      </div>
    );

    const contentUser = (
      <div className="component-Conversation__step__bot right" data-tip="You">
        <img src={settings.user.profile.image} alt="User profile" />
      </div>
    );

    const _contentText = !contentText ? null : (
      <div className="component-Conversation__step">
        <div className="component-Conversation__step__content">
          {contentBot}
          <RenderWithTimeout timeout={500} loader={true} enabled={!fromHistory}>
            {contentText}
          </RenderWithTimeout>
        </div>
      </div>
    );

    const _contentOptions = !contentOptions ? null : (
      <RenderWithTimeout timeout={1500} enabled={!fromHistory}>
        <div className="component-Conversation__step right">
          <div className="component-Conversation__step__content">
            {contentUser}
            <RenderWithTimeout timeout={500} loader={true} enabled={!fromHistory}>
              {contentOptions}
            </RenderWithTimeout>
          </div>
        </div>
      </RenderWithTimeout>
    );

    return (
      <div>
        {_contentOptions}
        {_contentText}
      </div>
    );
  }

  renderConversation(plugin, settings) {
    let content = null;
    let history = null

    if (plugin && plugin.conversation) {
      if (plugin.history) {
        history = plugin.history.map(snapshot => {
          return this.renderConversationStep(snapshot.step, snapshot.plugin.conversation[snapshot.step], snapshot.params, snapshot.plugin, settings, true);
        }).reverse();
      }

      content = this.renderConversationStep(plugin.step, plugin.conversation[plugin.step], plugin.params, plugin, settings);
    }

    return (
      <div>
        {content}

        <div className="history">
          {history}
        </div>
      </div>
    );
  }

  render() {
    const conversation = this.renderConversation(this.state.currentPlugin, this.state.settings);

    return (
      <div className="component-Conversation">
        {conversation}

        <ReactTooltip type="dark" effect="solid" />
      </div>
    );
  }
}
