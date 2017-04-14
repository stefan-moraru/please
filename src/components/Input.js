import React, { Component } from 'react';

class Input extends Component {
  state = {
    inputText: null,
    inputImage: null
  };

  onInputTextChanged(event) {
    const value = event.target.value;

    this.setState({
      inputText: value
    });
  }

  onInputChange() {
    let input;

    input = {
      text: this.state.inputText
    };

    this.props.onInputChange(input);
  }

  onInputSubmit() {
    let input;

    input = {
      text: this.state.inputText
    };

    this.onInputChange();
    this.props.onInputSubmit(input);
  }

  onKeyPress(event) {
    if (event.charCode === 13) {
      this.onInputSubmit();
    }
  }

  render() {
    //TODO: Replace the button with a debounce (or add debounce and button)
    //TODO: Add image input
    //TODO: Find even more inputs? (files? or something)
    //TODO: https://dev.to/andraconnect/augmented-reality-in-10-lines-of-html
    const label = this.props.label ? <div className="label">{this.props.label}</div> : null;

    return (
      <div className="component-Input">
        {label}
        <input type="text" spellCheck="false" placeholder={this.props.placeholder || ''} value={this.state.inputText} onChange={this.onInputTextChanged.bind(this)} onKeyPress={this.onKeyPress.bind(this)} />
        <i className="component-Input__send ion-paper-airplane" onClick={this.onInputSubmit.bind(this)}></i>
      </div>
    )
  }
}

Input.defaultProps = {
  onInputChange: () => {},
  onInputSubmit: () => {}
};

export default Input;
