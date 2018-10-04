const fs = require('fs');

const outputPath = process.env.OUTPUT_PATH || 'output';

function exportACME(acmePath) {
	if(!fs.existsSync(acmePath))
		return;
	let acme = {};

	try {
		const acmeStr = fs.readFileSync(acmePath);
		acme = JSON.parse(acmeStr);
	} catch (e) {
		console.error(e);
		return;
	}

	if(!("Certificates" in acme) || acme.Certificates === null) {
		console.log(`${new Date().toISOString()} - No certificates present, aborting this run`);
		return;
	}

	if(acme.Certificates.length === 0) {
		return;
	}

	acme.Certificates.forEach(exportCertificate);
}

function exportCertificate(cert) {
	const domains = [cert.Domain.Main, ...cert.Domain.SANs || []];
	domains.forEach(domain => {

		const certificate = Buffer.from(cert.Certificate, 'base64').toString('UTF-8');
		const key = Buffer.from(cert.Key, 'base64').toString('UTF-8');

		exportDomain(domain, certificate, key);
	})
}

function exportDomain(domain, cert, key) {
	const path = `${outputPath}/${domain}`;
	if(!fs.existsSync(path))
		fs.mkdirSync(path);
	fs.writeFileSync(path + '/cert.pem', cert);
	fs.writeFileSync(path + '/key.pem', key);
	fs.writeFileSync(path + '/fullchain.pem', key + '\n' + cert);
}

exportACME('../test/acme.json');

module.exports = exportACME;