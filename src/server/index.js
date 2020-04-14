// var SpotifyWebAPI = require('spotify-web-api-node');
// var express = require('express');
// var router = express.Router();

// var app = express();

// app.use(function (req, res, next) {
//     res.header('Access-Control-Allow-Origin', '*');
//     res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
//     res.header('Content-type', 'application/x-www-form-urlencoded')
//     next();
// })

// var scopes = ['user-read-email', 'user-read-private'];
// var state = '34fFs29kd09';
// var showDialog = true;

// var spotifyAPI = new SpotifyWebAPI({
//     clientId: '7f9cbbd68daf4d19a8890769e24edd46',
//     clientSecret: '5e917c1f5f3e4184a24e4c569a7a6b81',
//     redirectUri: 'http%3A%2F%2Flocalhost%3A8000%2Fcallback'
// });

// function authorizationCodeGrant() {
//     let code = 'AQAcQB36vFf2FtsH0HSESx92QpVKU9aj24NS4MCvPh--zIoCvjaDbX0RwWaAxZgvswfImO6eWWN5oHzhH7rBxcDXN4ER2bJn4Gzp6fc1d5bln68VG7jza5cEiXvfqS_55eO2XaD5GL7gpLlRfRXKPHlwqToN6dWmqf0OtmpTf7smEmjAYCErkK4Zx_5DTPJHZv0trS-cBH7eFegarUErSqe2RcCUskSMETVxsG2JFw';
//     return spotifyAPI.authorizationCodeGrant(code);
// }

// app.get('/authorize', function (req, res) {
//     var html = spotifyAPI.createAuthorizeURL(scopes, state)
//     console.log(html)
//     res.send(html + '&show_dialog=true')
// })

// app.get('/callback', async (req, res) => {
//     const { code } = req.query;
//     console.log(code)
//     try {
//         var data = await spotifyAPI.authorizationCodeGrant(code)
//         const { access_token, refresh_token } = data.body;
//         spotifyAPI.setAccessToken(access_token);
//         spotifyAPI.setRefreshToken(refresh_token);
//         console.log(spotifyAPI.getAccessToken());
//         res.redirect('http://localhost:3000/home');
//     } catch (err) {
//         res.redirect('/#/error/invalid token');
//     }
// });

// app.listen(8000, '', function () {
//     console.log('app listent at port 8000')
// })

let express = require('express')
let bodyParser = require('body-parser')
let request = require('request')
let querystring = require('querystring')
//var schedule = require('node-schedule');

var cron = require('cron');
// runs every hour (every 55 minutes) to refresh tokens
var cronJob = cron.job("0 */55 * * * *", function () {
    // perform operation e.g. GET request http.get() etc.
    if (loginInitiated) {
        funcRefreshToken();
        console.info('Token refresh completed');
        console.log("New access  token: " + access_token);
    } else {
        console.info('Error: You need to login to Spotify');
    }

});
cronJob.start();

let app = express()
// parse JSON
app.use(bodyParser.json());
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Content-type', 'application/x-www-form-urlencoded')
    next();
})
// CONFIG
const serverAddr = 'http://YOUR_DOMAIN';  // no slash at the end!
var SPOTIFY_CLIENT_ID = '7f9cbbd68daf4d19a8890769e24edd46';
var SPOTIFY_CLIENT_SECRET = '5e917c1f5f3e4184a24e4c569a7a6b81';
let afterLoginURI = "http://localhost:3000/home";
let access_token = ""; // Keeps valid token in memory
let refresh_token = ""; // known as permanent token which does not expire 
let loginInitiated = false;
let expires_in = 0;
let state = '34fFs29kd09';

let redirect_uri =
        'http://localhost:8000/callback/' ;

app.get('/authorize', function (req, res) {
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            client_id: SPOTIFY_CLIENT_ID,
            response_type: 'code',
            redirect_uri,
            scope: 'user-read-playback-state user-read-currently-playing user-modify-playback-state user-read-private user-read-email',
            state: state,
            show_dialog: true
        }))
})

app.get('/callback', function (req, res) {
    let code = req.query.code || null
    let authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
            code: code,
            redirect_uri,
            grant_type: 'authorization_code'
        },
        headers: {
            'Authorization': 'Basic ' + (new Buffer(
                // process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET // uncomment if you want to use local Linux storage for secrets
                SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET // comment this if you using lines above
            ).toString('base64'))
        },
        json: true
    }

    request.post(authOptions, function (error, response, body) {
        // Set all tokens and expiration time
        access_token = body.access_token;
        expires_in = body.expires_in;
        refresh_token = body.refresh_token;
        // Redirection disabled, Enable if you need it for something else
        // let uri = process.env.FRONTEND_URI || serverAddr + ':3000'
        // res.redirect(uri + '?access_token=' + access_token)  

        // show tokens to client side. CAUTION! - enable only if you debugging application. Tokes are private
        // res.json({
        //   "access token": access_token,
        //   "refresh token": refresh_token,
        //   "expires in": expires_in
        // });
        // redirect if URL is defined in setting
        if (afterLoginURI !== "") {
           res.redirect(afterLoginURI);
        } else {
            res.json({
                "granted": "yes"
            });
        }


        loginInitiated = true; // enables timer for Token refresh
        // res.json({ "login success": "yes" });
    })
})


function funcRefreshToken() {
    //let code = req.query.code || null
    let authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
            //code: code,
            refresh_token: refresh_token, // my saved refresh token
            redirect_uri,
            grant_type: 'refresh_token'
        },
        headers: {
            'Authorization': 'Basic ' + (new Buffer(
                SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET
            ).toString('base64'))
        },
        json: true
    }
    request.post(authOptions, function (error, response, body) {
        // Set all NEW tokens and expiration time
        access_token = body.access_token;
        expires_in = body.expires_in;
    })
}

// let header = {
//     Authorization: 'Bearer ' + access_token
// }

app.get('/me',function(req,res){
    let requestOpt = {
        url: 'https://api.spotify.com/v1/me',
        headers: {
            'Authorization': 'Bearer ' + access_token
        },
        json: true
    }
    request.get(requestOpt, function (error, response, body){
        res.send(body);
    })
})

app.get('/search',function(req,res){
    let requestOpt = {
        url: 'https://api.spotify.com/v1/me',
        headers: {
            'Authorization': 'Bearer ' + access_token
        },
        json: true
    }
    request.get(requestOpt, function (error, response, body){
        res.send(body);
    })
})

let port = process.env.PORT || 8000
console.log(`Listening on port ${port}. Go to ${serverAddr}/login to initiate authentication flow.`)
app.listen(port)