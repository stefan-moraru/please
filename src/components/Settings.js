import React, { Component } from 'react';
import _ from '../services/_';

const JSONEditor = window.JSONEditor;

const json = {
  "name": "Plugin name (or id)",
  "title": "Plugin title",
  "description": "What does your plugin do?",
  "image": "https://upload.wikimedia.org/wikipedia/commons/e/e6/Lol_circle.png",
  "match": {
    "this is what a user {param} would type": {
      "step": "what-step-to-jump-to",
      "extraMatches": [
        "alternative {param} 1"
      ]
    }
  },
  "conversation": {
    "first-step": {
      "text": "Text **1234**",
      "markdown": true,
      "optionsTitle": "List of user options",
      "options": {
        "recipes": {
					"title": "Action 1",
          "button": {
            "text": "Button text",
            "href": "http://www.food.com/search/{food}"
          }
        }
      }
    }
  }
};

export default class Settings extends Component {
  state = {
    visible: true,//false,
    plugins: null,
    user: {
      "profile": {
        "image": "http://icons.iconarchive.com/icons/graphicloads/colorful-long-shadow/256/User-icon.png"
      }
    },
    newPlugin: json
  };

  componentDidMount() {
    window.addEventListener('keydown', this.onKeyDown.bind(this));

    _.fb_onValue('plugins', (plugins) => {
      this.setState({
        plugins: plugins
      }, () => {
        this.onSettingsChange();
      });
    });
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.onKeyDown.bind(this));
  }

  onSettingsChange() {
    const settings = {
      pluginMatchProbabilityThreshold: 0.3,
      user: this.state.user,
      plugins: this.state.plugins
    };

    this.props.onSettingsChange(settings);
  }

  editPlugin(plugin) {
    this.setState({
      newPlugin: plugin
    });
  }

  renderPlugin(plugin) {
    const edit = !this.sameUser(plugin.author) ? null : (
      <div className="component-Settings__plugins__plugin__edit" onClick={this.editPlugin.bind(this, plugin)}>
        <i className="ion-edit" />
      </div>
    );

    return (
      <div className="component-Settings__plugins__plugin">
        <div className="component-Settings__plugins__plugin__image">
          <img src={plugin.image} alt="Plugin image" />
        </div>

        <div className="component-Settings__plugins__plugin__title">
          <h4 className='u-m-0'>{plugin.title}</h4>
        </div>

        <div className="component-Settings__plugins__plugin__description">
          <h6 className='u-m-0'>{plugin.description}</h6>
        </div>

        {edit}
      </div>
    );
  }

  login() {
    return _.fb_login().then(user => {
      this.setState({
        user: user
      }, () => {
        this.onSettingsChange();
      })
    })
  }

  loggedIn() {
    return this.state.user && this.state.user.profile && this.state.user.profile.email;
  }

  sameUser(email) {
    return this.loggedIn() && this.state.user.profile.email === email;
  }

  renderSettings(plugins = {}) {
    const pluginEditor = this.loggedIn() ? this.renderPluginEditor() : null;

    if (!plugins) {
      return null;
    }

    plugins = Object.keys(plugins)
    .map(key => plugins[key])
    .map(plugin => this.renderPlugin(plugin));

    const loginButton = this.loggedIn() ? <h4>Welcome, {this.state.user.profile.name}!</h4> : (
      <button className="btn btn-info" onClick={this.login.bind(this)}>
        Log in with Facebook to add or edit plugins
      </button>
    );

    return (
      <div className="component-Settings">
        <div className="component-Settings__config">
          <h2>Please settings</h2>

          {loginButton}
        </div>

        <div className="component-Settings__plugins">
          {plugins}
        </div>

        {pluginEditor}
      </div>
    );
  }

  showSettings() {
    this.editor = null;

    this.setState({
      visible: true
    });
  }

  hideSettings() {
    this.setState({
      visible: false
    });
  }

  renderIcon() {
    let content = null;

    if (this.state.visible) {
      content = (
        <div className="component-Settings__gear close" onClick={this.hideSettings.bind(this)}>
          <i className="ion-close-round" />
        </div>
      );
    } else {
      content = (
        <div className="component-Settings__gear" onClick={this.showSettings.bind(this)}>
          <i className="ion-gear-a" />
        </div>
      );
    }

    const className = this.state.plugins ? '' : 'disabled';

    return <div className={className}>{content}</div>;
  }

  onKeyDown(event) {
    if (event.keyCode === 27) {
      this.hideSettings();
    }
  }

  componentDidUpdate() {
    const container = document.getElementById("jsoneditor");

    if (container && !this.editor) {
      this.editor = new JSONEditor(container, {});
    }

    if (this.editor) {
      this.editor.set(this.state.newPlugin);
    }
  }

  saveNewPlugin() {
    const plugin = this.editor.get();

    if (plugin && plugin.name) {
      plugin.author = this.state.user.profile.email;

      _.fb_set(`/plugins/${plugin.name}`, plugin);

      this.setState({
        newPlugin: {}
      });
    }
  }

  renderPluginEditor() {
    return (
      <div className="component-Settings__editor">
        <h3>Create or edit a plugin</h3>
        <h4>Before, please read <a href="https://github.com/stefan-moraru/please" target="_blank">the documentation</a></h4>

        <div id='jsoneditor'></div>

        <div className='u-m-t-10'>
          <button className='btn btn-info u-w-200' onClick={this.saveNewPlugin.bind(this)}>
            Save
          </button>
        </div>
      </div>
    );
  }

  render() {
    const plugins = this.state.plugins;
    const settings = this.state.visible ? this.renderSettings(plugins) : null;
    const icon = this.renderIcon();

    return (
      <div>
        {icon}
        {settings}
      </div>
    );
  }
}
