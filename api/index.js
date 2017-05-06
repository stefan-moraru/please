const express = require('express');
const Please = require('../src/services/_.js');
const fileUpload = require('express-fileupload');
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

const pluginStep = (req, res) => {
	const text = req.params.text;
  const step = req.query && req.query.step;
  const fillParam = req.query && decodeURIComponent(req.query.fillParam);
  const fillValue = req.query && decodeURIComponent(req.query.fillValue);
  const plugin = Please.bestPluginMatch(settings, {
		text: text
	});

	if (step) {
		plugin.step = step;
	}

	let currentStep = Please._currentStep(plugin);

	if (Please.emptyPlugin(plugin)) {
		return res.status(404).send(`[ERROR] Could not find plugin for input ${text} `)
	}

  if (currentStep && currentStep.query && !currentStep.queryDone) {
		promise = Please.query(plugin, currentStep);
	} else {
		promise = new Promise((resolve, reject) => { resolve(plugin); });
	}

	return promise.then((plugin) => {
    if (fillParam && fillValue) {
      plugin.params = (plugin.params || {});
      plugin.params[fillParam] = {
        value: fillValue,
        name: fillParam
      };
    }

	  return res.status(200).json(Please._formatStep(currentStep, plugin.params, `${API_URL}${req.path}`));
	})
	.catch((error) => {
		return res.status(503).send(error);
	});
};

const plugins = (req, res) => {
  let plugins = [];

  if (settings.plugins) {
    plugins = Object.keys(settings.plugins).map(key => settings.plugins[key]);
  }

  return res.status(200).json(plugins);
};

const plugin = (req, res) => {
  const name = req.params.name;

  if (name && settings.plugins[name]) {
    return res.status(200).json(settings.plugins[name]);
  } else {
    return res.status(404).send('[ERROR] Plugin not found');
  }
};

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(fileUpload());

app.get('/api/v1/conversation/', (req, res) => {
	return res.status(400).send('[ERROR] Input text must not be empty: /api/v1/conversation/play something like worms');
});

app.get('/api/v1/conversation/:text', (req, res) => {
	return pluginStep(req, res);
});

app.post('/api/v1/conversation', (req, res) => {
  console.log(req.files);
  if (req.files && req.files.image) {
    const img = new Buffer(req.files.image.data).toString('base64');

    Please.imageToCloudVision(img)
    .then((result) => {
      console.log('woot', result);
    })

    console.log(img);
  }
      /* const file = files[0];

      let reader = new FileReader();

      reader.onloadend = () => {
        let content = event.target.result;

        content = content.replace('data:image/png;base64,', '');
        content = content.replace('data:image/jpeg;base64,', '');
        content = content.replace('data:image/jpg;base64,', '');

        this.sendFileToCloudVision(content).then(this.onInputImageChange.bind(this)).catch(e => { console.error(e); });
      };

      reader.readAsDataURL(file);
	return pluginStep(req, res); */
});

app.get('/api/v1/plugins/', (req, res) => {
  return plugins(req, res);
});

app.get('/api/v1/plugin/', (req, res) => {
  return res.status(400).send('[ERROR] You need to specify a plugin name: /api/v1/plugin/food');
});

app.get('/api/v1/plugin/:name', (req, res) => {
  return plugin(req, res);
});

app.listen(PORT, init);
