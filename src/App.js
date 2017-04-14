/*
FIICode

Identifica pe baza copertei, codului de bare categorii de obiecte
Folosind identificarea, se recomanda resure alternative de interes in functie de:
  - Disponsibiliatea in alt format (varianta pdf / epub), alte limbi
  - Pret
  - Calitate
  - Similaritate
  - Preferinte alte utilizatorului
*/
import React, { Component } from 'react';
import nlp from 'compromise';
import logo from './please_logo.png';
import './App.css';
import stringSimilarity from 'string-similarity';

// TODO: Timeout pasabil din setari
class RenderWithTimeout extends React.Component {
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

const config = {
  syntax: {
    //TODO: param: \$param // Add regexp for params here
  }
};

const examplesFromPlugins = (plugins) => {
  let examples = null;

  if (plugins) {
    examples = Object.keys(plugins)
    .map(key => plugins[key])
    .reduce((a, b) => (a.examples || []).concat(b.examples || []), []);
  }

  return examples;
};

const stringWithoutArticles = (string) => {
  return string.replace(/\ (a|an|the)\ /g, ' ');
};


const substituteParamsInString = (params = [], string = '') => {
  return params.reduce((str, param) => {
    return str.replace(new RegExp(`{${param.name}}`, 'g'), param.value);
  }, string);
};

const normalizeText = (text) => {
  if (text) {
    text = text.toLowerCase();
    text = stringWithoutArticles(text);
    text = nlp(text).normalize().sentences(0).out();
  }

  return text;
};

const matchFromString = (match, matchKey, input, plugin, pluginName) => {
  let result = [];
  const text = normalizeText(input.text);
  const matchWithoutParams = matchKey.replace(/\{(.+?)\}/g, '');

  let returnedMatch = {
    probability: stringSimilarity.compareTwoStrings(text, matchWithoutParams),
    plugin: plugin,
    name: pluginName
  };

  if (match.step) {
    returnedMatch.step = match.step;
  }

  const splittedText = text.split(' ');
  const paramRegExp = new RegExp(/\{(.+?)\}/, 'g');
  const params = matchKey.split(' ')
  .map((word, index) => {
    if (paramRegExp.test(word)) {
      return {
        name: word.replace(/[\{\}]/g, ''),
        value: splittedText[index]
      };
    }
  })
  .filter(param => param);

  returnedMatch.params = params;

  return returnedMatch;
}

const pluginMatchesForInput = (plugins, input) => {
  let res = [];

  Object.keys(plugins)
  .map(pluginKey => {
    const plugin = plugins[pluginKey];

    Object.keys(plugin.match)
    .map(matchKey => {
      const match = plugin.match[matchKey];
      res = (res || []).concat(matchFromString(match, matchKey, input, plugin, pluginKey));

      if (match.extraMatches) {
        res = (res || []).concat(match.extraMatches.map(extraMatch => {
          return matchFromString(match, matchKey, input, plugin, pluginKey);
        }));
      }

      return res;
    });
  });

  return res;
};

/*
TODO Make it work with lots of messages (now it's being cut off because of flex)
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
//TODO: REALLY REALLY GOOD DOCUMENTATION PAGE
//TODO: https://dev.to/andraconnect/augmented-reality-in-10-lines-of-html
//TODO: FIX CONSOLE ERRORS!!!!!
//TODO: FIX CONSOLE ERRORS!!!!!
//TODO: FIX CONSOLE ERRORS!!!!!
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
//TODO: customizableParams (list of params that can be passed & stored in Firebase, from the settings view)
//TODO: Color picker to change chat colors
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
  onInputChange: () => {}
};

class Settings extends Component {
  componentDidMount() {
    this.onSettingsChange();
  }

  onSettingsChange() {
    this.props.onSettingsChange({
      pluginMatchProbabilityThreshold: 0.5,
      user: {
        profile: {
          image: 'http://stefanmoraru.ro/assets/me.jpg'
        }
      },
      plugins: {
        //TODO: Location app, npl has .places()
        //TODO: visit #Noun will show google maps
        //TODO: Add 'cancel' as conversation step to represent canceling
        //TODO: Add parameter regexp so you can do singular words on inputs
        'book': {
          title: 'Book recommendation',
          examples: ['i want to read a book like 978-0141329383'],
          init: {
            ABCparams: {
              'isbn': {
                ABCquery: {
                  ABCurl: 'http://../api/book',
                  ABCqueryParams: {
                    'isbn': '{isbn}',
                    'type': 'comedy'
                  }
                }
              }
            }
          },
          match: {
            'i want to read book like {isbn}': {
              step: 1
            }
          },
          conversation: {
            2: {
              text: 'Step 2', options: { 1: { button: { text: 'hi 2', step: 3 } } }
            },
            3: {
              text: 'Step 3', options: { 1: { button: { text: 'hi 3' }, step: 4 } }
            },
            4: {
              text: 'Step 4', options: { 1: { button: { text: 'hi 4' }, step: 5  } }
            },
            5: {
              text: 'Step 5', options: { 1: { button: { text: 'ok, chill' }, step: 6  } }
            },
            1: {
              text: 'Hello! Looks like your are trying to find something related to a book like {isbn}',
              options: {
                // TODO: Option type input that goes to param
                1: {
                  button: {
                    text: 'Find the exact book on Emag',
                    href: 'www.emag.ro/search/{isbn}'
                  }
                },
                2: {
                  input: {
                    placeholder: 'ex: 123456789',
                    label: 'Try another book',
                    param: 'isbn'
                  },
                  step: 1
                },
                3: { button: { text: 'Try another store' }, step: 3 },
              }
            }
          },
          image: 'https://upload.wikimedia.org/wikipedia/commons/6/61/Book-icon-orange.png'
        }
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

  startBestMatchingPlugin(input, settings) {
    if (!input || !settings || (settings && !settings.plugins)) {
      return;
    }

    const plugins = settings.plugins;
    const matches = pluginMatchesForInput(plugins, input);
    const bestPlugin = matches.sort((a, b) => a.probability < b.probability)[0];

    let currentPlugin = null;

    if (bestPlugin.probability >= settings.pluginMatchProbabilityThreshold) {
      currentPlugin = Object.assign({}, {
        name: bestPlugin.name,
        step: bestPlugin.step ? bestPlugin.step : 1,
        params: bestPlugin.params ? bestPlugin.params : null,
        history: []
      }, bestPlugin.plugin);
    }

    this.setState({
      currentPlugin: currentPlugin,
      settings: settings
    });
  }

  componentWillReceiveProps(nextProps) {
    // The Conversation component takes an input and a list of settings
    const input = nextProps.input;
    const settings = nextProps.settings;

    if (this.props !== nextProps) {
      this.startBestMatchingPlugin(input, settings);
    }
  }

  changeStep(option) {
    if (option) {
      let plugin = this.state.currentPlugin;

      plugin.history = (plugin.history || [])
      .concat({
        step: plugin.step,
        params: plugin.params,
        plugin: Object.assign({}, plugin),
        settings: Object.assign({}, this.state.settings)
      });

      plugin.step = option.step;

      this.setState({
        currentPlugin: plugin
      });
    }
  }

  renderConversationStepText(text, params) {
    let contentText = null;

    if (text) {
      text = substituteParamsInString(params, text);

      contentText = (
        <div>
          <h4 className="u-m-0">{text}</h4>
        </div>
      );
    }

    return contentText;
  }

  updateParamAndChangeStep(option, input) {
    let plugin = this.state.currentPlugin;
    let name = option.input.param;
    console.log('updateParamAndChangeStep', name, option, input, plugin);

    name = `${name}`;

    plugin.params = (plugin.params || [])
    .filter(param => {
      return param.name !== name;
    })
    .concat({
      name: name,
      value: input.text
    });

    console.log('updateParamAndChangeStep', name, option, input, plugin);

    this.setState({
      plugin: plugin
    }, () => {
      console.log('updateParamAndChangeStep', 'changeStep', option);
      this.changeStep(option);
    });
  }

  // TODO: Stateless components for options
  // TODO: Stateless components for conversation steps
  // TODO: Stateless components in separate folder, make them really short and easy to understand :*
  renderOption(params, option) {
    let renderedOption = null;

    if (option.button) {
      let optionContent = option.button.text;

      renderedOption = (
        <button className="btn" onClick={this.changeStep.bind(this, option)}>
          {optionContent}
        </button>
      );

      if (option.button.href) {
        let href = substituteParamsInString(params, option.button.href);

        if (href.indexOf('http') === -1) {
          href = `http://${href}`;
        }

        renderedOption = (
          <a target="_blank" href={href}>
            {renderedOption}
          </a>
        );
      }
    } else if (option.icon) {
      renderedOption = (
        <div className="component-Input__cancel" onClick={this.changeStep.bind(this, option)}>
          Cancel <i className={option.icon} />
        </div>
      );
    } else if (option.input) {
      renderedOption = (
        <Input label={option.input.label} placeholder={option.input.placeholder} onInputSubmit={this.updateParamAndChangeStep.bind(this, option)} />
      );
    }

    return (
      <div className="component-Conversation__step__options__option">
        {renderedOption}
      </div>
    );
  }

  renderConversationStepOptions(options, params) {
    let rendered = null;

    if (options) {
      if (!options.cancel) {
        options.cancel = {
          icon: 'ion-close-circled',
          step: 'cancel'
        };
      }

      // TODO: Order them
      // Types: button, input, cancel

      options = Object.keys(options)
      .map(key => options[key])
      .sort((a, b) => {
        console.log(a, b);
        if (a.input) return 1;
        if (b.input) return 1;
        if (a.button) return 0;
        if (b.button) return 0;
        if (a.cancel) return -1;
        if (b.cancel) return -1;
      });

      console.log('sorted', options);

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

  renderConversationStep(step, params, plugin, settings, fromHistory = false) {
    let content = null;
    let contentText = <h4>Thank you for using Please!</h4>;
    let contentOptions = null;

    if (step) {
      contentText = step.text ? this.renderConversationStepText(step.text, params) : null;
      contentOptions = step.options ? this.renderConversationStepOptions(step.options, params) : null;
    }

    const contentBot = (
      <div className="component-Conversation__step__bot">
        <img src={plugin.image} />
      </div>
    );

    const contentUser = (
      <div className="component-Conversation__step__bot right">
        <img src={settings.user.profile.image} />
      </div>
    );

    const _contentText = !contentText ? null : (
      <div className="component-Conversation__step">
        <div className="component-Conversation__step__content">
          {contentBot}
          <RenderWithTimeout timeout={500} loader={true} enabled={!fromHistory}>
            {contentText}
          </RenderWithTimeout>
        </div>
      </div>
    );

    const _contentOptions = !contentOptions ? null : (
      <RenderWithTimeout timeout={1500}>
        <div className="component-Conversation__step right">
          <div className="component-Conversation__step__content">
            {contentUser}
            <RenderWithTimeout timeout={500} loader={true} enabled={!fromHistory}>
              {contentOptions}
            </RenderWithTimeout>
          </div>
        </div>
      </RenderWithTimeout>
    );

    return (
      <div>
        {_contentOptions}
        {_contentText}
      </div>
    );
  }

  renderConversation(plugin, settings) {
    let content = null;
    let history = null

    if (plugin && plugin.conversation) {
      if (plugin.history) {
        history = plugin.history.map(snapshot => {
          return this.renderConversationStep(snapshot.plugin.conversation[snapshot.step], snapshot.params, snapshot.plugin, snapshot.settings);
        }).reverse();
      }

      content = this.renderConversationStep(plugin.conversation[plugin.step], plugin.params, plugin, settings);
    } else {
      content = null;
    }

    return (
      <div>
        {content}

        <div className="history">
          {history}
        </div>
      </div>
    );
  }

  render() {
    const conversation = this.renderConversation(this.state.currentPlugin, this.state.settings);

    return (
      <div className="component-Conversation">
        {conversation}
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

  componentDidMount() {
    this.onInputChange({
      text: "I want to read a book like 1234"
    });
  }

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
    const example = this.state.examples ? this.state.examples[this.state.examplesIndex] : null;
    const label = this.state.input ? null : "Please";

    const contentClassname = `component-App__content `;

    // TODO: Pretty logo
    // <img src={logo} className="logo" />
    return (
      <div className="component-App">
        <div className="component-App__content">
          <Input onInputChange={this.onInputChange.bind(this)} placeholder={example} label={label} />
          <Settings onSettingsChange={this.onSettingsChange.bind(this)} />
          <Conversation input={this.state.input} settings={this.state.settings} />
        </div>
      </div>
    );
  }
}

export default App;

/*
TODO: Presentation

Lots of use cases (maybe kickstarter video)
Chat colors
Serious voice
Technical: BEM syntax
Timeoutul de la conversatii este bagat din cod, se misca rapid oricum
*/
