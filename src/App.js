import React, { Component } from 'react';
import nlp from 'compromise';
import logo from './please_logo.png';
import './App.css';


const config = {
  syntax: {
    //TODO: param: \$param
  }
};

const examplesFromPlugins = (plugins) => {
  let examples = null;

  if (plugins) {
    examples = Object.keys(plugins)
    .map(key => plugins[key])
    .reduce((a, b) => (a.examples || []).concat(b.examples || []));
  }

  return examples;
};

const stringWithoutArticles = (string) => {
  return string.replace(/\ (a|an|the)\ /g, ' ');
};


const substituteParamsInString = (params = [], string = '') => {
  return params.reduce((str, param) => {
    return string.replace(new RegExp(`\\${param.name}`, 'g'), param.value);
  }, string);
};

const paramsWithValuesFromResult = (params, results) => {
  return params.map(param => {
    if (!param.name) {
      const paramNumber = parseInt(param.replace(/\$param/g, ''));
      const result = (results && results[paramNumber - 1]) ? results[paramNumber - 1] : null;

      if (result) {
        param = {
          name: param,
          value: result.singular || result.normal || result
        };
      }
    }

    return param;
  });
};

const matchFromString = (match, input, plugin, pluginKey) => {
      //const matchKeyWithoutParams = matchKey.replace(/\$param[0-9]/g, '#');
      /*
      'shopping'
      match: 'I want to buy ''I want to buy an $param1Noun'
      'I want to buy an $param1Url'
      'I want to buy an $param1RegExp\\b\\d{5}\\b'
            'I want to buy $param1Noun': {
              // Goes to step 1
              step: 1,
              params: [ '$param1' ]
            },
            'I want to buy $param1Noun from $param2Noun': {


      Ce am:
        Recommend book {RegExp\\b\\d{5}\\b} from {Noun}
      Ce primesc:
        Recommend book 12345 from Carturesti
      Dupa split:
        ["Recommend", "book", "12345", "from", "Carturesti"]
        ["Recommend", "book", "{Reg..}", "from", "{Noun}"]

      Vreau sa ajung la:
        $param1 = 12345
        $param2 = Carturesti

      */
  let matchResult = nlp(text).match(matchKey);
  let result = [];


      const text = stringWithoutArticles(input);

  text.split(/\{(.+?)\}/g);

  /*
    Noun
    Url
    RegExp
  */

  result = result.concat(matchResult.nouns().data());
  result = result.concat(matchResult.urls().data());

  console.log('here', result);

  let matchForSort = {
    length: result.length,
    plugin: plugin,
    name: pluginKey
  };

  if (match.step) {
    matchForSort.step = match.step;
  }

  if (match.params) {
    matchForSort.params = this.constructParamsFromParams(match.params, result);
  }

  return matchForSort;
}

const pluginMatchesForInput = (plugins, input) => {
  return Object.keys(plugins)
  .map(pluginKey => {
    const plugin = nextProps.settings.plugins[pluginKey];

    return Object.keys(plugin.match)
    .map(matchKey => {
      const match = plugin.match[matchKey];
      let res = matchFromString(match, input, plugin, pluginKey);

      if (match.extraMatches) {
        res = res.concat(match.extraMatches.map(extraMatch => {
          return matchFromString(match, input, plugin, pluginKey);
        }));
      }

      return res;
    });
  });
};

