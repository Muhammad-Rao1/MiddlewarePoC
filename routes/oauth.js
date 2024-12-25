const express = require('express');
const axios = require('axios');
const router = express.Router();

// Hardcoded credentials for testing
const CLIENT_ID = '1000.MGD6548XE382DEA3140TI08VAA1EFV';
const CLIENT_SECRET = '';
const REDIRECT_URI = 'http://localhost:3000/oauth/callback';
const ZOHO_AUTH_URL = 'https://accounts.zoho.com/oauth/v2/auth';
const ZOHO_TOKEN_URL = 'https://accounts.zoho.com/oauth/v2/token';

// Step 1: Redirect to Zoho Authorization URL
router.get('/authorize', (req, res) => {
    const authUrl = `${ZOHO_AUTH_URL}?response_type=code&client_id=${CLIENT_ID}&scope=ZohoCRM.modules.ALL&redirect_uri=${REDIRECT_URI}&access_type=offline`;
    res.redirect(authUrl);
});

// Step 2: Handle the callback and exchange code for tokens
router.get('/callback', async (req, res) => {
    const authorizationCode = req.query.code;

    if (!authorizationCode) {
        return res.status(400).send('Authorization code is missing');
    }

    try {
        // Exchange authorization code for tokens
        const tokenResponse = await axios.post(ZOHO_TOKEN_URL, null, {
            params: {
                grant_type: 'authorization_code',
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                redirect_uri: REDIRECT_URI,
                code: authorizationCode
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const { access_token, refresh_token, expires_in } = tokenResponse.data;

        // Display tokens
        res.render('tokens', { access_token, refresh_token, expires_in });
    } catch (error) {
        console.error(error.response ? error.response.data : error.message);
        res.status(500).send('Error exchanging authorization code for tokens');
    }
});

module.exports = router;
