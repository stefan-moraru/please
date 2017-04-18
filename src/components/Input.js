import React, { Component } from 'react';
import Dropzone from 'react-dropzone';
import request from 'superagent';
import _ from '../services/_';

const GOOGLE_API_KEY = "AIzaSyDScKGu3VK7x27dk0E4bmdiSmP9dsC-cLU";
const CV_URL = 'https://vision.googleapis.com/v1/images:annotate?key=' + GOOGLE_API_KEY;

// TODO: Loading indicator after uploading an image (prevent typing)

class Input extends Component {
  state = {
    inputText: '',
    inputImage: null,
    suggestionsVisible: false
  };

  onInputTextChangedToValueSubmit(value) {
    this.setState({
      inputText: value
    }, () => {
      this.onInputSubmit();
    });
  }

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
    this.hideSuggestions();
    this.props.onInputSubmit(input);
  }

  onInputImageChange(result) {
    const value = `${result.category} like ${result.name}`;

    return this.onInputTextChangedToValueSubmit(value);

    console.log('onInputImageChange', result);
  }

  onKeyPress(event) {
    if (event.charCode === 13) {
      this.onInputSubmit();
    }
  }

  showSuggestions() {
    this.setState({
      suggestionsVisible: true
    });
  }

  hideSuggestions() {
    this.setState({
      suggestionsVisible: false
    });
  }

  renderSuggestions(suggestions = []) {
    suggestions = suggestions.map(suggestion => (
      <div className="component-Input__suggestions__suggestion" onMouseDown={this.onInputTextChangedToValueSubmit.bind(this, suggestion)}>
        <h3>{suggestion}</h3>
      </div>
    ));

    return (
      <div className="component-Input__suggestions">
        {suggestions}
      </div>
    );
  }

  onDrop(files) {
    const file = files[0];

    let reader = new FileReader();

    reader.onloadend = () => {
      let content = event.target.result;

      content = content.replace('data:image/png;base64,', '');
      content = content.replace('data:image/jpeg;base64,', '');
      content = content.replace('data:image/jpg;base64,', '');

      this.sendFileToCloudVision(content).then(this.onInputImageChange.bind(this)).catch(e => { console.error(e); });
    };

    reader.readAsDataURL(file);
  }

  sendFileToCloudVision(content) {
    const data = {
      requests: [{
        image: {
          content: content
        },
        features: [{
          type: 'WEB_DETECTION',
          maxResults: 1
        }, {
          type: 'TEXT_DETECTION',
          maxResults: 1
        }]
      }]
    };

    return new Promise((resolve, reject) => {
      request
      .post(CV_URL)
      .set('Content-Type', 'application/json')
      .send(JSON.stringify(data))
      .end(function(err, resp) {
        if (err) {
          console.log(err);
          return reject(err);
        }

        const web = resp.body.responses[0].webDetection.webEntities[0];
        const text = resp.body.responses[0].textAnnotations[0].description;

        if (web) {
          _.infoFromKnowledgeGraph(web.entityId)
          .then(info => {
            resolve(Object.assign({}, info, {
              text: text
            }));
            console.log('Got info from knowledge graph', info);
          })
          .catch((error) => {
            console.log(error);
            return reject(error);
          });
        } else {
          resolve({
            text: text
          });
        }

        console.log('Cloud Vision API got ', web, text);
      });
    });
  }

  render() {
    //TODO: IMPORTANT Add image input
    //TODO: Replace the button with a debounce (or add debounce and button)
    //TODO: Find even more inputs? (files? or something)
    //TODO: https://dev.to/andraconnect/augmented-reality-in-10-lines-of-html
    const label = this.props.label ? <div className="label">{this.props.label}</div> : null;

    //TODO: Move suggestions to separate function
    //TODO: When typing inside the big input, add overlay to body (under the input and suggestions, that will darken the page)
    //TODO: Show suggestions on focus, hide on blur

    const suggestions = this.state.suggestionsVisible ? this.renderSuggestions(this.props.suggestions) : null;

    const inputProps = {
      type: "text",
      spellCheck: "false",
      placeholder: this.props.placeholder || '',
      value: this.state.inputText,
      onChange: this.onInputTextChanged.bind(this),
      onKeyPress: this.onKeyPress.bind(this),
      onFocus: this.showSuggestions.bind(this),
      onBlur: this.hideSuggestions.bind(this)
    };

    const iconProps = {
      className: "component-Input__send ion-paper-airplane",
      onClick: this.onInputSubmit.bind(this)
    };

    const overlayDarken = !this.state.suggestionsVisible ? null : (
      <div className="overlay-darken"></div>
    );

    const imageIconProps = {
      className: 'ion-images',
      onClick: this.onInputSubmit.bind(this)
    };

    //TODO: Tooltips to everything (like Upload an image / Parse input etc!!)
    //TODO: Conversation step (in the recipes one). Need help on how to cook it? => link spre youtube cu ?q=...

    return (
      <div className="component-Input">
        {label}
        <input {...inputProps} />
        <div className="component-Input__extra">
          <Dropzone className="dropzone" onDrop={this.onDrop.bind(this)}>
            <i {...imageIconProps} />
          </Dropzone>

          <i {...iconProps} />
        </div>
        {suggestions}
        {overlayDarken}
      </div>
    );
  }
}

Input.defaultProps = {
  onInputChange: () => {},
  onInputSubmit: () => {}
};

export default Input;
