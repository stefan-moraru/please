import stringSimilarity from 'string-similarity';
import request from 'superagent';
import _get from 'lodash.get';
import _shuffle from 'lodash.shuffle';
import firebase from 'firebase';

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

  console.log('Got list of matches', matches);
  console.log(bestPlugin);

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

export default {
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
