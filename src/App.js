import React, { Component } from 'react';
import nlp from 'compromise';
import logo from './please_logo.png';
import './App.css';

//TODO: Use Monstreall font (same one as photon web setup)
//TODO: Make the app work offline (+++++)
//TODO: Improve logo
//TODO: Make input & button the same length as the conversation box
//TODO: Name & Favicon
//TODO: SAVE CONVERSATION! TAKE THE RENDERED CONTENT AND PUSH IT INTO AN ARRAY IN STATE

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
  // TODO: Submit on enter
  state = {
    inputText: "I want to buy an iphone", //TODO: null,
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
        'url': {
          title: 'URL assitant', //TODO: Find something prettier (maybe personal)
          examples: ['open www.fiicode.com'],
          match: {
            'open $param1Url': {
              goToConversationStep: 1,
              goToConversationParams: [ '$param1' ],
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
                  goToConversationStep: 2,
                  goToConversationParams: [ '$param1' ]
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
              goToConversationStep: 1,
              goToConversationParams: [ '$param1' ]
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
                  // TODO: Maybe goToStep instead of goToConversationStep
                  goToConversationStep: 2,
                  goToConversationParams: [
                    {
                      name: '$param2',
                      value: 'emag'
                    }
                  ]
                },
                2: { text: 'Buy $param1 from pcgarage', goToConversationStep: 2 },
                3: { text: 'No buy eine $param1, no bueno', goToConversationStep: 3}
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

  componentDidMount() {
  }

  replaceParamsInString(string, params) {
    console.log('replaceParamsInString', string, params);
    if (params) {
      params.forEach(param => {
        if (string.indexOf(param.name) !== -1) {
          string = string.replace(new RegExp(`\\${param.name}`, 'g'), param.value);
        }
      });
    }

    return string;
  }

  constructParamsFromGoToConversationParams(params, results) {
    let result = [];

    if (!params) {
      return null;
    }

    params.forEach(x => {
      let param = null

      // Already formatted as pretty param
      if (x.name) {
        param = x;
      } else {
        const no = parseInt(x.replace(/\$param/g, ''));

        if (results && results[no - 1]) {
          param = {
            name: x,
            value: results[no - 1].singular || results[no - 1].normal || results[no - 1]
          };
        }
      }

      if (param) {
        // TODO: Write as map, instead of forEach + push
        result.push(param);
      }
    });

    return result;
  }

  prettyFormatString(string) {
    // Remove articles
    string = string.replace(/\ (a|an|the)\ /g, ' ');

    return string;
  }

  matchFromString(match, matchKey, text, plugin, pluginKey) {
    let matchResult = nlp(text).match(matchKey);
    let result = [];

    result = result.concat(matchResult.nouns().data());
    result = result.concat(matchResult.urls().data());

    let matchForSort = {
      length: result.length,
      plugin: plugin,
      name: pluginKey
    };

    if (match.goToConversationStep) {
      matchForSort.step = match.goToConversationStep;
    }

    if (match.goToConversationParams) {
      matchForSort.params = this.constructParamsFromGoToConversationParams(match.goToConversationParams, result);
    }

    return matchForSort;
  }

  // TODO: Move from here to somewhere like "Start plugin"
  // Because this will be called on setState, it can lose state
  componentWillReceiveProps(nextProps) {
    if (!nextProps.input || !nextProps.settings) {
      return;
    }

    let matches = [];

    for (const pluginKey in nextProps.settings.plugins) {
      const plugin = nextProps.settings.plugins[pluginKey];

      for (let matchKey in plugin.match) {
        const match = plugin.match[matchKey];
        const matchKeyWithoutParams = matchKey.replace(/\$param[0-9]/g, '#');
        const text = this.prettyFormatString(nextProps.input.text);
        const matchForSort = this.matchFromString(match, matchKeyWithoutParams, text, plugin, pluginKey);

        matches.push(matchForSort);

        if (match.extraMatches) {
          console.log('Extra matches');
          match.extraMatches.forEach(extraMatch => {
            const extraMatchForSort = this.matchFromString(match, extraMatch.replace(/\$param[0-9]/g, '#'), text, plugin, pluginKey);

            console.log(match, extraMatch, text, plugin, pluginKey, extraMatchForSort);

            matches.push(extraMatchForSort);
          });
        }
      }
    }

    const bestPlugin = matches.sort((a, b) => a.length < b.length)[0];

    if (bestPlugin.length === 0) {
      this.setState({
        currentPlugin: null
      });
    } else  {
      this.setState({
        currentPlugin: Object.assign({}, {
          name: bestPlugin.name,
          step: bestPlugin.step ? bestPlugin.step : 1,
          params: bestPlugin.params ? bestPlugin.params : null
        }, bestPlugin.plugin)
      });
    }
  }

  goToConversationStep(option) {
    let plugin = this.state.currentPlugin;

    // TODO: Here, add params? (overwritting current params)
    plugin.step = option.goToConversationStep;
    const newParams = this.constructParamsFromGoToConversationParams(option.goToConversationParams);

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
      text.content = this.replaceParamsInString(text.content, params);

      contentText = (
        <div>
          <h4 className="u-m-0">{text.content}</h4>
        </div>
      )
    }

    return contentText;
  }

  renderOption(params, option) {
    const text = this.replaceParamsInString(option.text, params);

    let optionContent = text;

    let optionProps = {
      className: 'btn',
      onClick: this.goToConversationStep.bind(this, option)
    };

    let renderedOption = (
      <button {...optionProps}>
        {optionContent}
      </button>
    );

    if (option.href) {
      optionProps.target = '_blank';
      optionProps.href = this.replaceParamsInString(option.href, params);

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
        goToConversationStep: 'cancel'
      };

      options = Object.keys(options).map(key => options[key]);

      console.log(options);

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

  cheer() {
    const cheers = [
      'Awesome!', 'Amazing!', 'Yusss!', 'Yay!', 'Great!', 'Brilliant!',
      'Cool!', 'Fabulous!', 'Fantastic!', 'Groovy!', 'Marvelous!', 'Sweet!',
      'You rock!'
    ];

    const no = Math.floor(Math.random() * cheers.length);

    return cheers[no];
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
    // TODO: Create component with this rotating text stuff (ask Gabriel)
    examplesIndex: 0,
    examplesInterval: null
  };

  onInputChange(input) {
    // input.text, input.image
    this.setState({
      input: input
    });
  }

  onSettingsChange(settings) {
    // settings.plugins, settings.preferences
    let examples = null;

    if (settings && settings.plugins) {
      examples = Object.keys(settings.plugins)
      .map(key => settings.plugins[key])
      .reduce((a, b) => (a.examples || []).concat(b.examples || []));
    }

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
    return (
      <div className="component-App">
        <img src={logo} className="logo" />
        <Input onInputChange={this.onInputChange.bind(this)}/>
        <div className="component-examples">
          <h4 className="u-m-0">{this.state.examples ? ('Examples: ' + this.state.examples[this.state.examplesIndex]) : null}</h4>
        </div>
        <Settings onSettingsChange={this.onSettingsChange.bind(this)} />
        <Conversation input={this.state.input} settings={this.state.settings} />
      </div>
    );
  }
}

export default App;
