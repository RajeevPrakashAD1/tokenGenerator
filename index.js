const express = require('express');
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');

const PORT = process.env.PORT || 8080;
const APP_ID = '87b166c29c46485590dba9d768f2c47f';
const APP_CERTIFICATE = 'cf2f0ae1418d4a02a51bcf5fd18a7f40';
const app = express();
const nocache = (req, res, next) => {
    res.header('Cache-Control', 'private,no-cache,no-store,must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
};

const generateAcessToken = (req, res, next) => {
    res.header('Acess-Control-Allow-Origin', '*');
    const channelName = req.query.channelName;

    if (!channelName) {
        return res.status(500).json({ error: 'channel is required' });
    }
    let uuid = req.query.uuid;
    if (!uuid || uuid == '') {
        uuid = 0;
    }
    let role = RtcRole.SUBSCRIBER;
    if (req.query.role == 'publisher') {
        role = RtcRole.PUBLISHER;
    }
    let expireTime = req.query.expireTime;

    if (!expireTime || expireTime == '') {
        expireTime = 3600 * 24;
    } else {
        expireTime = parseInt(expireTime, 10);
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const privilegeExpireTime = currentTime + expireTime;
    const token = RtcTokenBuilder.buildTokenWithUid(
        APP_ID,
        APP_CERTIFICATE,
        channelName,
        uuid,
        role,
        privilegeExpireTime
    );
    return res.json({ token: token });
};

app.get('/access_token', nocache, generateAcessToken);

app.listen(PORT, () => {
    console.log('listening on port = ', PORT);
});