/*
FIICode

Identifica pe baza copertei, codului de bare categorii de obiecte
Folosind identificarea, se recomanda resure alternative de interes in functie de:
  - Disponsibiliatea in alt format (varianta pdf / epub), alte limbi
  - Pret
  - Calitate
  - Similaritate
  - Preferinte alte utilizatorului

  Muzica
  Articol alimentar
  Continut vitamine
  Produs pret
*/
import React, { Component } from 'react';
import Input from './Input';
import Settings from './Settings';
import Conversation from './Conversation';
import ReactTooltip from 'react-tooltip';
import _ from '../services/_';
import '../styles/App.css';

class App extends Component {
  state = {
    input: null,
    settings: null,
    //TODO: Create component with this rotating text stuff (ask Gabriel)
    examplesIndex: 0,
    examplesInterval: null
  };

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
    const example = this.state.examples ? this.state.examples[this.state.examplesIndex] : null;
    const label = null;

    const InputProps = {
      onInputChange: this.onInputChange.bind(this),
      placeholder: example,
      label: label,
      suggestions: this.state.examples,
      suggestionsEnabled: true
    };

    // TODO: Pretty logo
    return (
      <div className="component-App">
        <div className="component-App__content">
          <div className="main">
            <Input {...InputProps} />
          </div>
          <Settings onSettingsChange={this.onSettingsChange.bind(this)} />
          <Conversation input={this.state.input} settings={this.state.settings} />
        </div>
      </div>
    );
  }
}

export default App;

/*
TODO: const config = { syntax: { //TODO: param: \$param // Add regexp for params here } };
TODO: REALLY REALLY GOOD DOCUMENTATION PAGE
TODO: https://dev.to/andraconnect/augmented-reality-in-10-lines-of-html
TODO: FIX CONSOLE ERRORS!!!!!
TODO: RECOMANDARIIII!!!!!
TODO: Make the app work offline (+++++)
TODO: Improve logo
TODO: Name & Favicon
TODO: customizableParams (list of params that can be passed & stored in Firebase, from the settings view)
TODO: Demo for Particle with a plugin (emit a http event, turn on a internet button led rid)
TODO: Make it more conversational
TODO: 100% test coverage (https://www.codacy.com/app/spencerkelly86/compromise/dashboard)
TODO: Add popup hints like Hi, you could try that
TODO: Interactive guide? Nice
TODO: Handle stuff like 'Hello', 'Hi' (plugin with that)
TODO: Generate different gradient for background (https://uigradients.com) (warmer)
TODO: plugin 'recipes like pasta'
TODO: Add linter
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
I want to buy a horse
Show me information about Romania
Exchange 1 leu in euro
JSON encode { abc: 1 }
Travel to Ibiza
Find me an apartment with 3 rooms

Debouce on input that triggers the parsing of the plugins
https://www.npmjs.com/package/huh
DESCRIPTIVE ERRORS1!!!!
tot proiectul sa fie un json (logo, style etc tot)

TODO: Presentation

Lots of use cases (maybe kickstarter video)
Chat colors
Serious voice
Technical: BEM syntax
Timeoutul de la conversatii este bagat din cod, se misca rapid oricum
De scos in evidenta faptul ca folosim obiecte si nu vectori (printscreenuri la cum ajuta, fara filter etc, before & after)
In prezentare parte scurta din ce facea IronMan
*/
