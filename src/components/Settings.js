import React, { Component } from 'react';
import _ from '../services/_';

export default class Settings extends Component {
  state = {
    visible: false,
    plugins: null,
    user: {
      "profile": {
        "image": "http://icons.iconarchive.com/icons/graphicloads/colorful-long-shadow/256/User-icon.png"
      }
    }
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

    /*); */

    //http://tastedive.com/api/similar'
  }

  renderPlugin({ image, title, description }) {
    return (
      <div className="component-Settings__plugins__plugin">
        <div className="component-Settings__plugins__plugin__image">
          <img src={image} alt="Plugin image" />
        </div>

        <div className="component-Settings__plugins__plugin__title">
          <h4 className='u-m-0'>{title}</h4>
        </div>

        <div className="component-Settings__plugins__plugin__description">
          <h6 className='u-m-0'>{description}</h6>
        </div>
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

  renderSettings(plugins = {}) {
    plugins = Object.keys(plugins)
    .map(key => plugins[key])
    .concat({
      title: 'New',
      description: 'Click on the plus sign to add a new plugin',
      image: 'http://www.verdemartin.com/wp-content/uploads/2015/06/plus-button-green.png',
      onImageClick: () => {
        console.log('woooot');
      }
    })
    .map(plugin => this.renderPlugin(plugin));

    return (
      <div className="component-Settings">
        <div className="component-Settings__config">
          <h2>Please settings</h2>

          <button className="btn btn-info" onClick={this.login.bind(this)}>
            Login with Facebook to add plugins
          </button>
        </div>

        <div className="component-Settings__plugins">
          {plugins}
        </div>
      </div>
    );
  }

  showSettings() {
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

    return content;
  }

  onKeyDown(event) {
    if (event.keyCode === 27) {
      this.hideSettings();
    }
  }

  renderPluginEditor() {

  }

  render() {
    const plugins = this.state.plugins;
    const settings = this.state.visible ? this.renderSettings(plugins) : null;
    const icon = this.renderIcon();
    const pluginEditor = this.renderPluginEditor();

    return (
      <div>
        {icon}
        {settings}
        {pluginEditor}
      </div>
    );
  }
}
