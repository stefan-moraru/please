const express = require('express');
const Please = require('../src/services/_.js');
const app = express();
const PORT = 5000;
let settings = {
  pluginMatchProbabilityThreshold: 0.3,
  user: null,
  plugins: null
};

app.get('/api/v1/conversation/', (req, res) => {
	res.status(400).send(`Input text must not be empty`);
});

app.get('/api/v1/conversation/:text', (req, res) => {
	const text = req.params.text;

  let plugin = Please.bestPluginMatch(settings, {
		text: text
	});

	let currentStep = Please._currentStep(plugin);

	if (!plugin || (plugin && !plugin.name)) {
		//TODO: Create function
		res.status(404).send(`Could not find plugin for input ${text} `)
	}

  if (currentStep.query && !currentStep.queryDone) {
		Please._query(currentStep, plugin.params)
		.then((data) => {
			res.json(data);
		})
		.catch((error) => {
			res.status(503).send(`Could not send query ${error}`);
		})

	} else {
	  res.json(currentStep);
	}
})

const init = () => {
	Please.fb_onValue('plugins', (plugins) => {
		console.log('[Please API] Started server');
		settings.plugins = plugins;
	});
};

app.listen(PORT, init);

//TODO: DecodeURI from text input, to leave out %20
