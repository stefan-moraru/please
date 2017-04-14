import nlp from 'compromise';
import stringSimilarity from 'string-similarity';
import _get from 'lodash.get';

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
  return string.replace(/ (a|an|the) /g, ' ');
};

const substituteParamInString = (name, value, string = '') => {
  string = string
  .split(' ')
  .map(word => {
    if (word.indexOf('{') !== -1 && word.indexOf('}') !== -1) {
      let paramName = word.split('#')[0];
      const get = word.split('#')[1];

      paramName = paramName.replace(/.*{/g, '');
      paramName = paramName.replace(/}.*/g, '');

      if (name === paramName) {
        if (get) {
          value = _get(value, get.replace(/[{}]/g, ''));
          word = word.replace(/#.*}/g, '}');
        }

        // TODO: Support other types of params, like objects, arrays
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
    text = stringWithoutArticles(text);
    text = nlp(text).normalize().sentences(0).out();
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
  // TODO: Can we improve this? It currently works just for singleword params

  // TODO: Improve
  let _params = {};

  const params = matchKey.split(' ')
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
          return matchFromString(match, matchKey, input, plugin, pluginKey);
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

	return Object.assign({}, currentPlugin);
};

const pluginAtStep = (plugin, option) => {
  if (option) {
    plugin.history = (plugin.history || [])
    .concat({
      step: plugin.step,
      params: plugin.params,
      plugin: Object.assign({}, plugin)
    });

    plugin.step = option.step;

    plugin.conversation[plugin.step].queryDone = false;
	}

	return plugin;
};

const sortOptions = (options) => {
  return Object.keys(options)
  .map(key => options[key])
  .sort((a, b) => {
    if (a.input) return 1;
    if (b.input) return 1;
    if (a.button) return 0;
    if (b.button) return 0;
    if (a.cancel) return -1;
    if (b.cancel) return -1;

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
  plugin.params[paramName] = {
    value: value
  };

	return pluginAtStep(plugin, { step: stepKey });
};

export default {
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
  pluginWithUpdatedParamAndStep
};
