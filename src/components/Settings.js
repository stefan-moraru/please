import React, { Component } from 'react';
import Hexagon from './Hexagon';

export default class Settings extends Component {
  componentDidMount() {
    this.onSettingsChange();
  }

  onSettingsChange() {
    this.props.onSettingsChange({
      pluginMatchProbabilityThreshold: 0.3,
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
          match: {
            'i want to read book like {isbn}': {
              step: 1,
              extraMatches: ['book {isbn}']
            }
            //TODO: Transform to object
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
              //TODO: More types (image or markdown)
              text: 'Hello! Looks like your are trying to find something related to a book like {isbn}. One recommendation would be {recommendations#[0].Name}',
              query: {
                url: 'http://localhost:8882/recommend',//'http://tastedive.com/api/similar',
                method: 'GET',
                params: 'q={isbn}',
                fill: '{recommendations}',
                // TODO: Improve naming
                responsePath: 'Similar.Info'
              },
              options: {
                // TODO: Option type input that goes to param
                1: {
                  title: 'From store',
                  button: {
                    text: 'Find the exact book on Emag',
                    href: 'www.emag.ro/search/{isbn}'
                  }
                },
                2: {
                  title: 'Try to find another book',
                  input: {
                    placeholder: 'ex: 123456789',
                    label: 'Try another book',
                    param: '{isbn}'
                  },
                  step: 1
                },
                3: { button: { text: 'Try another store' }, step: 3 },
								4: {
									button: {
										text: 'Name',
										href: 'Url',
										generate: '{recommendations}'
									},
									step: 3
								}
              }
            }
          },
          image: 'https://upload.wikimedia.org/wikipedia/commons/6/61/Book-icon-orange.png'
        }
      }
    });
  }

  render() {
		//TODO: Settings panel with list of plugins and stuff (store them in firebase)
    return (
      <div>
        {/*<Hexagon backgroundUrl="" width="200" height="400" />
        <Hexagon backgroundUrl="" width="200" height="400" />*/}

        <div className="hexagonsRow">
          <div className="hexagon"></div>
          <div className="hexagon"></div>
        </div>

        <div className="hexagonsRow">
          <div className="hexagon"></div>
        </div>
       
      </div>
    );
  }
}
