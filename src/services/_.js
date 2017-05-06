const stringSimilarity = require('string-similarity');
const request = require('superagent');
const superagentjsonp = require('superagent-jsonp');
const _get = require('lodash.get');
const _shuffle = require('lodash.shuffle');
const firebase = require('firebase');

const GOOGLE_API_KEY = "AIzaSyDScKGu3VK7x27dk0E4bmdiSmP9dsC-cLU";

const config = {
  apiKey: "AIzaSyCu0XbFuJhRGh8dMZJHmuuV9EwsLFPRMa4",
  authDomain: "please-1bc46.firebaseapp.com",
  databaseURL: "https://please-1bc46.firebaseio.com",
  projectId: "please-1bc46",
  storageBucket: "please-1bc46.appspot.com",
  messagingSenderId: "347066864046"
};

firebase.initializeApp(config);

let provider = new firebase.auth.FacebookAuthProvider();

provider.addScope('email');

provider.setCustomParameters({
  'display': 'popup'
});

const fb_onValue = (ref, cb) => {
  firebase.database().ref(ref)
  .on('value', (snapshot) => {
    cb(snapshot.val());
  });
};

const fb_set = (ref, data) => {
  firebase.database().ref(ref)
  .set(data);
};

const fb_login = () => {
  return firebase.auth().signInWithPopup(provider).then(function(result) {
    // This gives you a Facebook Access Token. You can use it to access the Facebook API.
    return {
      profile: {
        email: result.user.email,
        name: result.user.displayName,
        image: result.user.photoURL
      },
      token: result.credential.accessToken
    };
  }).catch(function(error) {
    console.error(error);
  });
};

const removeHTMLEntities = (string = '') => {
  string = string.replace(/&amp;/g, '&');

  return string;
};

const infoFromKnowledgeGraph = (ids, query) => {
  let URL = "https://kgsearch.googleapis.com/v1/entities:search?"

  URL = `${URL}&key=${GOOGLE_API_KEY}`;

  if (ids) {
    URL = `${URL}&ids=${ids}`;
  }

  if (query) {
    URL = `${URL}&query=${query}`;
  }

  return new Promise((resolve, reject) => {
    request
    .get(URL)
    .set('Content-Type', 'application/json')
    .end(function(err, resp) {
      if (err) {
        return reject(err);
      }

      let result = {};

      try {
        const returned = resp.body.itemListElement[0].result;

        result = {
          category: returned.description.split(' ').reverse()[0].toLowerCase(),
          categoryDescription: returned.detailedDescription.articleBody,
          image: (returned.image || {}).url,
          name: returned.name.toLowerCase()
        };
      } catch(e) {
        return reject(e);
      }

      return resolve(result);
    });

  });
};

const examplesFromPlugins = (plugins) => {
  let examples = null;

  if (plugins) {
    examples = _shuffle(Object.keys(plugins)
    .map(key => plugins[key].examples)
    .reduce((ex, a) => ex.concat(a || []), []));
  }

  return examples;
};

const stringWithoutArticles = (string) => {
  return string.replace(/ (a|an|the) /g, ' ');
};

