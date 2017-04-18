import React, { Component } from 'react';
import Dropzone from 'react-dropzone';
import request from 'superagent';
import stringSimilarity from 'string-similarity';
import ReactTooltip from 'react-tooltip';
import _ from '../services/_';

const GOOGLE_API_KEY = "AIzaSyDScKGu3VK7x27dk0E4bmdiSmP9dsC-cLU";
const CV_URL = 'https://vision.googleapis.com/v1/images:annotate?key=' + GOOGLE_API_KEY;

// TODO: Better hover css
// TODO: Improve how the suggestions look

class Input extends Component {
  state = {
    inputText: '',
    inputImage: null,
    suggestionsVisible: false,
    loading: false
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
    let value = '';

    if (result) {
      value = _.substituteParamsInString({
        category: { value: result.category.replace(/\s/g, '') },
        name: { value: result.name.replace(/\s/g, '') }
      }, this.props.imagePattern);
    }

    return this.onInputTextChangedToValueSubmit(value);
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
    suggestions = suggestions.map(suggestion => Object.assign({}, suggestion, {
      suggestion: suggestion,
      probability: stringSimilarity.compareTwoStrings(this.state.inputText, suggestion)
    }))
    .sort((a, b) => a.probability < b.probability)
    .map(suggestion => (
      <div className="component-Input__suggestions__suggestion" onMouseDown={this.onInputTextChangedToValueSubmit.bind(this, suggestion.suggestion)}>
        <h3>{suggestion.suggestion}</h3>
      </div>
    ));

    return (
      <div className="component-Input__suggestions">
        {suggestions}
      </div>
    );
  }

  onDrop(files) {
    this.setState({
      loading: true
    }, () => {
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
    });
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
      .end((err, resp) => {
        if (err) {
          console.log(err);
          this.setState({ loading: false });
          return reject(err);
        }

        const response = resp.body.responses[0];

        let web = null;
        let text = null;

        if (response.webDetection) {
          web = response.webDetection.webEntities[0];
        }

        if (response.textAnnotations) {
          text = response.textAnnotations[0].description;
        }

        if (web) {
          _.infoFromKnowledgeGraph(web.entityId)
          .then(info => {
            resolve(Object.assign({}, info, {
              text: text
            }));
            this.setState({ loading: false });
            console.log('Got info from knowledge graph', info);
          })
          .catch((error) => {
            console.log(error);
            return reject(error);
          });
        } else if (text) {
          resolve({
            text: text
          });

          this.setState({ loading: false });
        } else {
          resolve(null);
        }

        console.log('Cloud Vision API got ', web, text);
      });
    });
  }

  render() {
    //TODO: Find even more inputs? (files? or something)
    //TODO: https://dev.to/andraconnect/augmented-reality-in-10-lines-of-html
    const label = this.props.label ? <div className="label">{this.props.label}</div> : null;

    const suggestions = (this.state.suggestionsVisible && this.props.suggestionsEnabled) ? this.renderSuggestions(this.props.suggestions) : null;

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
      'data-tip': 'Send (you can also press enter)',
      onClick: this.onInputSubmit.bind(this)
    };

    const overlayDarken = !(this.state.suggestionsVisible && this.props.suggestionsEnabled) ? null : (
      <div className="overlay-darken"></div>
    );

    const imageIconProps = {
      className: 'ion-images'
    };

    //TODO: Conversation step (in the recipes one). Need help on how to cook it? => link spre youtube cu ?q=...

    const loader = !this.state.loading ? null : (
      <div className="loader"></div>
    );

    const disabledClassName = this.state.loading ? 'disabled' : '';

    return (
      <div className="component-Input__container">
        {loader}

        <div className={`component-Input ${disabledClassName}`}>
          {label}
          <input {...inputProps} />
          <div className="component-Input__extra">
            <Dropzone className="dropzone" onDrop={this.onDrop.bind(this)} data-tip="Upload an image">
              <i {...imageIconProps} />
            </Dropzone>

            <i {...iconProps} />
          </div>
          {suggestions}
          {overlayDarken}
        </div>

        <ReactTooltip type="dark" effect="solid" />
      </div>
    );
  }
}

Input.defaultProps = {
  onInputChange: () => {},
  onInputSubmit: () => {},
  suggestionsEnabled: false,
  imagePattern: '{category} like {name}'
};

export default Input;
