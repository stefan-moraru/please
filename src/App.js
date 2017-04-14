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
import Input from './components/Input';
import Settings from './components/Settings';
import Conversation from './components/Conversation';
import _ from './services/_';
import './App.css';

class App extends Component {
  state = {
    input: null,
    settings: null,
    //TODO: Create component with this rotating text stuff (ask Gabriel)
    examplesIndex: 0,
    examplesInterval: null
  };

  componentDidMount() {
    //TODO: Remove
    this.onInputChange({
      text: "I want to read a book like 1234"
    });
  }

  onInputChange(input) {
    this.setState({
      input: input
    });
  }

  onSettingsChange(settings) {
    let examples = _.examplesFromPlugins(settings ? settings.plugins : null)

    this.setState({
      settings: settings,
      examples: examples
    });
  }

  render() {
    // TODO: Examples inside Input component
    const example = this.state.examples ? this.state.examples[this.state.examplesIndex] : null;
    const label = this.state.input ? null : "Please";

    // TODO: Pretty logo
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
TODO: IMPORTANT: Externalize as many functions as possible, to make this extensible (extract logic)
TODO: const config = { syntax: { //TODO: param: \$param // Add regexp for params here } };
TODO: Make it work with lots of messages (now it's being cut off because of flex)
TODO: REALLY REALLY GOOD DOCUMENTATION PAGE
TODO: https://dev.to/andraconnect/augmented-reality-in-10-lines-of-html
TODO: FIX CONSOLE ERRORS!!!!!
TODO: RECOMANDARIIII!!!!!
TODO: Use Monstreall font (same one as photon web setup)
TODO: Make the app work offline (+++++)
TODO: Improve logo
TODO: Make input & button the same length as the conversation box
TODO: Name & Favicon
TODO: customizableParams (list of params that can be passed & stored in Firebase, from the settings view)
TODO: Color picker to change chat colors
TODO: Demo for Particle with a plugin (emit a http event, turn on a internet button led rid)
TODO: Add "set=$paramX" option to options, they will update the value of the param in state { "set=$paramX,1234",}
TODO: Make it more conversational
*/

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

/*
TODO: Presentation

Lots of use cases (maybe kickstarter video)
Chat colors
Serious voice
Technical: BEM syntax
Timeoutul de la conversatii este bagat din cod, se misca rapid oricum
*/
