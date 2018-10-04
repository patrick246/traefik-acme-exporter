const fs = require('fs');

const exportACME = require('./export');

const acmePath = process.env.ACME_JSON_PATH || 'acme.json';
const outputPath = process.env.OUTPUT_PATH || 'output';

let activeWait = null;

if(!fs.existsSync(outputPath)) {
	fs.mkdirSync(outputPath);
}

if(!fs.existsSync(acmePath)) {
	console.error('acme.json not found');
	return;
}

console.log(`${new Date().toISOString()} - Starting traefik acme exporter, acme path: ${acmePath}, output: ${outputPath}`);

exportACME(acmePath);
fs.watchFile(acmePath, (cur, prev) => {
	if(cur.mtime.getTime() === prev.mtime.getTime()) {
		return;
	}

	if(activeWait) {
		console.log(`${new Date().toISOString()} - Got new change event, aborting old event`);
		clearTimeout(activeWait);
		activeWait = null;
	} else {
		console.log(`${new Date().toISOString()} - Got change event, waiting 10s before regenerating`);
	}

	activeWait = setTimeout(() => {
		console.log(`${new Date().toISOString()} - regenerating certificates`);
		activeWait = null;
		exportACME(acmePath);
	}, 10000);
});