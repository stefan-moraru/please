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
        'movies': {
          title: "Movie offers you can't refuse",
          image: 'http://icons.iconarchive.com/icons/designbolts/free-multimedia/1024/Clapper-icon.png',
          match: {
            'i want to watch a movie like {movie}': {
              step: 'recommendations1',
              extraMatches: [
                'watch a movie like {movie}',
                'recomment me a movie like {movie}'
              ]
            }
          },
          conversation: {
            recommendations1: {
              text: 'Show me the money!',
              jumpToStep: 'recommendations2',
              jumpToStepDelay: 2000,
              options: {
                1: {
                  video: {
                    id: 'mayliqsE8J8'
                  }
                }
              }
            },
            recommendations2: {
              text: "Let's find some good movies for you",
              jumpToStep: 'recommendations3',
              jumpToStepDelay: 2500
            },
            recommendations3: {
              text: "So you want something like {movie}. Let's see what I can find",
              jumpToStep: 'recommendations4',
              jumpToStepDelay: 3000
            },
            recommendations4: {
              text: "Heya"
            }
          },
          examples: [
            'i want to watch a movie like fightclub',
            'recommend me a movie like godfather'
          ]
        },
        'food': {
          title: 'All about food',
          image: 'https://cdn0.iconfinder.com/data/icons/kameleon-free-pack-rounded/110/Food-Dome-512.png',
          examples: [
            'food like pasta',
            'i want to eat something like meatloaf',
            'i am hungry for chips',
            'need help cooking some pancakes'
          ],
          match: {
            'food like {food}': {
              step: 'initial',
              extraMatches: [
                'i want to eat something like {food}',
                'i am hungry for {food}',
                'snack like {food}'
              ]
            },
            'need help cooking some {food}': {
              step: 'helpcooking'
            }
          },
          conversation: {
            initial: {
              text: 'Hello, dear hungry friend!',
              jumpToStep: 'search',
              jumpToStepDelay: 1000
            },
            helpcooking: {
              text: "Amazing! Do you need help cooking it?",
              options: {
                videotutorials: {
                  title: "Let's see if this helps",
                  button: {
                    text: 'Video tutorials',
                    href: 'www.youtube.com/results?search_query=how+to+cook+{food}'
                  },
                  step: 'done'
              		//https://www.googleapis.com/youtube/v3/search?part=snippet&key=AIzaSyDScKGu3VK7x27dk0E4bmdiSmP9dsC-cLU&maxResults=5&type=video
                },
                texttutorials: {
                  button: {
                    text: 'Text tutorials',
                    href: 'http://www.wikihow.com/wikiHowTo?search={food}'
                  },
                  step: 'done'
                },
                recipes: {
                  button: {
                    text: 'Recipes',
                    href: 'http://www.food.com/search/{food}'
                  }
                }
              }
            },
            search: {
              text: "I see that you are looking for {food}-like food. Amazing! We've got exactly what you need",
              query: {
                url: 'http://www.recipepuppy.com/api/?callback=callback',
                method: 'GET',
                params: 'q={food}&limit=4',
                fill: '{foodRecommendations}',
                responsePath: 'results'
              },
              options: {
								generated: {
                  title: "Have a look at what we've found",
									button: {
										text: 'title',
										href: 'href',
                    image: 'thumbnail'
									},
									generate: '{foodRecommendations}',
                  generateLimit: 4,
                  generateDefault: 'Looks like we could not find anything',
									step: 'helpcooking'
                },
                again: {
                  title: 'Try again with a different search option',
                  input: {
                    placeholder: 'ex: chicken',
                    param: '{food}'
                  },
                  step: 'search'
                },
                manual: {
                  title: 'You can manually search for recipes online',
                  button: {
                    text: 'Find recipes online',
                    href: 'www.food.com/search/{food}'
                  },
                  step: 'helpcooking'
                }
              }
            },
            done: {
              text: 'Thanks for eating with us!'
            }
          }
        },
        'book': {
          title: 'Book recommendation',
          examples: [
            'i want to read a book like 978-0141329383',
            'recommend me a book like 978-0141329383'
          ],
          match: {
            'i want to read book like {isbn}': {
              step: 1,
              extraMatches: ['book {isbn}', 'recommend me a book like {isbn}']
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
    return null;

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
