import React, { Component } from 'react';

export default class RenderWithTimeout extends Component {
  state = {
    visible: false,
    timeout: null
  };

  setTimeout() {
    if (this.state.timeout) {
      clearTimeout(this.state.timeout);
    }

    this.setState({
      timeout: setTimeout(() => {
        this.setState({
          visible: true
        });
      }, this.props.timeout || 2000)
    });
  }

  componentWillMount() {
    this.setTimeout();
  }

  componentWillReceiveProps() {
    this.setState({
      visible: false
    }, () => {
      this.setTimeout();
    });
  }

  componentWillUnmount() {
    this.setState({
      visible: false
    });
  }

  render() {
    let rendered = null;

    if (this.state.visible || this.props.enabled || true) {
      rendered = this.props.children;
    } else {
      rendered = this.props.loader ? <div className="loader"></div> : null;
    }

    return rendered;
  }
}