const substituteParamInString = (name, value, string = '') => {
  string = string
  .split(' ')
  .map(word => {
    if (word.indexOf('{') !== -1 && word.indexOf('}') !== -1) {
      // Word could be {isbn} or www.emag.ro/{isbn}
      let param = word.replace(/.*{/g, '{').replace(/}.*/g, '}');

      const paramName = (param.split('#')[0] || '').replace(/[{}]/g, '');
      const get = (param.split('#')[1] || '').replace(/[{}]/g, '');

      if (name === paramName) {
        if (get) {
          value = _get(value, get);
          word = word.replace(/#.*}/g, '}');
        }

        word = word.replace(new RegExp(`{${name}}`, 'g'), value);
      }
    }

    return word;
  })
  .join(' ')

  /* if (typeof value === 'string' || typeof value === 'number') {
    string = string.replace(new RegExp(`{${paramName}}`, 'g'), value);
  } else if (Array.isArray(value)) {
    console.log('bwah', value);
    string = string.replace(new RegExp(`{${paramName}}`, 'g'), value.join(', '));
  } */

  return string;
};

const substituteParamsInString = (params = [], string = '') => {
  return Object.keys(params).reduce((str, paramName) => {
    return substituteParamInString(paramName, params[paramName].value, str);
  }, string);
};

const normalizeText = (text) => {
  if (text) {
    text = text.toLowerCase();
    //text = stringWithoutArticles(text);
    //text = nlp(text).normalize().sentences(0).out();
  }

  return text;
};

const matchFromString = (match, matchKey, input, plugin, pluginName) => {
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

  let _params = {};

  matchKey.split(' ')
  .forEach((word, index) => {
    if (paramRegExp.test(word)) {
      _params[word.replace(/[{}]/g, '')] = {
        value: splittedText[index]
      };
    }
  });

  returnedMatch.params = _params;

  return returnedMatch;
}

const pluginMatchesForInput = (plugins, input) => {
  let res = [];

  if (!plugins) {
    return [];
  }

  Object.keys(plugins)
  .map(pluginKey => {
    const plugin = plugins[pluginKey];

    return Object.keys(plugin.match)
    .map(matchKey => {
      const match = plugin.match[matchKey];
      res = (res || []).concat(matchFromString(match, matchKey, input, plugin, pluginKey));

      if (match.extraMatches) {
        res = (res || []).concat(match.extraMatches.map(extraMatch => {
          return matchFromString(match, extraMatch, input, plugin, pluginKey);
        }));
      }

      return res;
    });
  });

  return res;
};

const bestPluginMatch = (settings, input) => {
  const plugins = settings.plugins;

  const matches = pluginMatchesForInput(plugins, input);
  const bestPlugin = matches.sort((a, b) => {
    if (a.probability < b.probability) {
      return 1;
    } else {
      return -1;
    }
  })[0];

  let currentPlugin = null;

  if (!bestPlugin) {
    return {};
  }

  if (bestPlugin.probability >= settings.pluginMatchProbabilityThreshold) {
    currentPlugin = Object.assign({}, {
      name: bestPlugin.name,
      step: bestPlugin.step ? bestPlugin.step : 1,
      params: bestPlugin.params ? bestPlugin.params : null,
      history: []
    }, bestPlugin.plugin);

    Object.keys(bestPlugin.plugin.conversation)
    .forEach(key => {
      currentPlugin.conversation[key].queryDone = false;
    });

    currentPlugin.conversation.cancel = currentPlugin.conversation.cancel ? currentPlugin.conversation.cancel : {
      text: 'Oh no! Hopefully we were able to help'
    };
  }

	return Object.assign({}, currentPlugin);
};

const pluginAtStep = (plugin, option) => {
  if (option) {
    plugin.history = (plugin.history || [])
    .concat({
      step: plugin.step,
      params: Object.assign({}, plugin.params),
      plugin: Object.assign({}, plugin)
    });

    plugin.step = option.step;

    if (plugin.conversation[plugin.step]) {
      plugin.conversation[plugin.step].queryDone = false;
    }

    const query = plugin.conversation[plugin.step].query;

    if (query) {
      delete plugin.params[query.fill.replace(/[{}]/g, '')];
    }
	}

	return plugin;
};

const sortOptions = (options) => {
  return options;

  return options
  .sort((a, b) => {
    if (a.video) return 1;
    if (b.video) return 1;
    if (a.image) return 1;
    if (b.image) return 1;
    if (a.input) return 1;
    if (b.input) return 1;
    if (a.button) return 0;
    if (b.button) return 0;
    if (a.icon) return -1;
    if (b.icon) return -1;

    return -1;
  });
};

const pluginWithUpdatedParam = (plugin, stepKey, paramName, value) => {
  plugin.params[paramName] = {
    value: value
  };

  plugin.conversation[stepKey].queryDone = true;

	return plugin;
};

const pluginWithUpdatedParamAndStep = (plugin, stepKey, paramName, value) => {
	let _plugin = pluginAtStep(plugin, { step: stepKey });

  _plugin.params[paramName] = {
    value: value
  };

  return _plugin;
};

const emptyPlugin = (plugin) => {
	return (!plugin || (plugin && !plugin.name));
};

const removeBrackets = (string) => {
  return string && string.replace(/[{}]/g, '');
};

const query = (plugin, step) => {
  return new Promise((resolve, reject) => {
    const query = step.query;
    const queryParams = substituteParamsInString(plugin.params, query.params);
    const queryUrl = `${query.url}?${queryParams}`;

    request[query.method.toLowerCase()](queryUrl)
    .use(superagentjsonp({
      timeout: 10000
    }))
    .then((response) => {
      resolve(pluginWithUpdatedParam(plugin, step.key, query.fill.replace(/[{}]/g, ''),  _get(response.body, query.responsePath)));
    }, (error) => {
      reject(error);
    })
  });
};

const _currentStep = (plugin) => {
  if (!plugin || (plugin && !plugin.step) || (plugin && !plugin.conversation)) {
    return null;
  };

  let ok = false;
  let step = null;

  while (ok === false) {
    step = plugin.conversation[plugin.step];

    if (step && step.jumpToStep) {
      plugin.step = step.jumpToStep;
    } else {
      ok = true;
    }
  }

  return Object.assign({}, step, {
    key: plugin.step
  });
};

// TODO: Refactor this to multiple smaller functions
const _formatStep = (step, params, continueBase) => {
  if (!step) {
    return {};
  }

  let result = {};

  result.text = step.text;
  result.markdown = step.markdown;
  result.image = step.image;

  if (step.options) {
    result.options = Object.keys(step.options).map(optionKey => {
      let option = step.options[optionKey];
      let data = {};

      data.title = option.title;
      data.continue = continueBase ? `${continueBase}/${option.step}` : undefined;

      if (option.generate) {
        const param = params[removeBrackets(option.generate)];

    		if (param && param.value && param.value.length > 0) {
    			let items = param.value;

          items = option.generateReverse ? items.reverse() : items;
  				items = option.generateLimit ? items.slice(0, option.generateLimit) : items;

          data.similar = items;

          if (option.video) {
            data.similar = data.similar.map(item => ({
              video: _get(item, option.video.path)
            }));
          } else if (option.button) {
            data.similar = data.similar.map(item => ({
              url: _get(item, option.button.href),
              text: _get(item, option.button.text)
            }));
          }
        }
      }

      return data;
    });
  }

  return result;
};

/* "youtubevideos": {
"title": "Bands",
                        "video": {
                        "path": "yUrl"
                        },
"generate": "{matchingBands}",
"generateLimit": 4,
"generateDefault": "Looks like we could not find anything",
"step": "done"
},
"links": {
"title": "List of bands",
                        "button": {
                        "text": "Name",
                        "href": "wUrl",
                        "maintainStep": true
                        },
"generate": "{matchingBands}",
"generateLimit": 4,
"generateDefault": "Looks like we could not find anything",
"step": "done"
}, */

//button { text href }
//input { placeholder param }
//title, step la toate
//generate video / button
/* "title": "Program name",
"input": {
"placeholder": "ex: Firefox",
"param": "{program}"
},
"step": "rec3" */

module.exports = {
  _formatStep,
  _currentStep,
  query,
  emptyPlugin,
  removeBrackets,
  removeHTMLEntities,
	examplesFromPlugins,
	stringWithoutArticles,
	substituteParamsInString,
	normalizeText,
	matchFromString,
	pluginMatchesForInput,
  bestPluginMatch,
  pluginAtStep,
  sortOptions,
  pluginWithUpdatedParam,
  pluginWithUpdatedParamAndStep,
  infoFromKnowledgeGraph,
  fb_login,
  fb_onValue,
  fb_set
};
