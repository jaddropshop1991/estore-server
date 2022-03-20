{/*
// we use jwt library to secure apis in our server
const expressJwt = require('express-jwt');

//check if token passed by the user is based on the same secret then the api will work and acessed otherwise not
function authJwt() {
    const secret = process.env.secret;
    return expressJwt({
        secret,
        algorithms: ['HS256'],
        //reviewing and revoking the token under specific condition using jwt
         isRevoked: isRevoked
    }).unless({
        // excluded apis from the authentication process with the below code
        path: [
            // excluding methods and urls from the authetication process also using regular expressions
            {url: /\/api\/v1\/products(.*)/, methods: ['GET','OPTIONS']},
            {url: /\/api\/v1\/categories(.*)/, methods: ['GET','OPTIONS']},
            {url: /\/api\/v1\/uploads(.*)/, methods: ['GET','OPTIONS']},
            { url: /\/api\/v1\/orders(.*)/, methods: ['GET', 'OPTIONS', 'POST'] },
            '/api/v1/users/login',
            '/api/v1/users/register',
        ]
    })
}

//reviewing and revoking the token using jwt by checking the token payload to see if admin or not
async function isRevoked(req, payload, done){
    if(!payload.isAdmin) {
        done(null, true)
    }
    done();
}

module.exports = authJwt;
*/}

const expressJwt = require('express-jwt');

function authJwt() {
    const secret = process.env.secret;
    const api = process.env.API_URL;
    return expressJwt({
        secret,
        algorithms: ['HS256'],
        isRevoked: isRevoked
    }).unless({
        path: [
            { url: /\/public\/uploads(.*)/, methods: ['GET', 'OPTIONS'] },
            { url: /\/api\/v1\/products(.*)/, methods: ['GET', 'OPTIONS'] },
            { url: /\/api\/v1\/categories(.*)/, methods: ['GET', 'OPTIONS'] },
            { url: /\/api\/v1\/orders(.*)/, methods: ['GET', 'OPTIONS', 'POST'] },
            `${api}/users/login`,
            `${api}/users/register`
            // { url: /(.*)/ },
        ]
    });
}

async function isRevoked(req, payload, done) {
    if (!payload.isAdmin) {
        done(null, true);
    }

    done();
}

module.exports = authJwt;