/*
- ISBN12345
Cool! This is a book about Robin Hood
Did you like it?
- Yes!
Nice, lets see what other books about Robin Hood I can find
...
I found BookA, BookB, BookC
Do you like any of them?
- I like BookA
EXEMPLU ASTA DE RULAT!! I'm look for a netflix movie to watch / Sure! What're you in the mood for / Something like X / Checkout ABC
*/
/*
Identifica pe baza copertei, codului de bare categorii de obiecte
Folosind identificarea, se recomanda resure alternative de interes in functie de:
  - Disponsibiliatea in alt format (varianta pdf / epub), alte limbi
  - Pret
  - Calitate
  - Similaritate
  - Preferinte alte utilizatorului
*/
//TODO:RECOMANDARIIII!!!!!
//TODO:RECOMANDARIIII!!!!!
//TODO:RECOMANDARIIII!!!!!
//TODO:RECOMANDARIIII!!!!!
//TODO:RECOMANDARIIII!!!!!
//TODO:RECOMANDARIIII!!!!!
//TODO:RECOMANDARIIII!!!!!
//TODO:RECOMANDARIIII!!!!!
//TODO: Use Monstreall font (same one as photon web setup)
//TODO: Make the app work offline (+++++)
//TODO: Improve logo
//TODO: Make input & button the same length as the conversation box
//TODO: Name & Favicon
//TODO: SAVE CONVERSATION! TAKE THE RENDERED CONTENT AND PUSH IT INTO AN ARRAY IN STATE
//TODO: Default option type is a button, but it should also have image / text input. They should bind to a $param
//TODO: customizableParams (list of params that can be passed & stored in Firebase, from the settings view)
//TODO: Demo for Particle with a plugin (emit a http event, turn on a internet button led rid)
//TODO: Add "set=$paramX" option to options, they will update the value of the param in state { "set=$paramX,1234",}
//TODO: Make it more conversational
/*
I want to buy a horse
Show me information about Romania
Exchange 1 leu in euro
JSON encode { abc: 1 }
Travel to Ibiza
Find me an apartment with 3 rooms
*/
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
    inputText: "12345", //TODO: null,
    inputImage: null
  };

  componentDidMount() {
    this.onInputChange();
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

  onKeyPress(event) {
    if (event.charCode === 13) {
      this.onInputChange();
    }
  }

  render() {
    //TODO: Replace the button with a debounce (or add debounce and button)
    //TODO: Add image input
    //TODO: Find even more inputs? (files? or something)

    return (
      <div className="component-Input">
        <input type="text" spellCheck="false" placeholder="Please.." value={this.state.inputText} onChange={this.onInputTextChanged.bind(this)} onKeyPress={this.onKeyPress.bind(this)} />
        <i className="component-Input__send ion-paper-airplane" onClick={this.onInputChange.bind(this)}></i>
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
        //TODO: Location app, npl has .places()
        //TODO: visit #Noun will show google maps
        //TODO: Add 'cancel' as conversation step to represent canceling
        'book': {
          title: 'Book recommendation',
          examples: ['978-0141329383'],
          match: {
            '$param1RegExp/\bd{5}\b': {
              step: 1,
              params: [ '$param1' ]
            }
          },
          conversation: {
            1: {
              text: 'Hello! Looks like your are trying to find something related to a book'
            }
          }
        },
        'url': {
          title: 'URL assitant', //TODO: Find something prettier (maybe personal)
          examples: ['open www.fiicode.com'],
          match: {
            'open $param1Url': {
              step: 1,
              params: [ '$param1' ],
              extraMatches: [
                'go to $param1Url',
                'link $param1Url',
                'url $param1Url'
              ]
            }
          },
          conversation: {
            1: {
              text: {
                content: 'Going to url plugin'
              },
              options: {
                1: {
                  text: 'Go to $param1',
                  href: '$param1',
                  step: 2,
                  params: [ '$param1' ]
                }
              }
            },
            2: {
              text: {
                content: 'We have opened $param1. Thank you for using this plugin!'
              }
            }
          }
        },
        'shopping': {
          examples: ['I want to buy an iPhone', 'I want to buy an iPhone from emag'],
          match: {
            'I want to buy $param1Noun': {
              // Goes to step 1
              step: 1,
              params: [ '$param1' ]
            },
            'I want to buy $param1Noun from $param2Noun': {
              // Goes to step 2 (showing only from a company)
            }
          },
          conversation: {
            1: {
              text: {
                // TODO: Maybe no 'content' key here, text directly in texx
                content: 'You are trying to buy a $param1'
              },
              options: {
                1: {
                  text: 'Buy $param1 from emag',
                  // TODO: Maybe goToStep instead of step
                  step: 2,
                  params: [
                    {
                      name: '$param2',
                      value: 'emag'
                    }
                  ]
                },
                2: { text: 'Buy $param1 from pcgarage', step: 2 },
                3: { text: 'No buy eine $param1, no bueno', step: 3}
                // TODO: Add default Cancel option
              }
            },
            2: {
              text: {
                content: 'Trying to buy $param1 from $param2 !!!!'
              }
            },
            3: {
              text: {
                content: 'So sad, you did not buy anything.'
              }
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
  state = {
    currentPlugin: null
  };




  constructParamsFromParams(params, results) {
  }


  // TODO: Move from here to somewhere like "Start plugin"
  // Because this will be called on setState, it can lose state
  componentWillReceiveProps(nextProps) {
    const input = nextProps.input;
    const settings = nextProps.settings;

    if (!input || !settings || (settings && !settings.plugins)) {
      return;
    }

    const plugins = settings.plugins;
    const matches = pluginMatchesForInput(plugins, input);
    const bestPlugin = matches.sort((a, b) => a.length < b.length)[0];

    let currentPlugin = null;

    if (bestPlugin.length >= 0) {
      currentPlugin = Object.assign({}, {
        name: bestPlugin.name,
        step: bestPlugin.step ? bestPlugin.step : 1,
        params: bestPlugin.params ? bestPlugin.params : null
      }, bestPlugin.plugin);
    }

    this.setState({
      currentPlugin: currentPlugin
    });
  }

  step(option) {
    let plugin = this.state.currentPlugin;

    // TODO: Here, add params? (overwritting current params)
    plugin.step = option.step;
    const newParams = this.constructParamsFromParams(option.params);

    if (plugin.params) {
      // Merge newParams with plugin.params TODO: Improve
      // TODO: Remove params that are overwritten (like having $param5 in newParams, but also in params)
      plugin.params = plugin.params.concat(newParams);
    } else {
      plugin.params = newParams;
    }

    this.setState({
      currentPlugin: plugin
    });
  }

  renderConversationStepText(text, params) {
    let contentText = null;

    if (text) {
      text.content = substituteParamsInString(params, text.content);

      contentText = (
        <div>
          <h4 className="u-m-0">{text.content}</h4>
        </div>
      )
    }

    return contentText;
  }

  renderOption(params, option) {
    const text = substituteParamsInString(params, option.text);

    let optionContent = text;

    let optionProps = {
      className: 'btn',
      onClick: this.step.bind(this, option)
    };

    let renderedOption = (
      <button {...optionProps}>
        {optionContent}
      </button>
    );

    if (option.href) {
      optionProps.target = '_blank';
      optionProps.href = substituteParamsInString(params, option.href);

      if (optionProps.href.indexOf('http') === -1) {
        optionProps.href = 'http://' + optionProps.href;
      }

      renderedOption = (
        <a {...optionProps}>
          {optionContent}
        </a>
      );
    }

    return renderedOption;
  }

  renderConversationStepOptions(options, params) {
    let rendered = null;

    if (options) {
      options.cancel = {
        text: 'Cancel',
        step: 'cancel'
      };

      options = Object.keys(options).map(key => options[key]);

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

  renderConversationStep(step, params) {
    let content = null;
    let contentText = null;
    let contentOptions = null;

    if (step) {
      // TODO: Create an object that will do all these ugly ifs (with property and what to render)
      if (step.text) {
        contentText = this.renderConversationStepText(step.text, params);
      }

      if (step.options) {
        contentOptions = this.renderConversationStepOptions(step.options, params);
      }
    } else {
      contentText = <h4>Did not find any conversation step</h4>;
      contentOptions = this.renderConversationStepOptions({
        1: {
          'text': 'Try again, harder'
        }
      });
    }

    const contentBot = (
      <div className="component-Conversation__step__bot">
        <img src="https://storybird.s3.amazonaws.com/artwork/andymcnally/full/happy-bot.jpeg" />
      </div>
    )

    return (
      <div className="component-Conversation__step">
        {contentBot}
        {contentText}
        {contentOptions}
      </div>
    );
  }

  renderPlugin(plugin) { //TODO: Improve naming
    let content = null;

    if (plugin && plugin.conversation) {
      content = this.renderConversationStep(plugin.conversation[plugin.step], plugin.params);
    } else {
      content = null;
    }

    return content;
  }

  render() {
    const currentPlugin = this.renderPlugin(this.state.currentPlugin);
    return (
      <div className="component-Conversation">
        {currentPlugin}
      </div>
    );
  }
}

class App extends Component {
  state = {
    input: null,
    settings: null,
    //TODO: Create component with this rotating text stuff (ask Gabriel)
    examplesIndex: 0,
    examplesInterval: null
  };

  onInputChange(input) {
    //TODO: input.text, input.image
    this.setState({
      input: input
    });
  }

  onSettingsChange(settings) {
    //TODO: settings.plugins, settings.preferences
    let examples = examplesFromPlugins(settings ? settings.plugins : null)

    this.setState({
      settings: settings,
      examples: examples
    });

    if (this.state.examplesInterval) {
      clearInterval(this.state.examplesInterval);
    }

    this.setState({
      /* examplesInterval: setInterval(() => {
        let no = this.state.examplesIndex + 1;

        if (no > this.state.examples.length) {
          no = 0;
        }

        this.setState({
          examplesIndex: no
        });
      }, 2000) */
    });
  }

  render() {
    const example = this.state.examples ? ('Example: ' + this.state.examples[this.state.examplesIndex]) : null;

    return (
      <div className="component-App">
        <img src={logo} className="logo" />
        <Input onInputChange={this.onInputChange.bind(this)}/>
        <div className="component-examples">
          <h4 className="u-m-0">{example}</h4>
        </div>
        <Settings onSettingsChange={this.onSettingsChange.bind(this)} />
        <Conversation input={this.state.input} settings={this.state.settings} />
      </div>
    );
  }
}

export default App;
