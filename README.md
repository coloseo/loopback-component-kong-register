# loopback-component-kong-register


[![Build Status](https://api.travis-ci.org/coloseo/loopback-component-kong-register.svg?branch=master)](https://travis-ci.org/coloseo/loopback-component-kong-register)



register your apis and plugin into kong

##how to use
/server/component.js
```javascript
  module.exports = {
    'loopback-component-kong-register': {
        gateway: 'http://localhost:8001',
        upstream: 'http://localhost:3000/',
        apis: [
        {
            name: 'Auths',
            path: '/api/auths',
            plugins: ['jwt'],
        },
        {
            name: 'Members',
            path: '/api/members',
        },
        ],
  },
};

```
or /server/component-config.json
```javascript
{
    "loopback-component-kong-register": {
        "gateway": "http://localhost:8001",
        "upstream": "http://localhost:3000/",
        "apis": [
            {
                "name": "Auths",
                "path": "/api/auths",
                "plugins": [
                    "jwt"
                ]
            },
            {
                "name": "Members",
                "path": "/api/members"
            }
        ]
    }
}
```
