const express = require('express');
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');

const APP_ID = '87b166c29c46485590dba9d768f2c47f';
const APP_CERTIFICATE = 'cf2f0ae1418d4a02a51bcf5fd18a7f40';
const app = express();
exports.nocache = (req, res, next) => {
	res.header('Cache-Control', 'private,no-cache,no-store,must-revalidate');
	res.header('Expires', '-1');
	res.header('Pragma', 'no-cache');
	next();
};

exports.generateAcessToken = (req, res, next) => {
	res.header('Acess-Control-Allow-Origin', '*');
	const channelName = req.query.channelName;

	if (!channelName) {
		return res.status(500).json({ error: 'channel is required' });
	}
	let uuid = req.query.uuid;
	if (!uuid || uuid == '') {
		uuid = 0;
	}

	let expireTime = req.query.expireTime;

	if (!expireTime || expireTime == '') {
		expireTime = 3600 * 24;
	} else {
		expireTime = parseInt(expireTime, 10);
	}

	const currentTime = Math.floor(Date.now() / 1000);
	const privilegeExpireTime = currentTime + expireTime;
	const token = RtcTokenBuilder.buildTokenWithUid(APP_ID, APP_CERTIFICATE, channelName, uuid, privilegeExpireTime);
	return res.json({ token: token });
};
