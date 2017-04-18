import React, { Component } from 'react';

class RenderWithTimeout extends Component {
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

    if (this.props.enabled) {
      if (this.state.visible) {
        rendered = this.props.children;
      } else {
        rendered = this.props.loader ? <div className="loader"></div> : null;
      }
    } else {
      rendered = this.props.children;
    }

    return rendered;
  }
}

RenderWithTimeout.defaultProps = {
  enabled: true
};

export default RenderWithTimeout;
