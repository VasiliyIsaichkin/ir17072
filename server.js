const express = require('express');
const httpServer = express();
const fs = require('mz/fs');
const scss = require('node-sass');

process.on('unhandledRejection', (reason) => {
	console.log(reason);
});

function sendData(res, data, status = 200) {
	return res.status(status).end(data);
}

function addHtmlRoute(path, file, status = 200) {
	httpServer.get(path, async (req, res) => {
		let html = await fs.readFile(`${__dirname}/views/${file}`);
		sendData(res, html, status);
	});
}

function addJSONRoute(path, file) {
	httpServer.get(path, (req, res) => {
		console.log(`[!] JSON requested from client "${path}"`);
		res.json(require(`./jsons/${file}`));
	});
}

async function renderSCSS(file) {
	return new Promise(async (resolve) => {
		if (!await fs.exists(file)) return resolve(false);
		scss.render({file: file}, (err, result) => {
			if (err) console.log(err);
			resolve(result);
		});
	});
}

let scssMapsCache = {};

function addSCSSRoute() {
	httpServer.get('/scss/:file.scss.map', async (req, res) => {
		if (!scssMapsCache[req.params.file]) return sendData(res, '', 404);
		sendData(res, scssMapsCache[req.params.file]);
	});

	httpServer.get('/scss/:file.css', async (req, res) => {
		let fPath = `${__dirname}/scss/${req.params.file}.scss`;
		let scssCompiled = await renderSCSS(fPath);
		if (!scssCompiled) return sendData(res, '404', 404);
		scssMapsCache[req.params.file] = scssCompiled.map;
		res.setHeader('Content-Type', 'text/css');
		res.end(scssCompiled.css);
	});
}

httpServer.use(require('body-parser').json());

let lastValues = {};
httpServer.post('/api/v1/processOffer', async (req, res) => {
	lastValues = req.body;
	res.end('OK')
});
httpServer.get('/viewSended', async (req, res) => {
	res.json(lastValues);
});


addSCSSRoute();
addHtmlRoute('/', 'steps.html');
addHtmlRoute('/step2', 'steps.html');
addHtmlRoute('/tpls/step1.html', 'step1.html');
addHtmlRoute('/tpls/step2.html', 'step2.html');

addJSONRoute('/api/v1/getCarList', 'carList.json');
addJSONRoute('/api/v1/getCarOffers', 'carOffers.json');
addHtmlRoute('/*', 'error404.html', 404);


httpServer.listen(9040, () => {
	console.log('Demo app server started');
});