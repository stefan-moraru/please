import React, { Component } from 'react';
import RenderWithTimeout from './RenderWithTimeout';
import Input from './Input';
import request from 'superagent';
import _get from 'lodash.get';
import _ from '../services/_';

// TODO: Cancel not working

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
      currentPlugin: _.pluginAtStep(this.state.currentPlugin, this.state.settings, option)
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
		const plugin = _.pluginWithUpdatedParamAndStep(this.state.currentPlugin, option.step, option.input.param, option.input.text);

    this.setState({
      plugin: plugin
    });
  }

  // TODO: Stateless components for options
  // TODO: Stateless components for conversation steps
  // TODO: Stateless components in separate folder, make them really short and easy to understand :*
  renderOption(params, option) {
    let renderedOption = null;

    if (option.button) {
      let optionContent = option.button.text;

      renderedOption = (
        <button className="btn" onClick={this.changeStep.bind(this, option)}>
          {optionContent}
        </button>
      );

      if (option.button.href) {
        let href = _.substituteParamsInString(params, option.button.href);

        if (href.indexOf('http') === -1) {
          href = `http://${href}`;
        }

        renderedOption = (
          <a target="_blank" href={href}>
            {renderedOption}
          </a>
        );
      }
    } else if (option.icon) {
      renderedOption = (
        <div className="component-Input__cancel" onClick={this.changeStep.bind(this, option)}>
          Cancel <i className={option.icon} />
        </div>
      );
    } else if (option.input) {
      renderedOption = (
        <Input label={option.input.label} placeholder={option.input.placeholder} onInputSubmit={this.updateParamAndChangeStepFromInput.bind(this, option)} />
      );
    }

    return (
      <div className="component-Conversation__step__options__option">
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

        request[query.method.toLowerCase()](query.url)
        .query(_.substituteParamsInString(params, query.params))
        .then((response) => {
          // TODO: Create function that will update params
          // TODO: Fix all Console warnings & errors
          const data = response.body;

          return this.updateParamFromQuery(query.fill.replace(/[{}]/g, ''), _get(data, query.responsePath), this.state.currentPlugin, stepKey);
        }, (error) => {
          console.error(error);
          // TODO: Failsafe
        })
      }
    }

    const contentBot = (
      <div className="component-Conversation__step__bot">
        <img src={plugin.image} alt={plugin.title} />
      </div>
    );

    const contentUser = (
      <div className="component-Conversation__step__bot right">
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
      <RenderWithTimeout timeout={1500}>
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
          return this.renderConversationStep(snapshot.step, snapshot.plugin.conversation[snapshot.step], snapshot.params, snapshot.plugin, snapshot.settings, true);
        }).reverse();
      }

      content = this.renderConversationStep(plugin.step, plugin.conversation[plugin.step], plugin.params, plugin, settings);
    } else {
      content = null;
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
      </div>
    );
  }
}
