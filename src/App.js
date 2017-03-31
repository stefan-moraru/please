import React, { Component } from 'react';
import nlp from 'compromise';
import logo from './logo.svg';
import './App.css';

/*
  App
    Input
    Output(input, plugins, todo: preferences): onChange - update status on App
    Settings
      Plugins


  Debouce on input that triggers the parsing of the plugins
  https://www.npmjs.com/package/huh
  DESCRIPTIVE ERRORS1!!!!
  100% test coverage (https://www.codacy.com/app/spencerkelly86/compromise/dashboard)


  for matching https://github.com/nlp-compromise/compromise/wiki/Match-syntax

  In prezentare parte scurta din ce facea IronMan

  tot proiectul sa fie un json (logo, style etc tot)
*/

class Input extends Component {
  state = {
    inputText: "I want to buy iphone", //null,
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

  render() {
    //TODO: Replace the button with a debounce (or add debounce and button)
    return (
      <div>
        IMAGE
        <input type="text" value={this.state.inputText} onChange={this.onInputTextChanged.bind(this)} />
        <button onClick={this.onInputChange.bind(this)}>
        SEND
        </button>
      </div>
    )
  }
}
class Settings extends Component {
  componentDidMount() {
    this.onSettingsChange();
  }

  onSettingsChange() {
    this.props.onSettingsChange({
      plugins: {
        'shopping': {
          match: {
            'I want to buy #Noun': {
              // Goes to step 1
            },
            'I want to buy #Noun from #Noun': {
              // Goes to step 2 (showing only from a company)
            }
          }
        }
      },
      precerences: {

      }
    });
  }
  render() {
    return null;
  }
}
class Plugins extends Component {
  render() {
    return null;
  }
}

class Conversation extends Component {
  componentDidMount() {
  }

  componentWillReceiveProps(nextProps) {
    console.log('YAY', nextProps.input, nextProps.settings);


    for (const pluginKey in nextProps.settings.plugins) {
      const plugin = nextProps.settings.plugins[pluginKey];

      for (const matchKey in plugin.match) {
        const matchResult = nlp(nextProps.input.text).match(matchKey).out('text');

        console.log(matchKey);
        console.log(matchResult);
      }
    }
  }

  render() {
    return null;
  }
}

class App extends Component {
  state = {
    input: null,
    settings: null
  };

  onInputChange(input) {
    // input.text, input.image
    console.log('update1');
    this.setState({
      input: input
    });
  }

  onSettingsChange(settings) {
    // settings.plugins, settings.preferences
    console.log('update2');
    this.setState({
      settings: settings
    });
  }

  render() {
    return (
      <div className="App">
        <Input onInputChange={this.onInputChange.bind(this)}/>
        <Settings onSettingsChange={this.onSettingsChange.bind(this)} />
        <Conversation input={this.state.input} settings={this.state.settings} />
      </div>
    );
  }
}

export default App;
