const express = require('express');
const axios = require('axios');
const router = express.Router();

const ZOHO_AUTH_URL = 'https://accounts.zoho.com/oauth/v2/auth';
const ZOHO_TOKEN_URL = 'https://accounts.zoho.com/oauth/v2/token';

// Temporary in-memory store for credentials and tokens to use in callback
let oauthCredentials = {};

// Step 1: Redirect to Zoho Authorization URL
router.post('/authorize', (req, res) => {
    const { client_id, client_secret, redirect_uri, scope } = req.body;

    if (!client_id || !client_secret || !redirect_uri || !scope) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    // saving the recieved credentials temporarily
    oauthCredentials = { client_id, client_secret, redirect_uri, scope };


    const authUrl = `${ZOHO_AUTH_URL}?response_type=code&client_id=${client_id}&scope=${scope}&redirect_uri=${redirect_uri}&access_type=offline`;
    res.json({ authorization_url: authUrl });
});

// Step 2: Handle the callback and exchange code for tokens
router.get('/callback', async (req, res) => {
    const authorizationCode = req.query.code;
    
    console.log(authorizationCode);

    if (!authorizationCode) {
        return res.status(400).send('Authorization code is missing');
    }
     //retrieving the credentials
    const { client_id, client_secret, redirect_uri } = oauthCredentials;

    try {
        // Exchange authorization code for tokens
        const tokenResponse = await axios.post(ZOHO_TOKEN_URL, null, {
            params: {
                grant_type: 'authorization_code',
                client_id:  client_id,
                client_secret: client_secret,
                redirect_uri: redirect_uri,
                code: authorizationCode
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const { access_token, refresh_token, expires_in } = tokenResponse.data;
        

        // Display tokens
       // res.json({ access_token, refresh_token, expires_in });
      // res.json(storedTokens); //Pm
       //use ejs view
      res.render('tokens', { access_token, refresh_token, expires_in });
    } catch (error) {
        console.error(error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Error exchanging authorization code for tokens' });
    }
});
       
module.exports = router;








