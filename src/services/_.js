import nlp from 'compromise';
import stringSimilarity from 'string-similarity';

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

const substituteParamsInString = (params = [], string = '') => {
  return params.reduce((str, param) => {
    // TODO: Support other types of params, like objects, arrays
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
    let param = null;

    if (paramRegExp.test(word)) {
      param = {
        name: word.replace(/[{}]/g, ''),
        value: splittedText[index]
      };
    }

    return param;
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

	return currentPlugin;
};

const pluginAtStep = (plugin, settings, option) => {
  if (option) {
    plugin.history = (plugin.history || [])
    .concat({
      step: plugin.step,
      params: plugin.params,
      plugin: Object.assign({}, plugin),
      settings: Object.assign({}, settings)
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
  // TODO: Make plugins an object, key - value
  plugin.params = (plugin.params || []).concat({
    name: paramName,
    value: value
  });

  plugin.conversation[stepKey].queryDone = true;

	return plugin;
};

const pluginWithUpdatedParamAndStep = (plugin, stepKey, paramName, value) => {
  plugin.params = (plugin.params || [])
  .filter(param => {
    return param.name !== paramName;
  })
  .concat({
    name: paramName,
    value: value
  });

	return plugin;
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
