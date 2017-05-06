const express = require('express');
const Please = require('../src/services/_.js');
const app = express();
const PORT = 5000;
const API_URL = 'http://api.please.com:5000';

let settings = {
  pluginMatchProbabilityThreshold: 0.3,
  user: null,
  plugins: null
};

const init = () => {
	Please.fb_onValue('plugins', (plugins) => {
		console.log('[Please API] Started server');
		settings.plugins = plugins;
	});
};

const renderPluginStep = (req, res) => {
	const text = req.params.text;
  const step = req.params.step;
  const plugin = Please.bestPluginMatch(settings, {
		text: text
	});

	if (step) {
		plugin.step = step;
	}

	let currentStep = Please._currentStep(plugin);

	if (Please.emptyPlugin(plugin)) {
		return res.status(404).send(`Could not find plugin for input ${text} `)
	}

  if (currentStep && currentStep.query && !currentStep.queryDone) {
		promise = Please.query(plugin, currentStep);
	} else {
		promise = new Promise((resolve, reject) => { resolve(plugin); });
	}

	return promise.then((plugin) => {
	  return res.status(200).json(Please._formatStep(currentStep, plugin.params, `${API_URL}${req.path}`));
	})
	.catch((error) => {
		return res.status(503).send(error);
	});
}

app.get('/api/v1/conversation/', (req, res) => {
	return res.status(400).send(`Input text must not be empty`);
});

app.get('/api/v1/conversation/:text/:step', (req, res) => {
	return renderPluginStep(req, res);
});

app.get('/api/v1/conversation/:text', (req, res) => {
	return renderPluginStep(req, res);
});

app.listen(PORT, init);
