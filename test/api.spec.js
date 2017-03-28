const Chance = require('chance');
const R = require('ramda');
const component = require('./../index');
const nock = require('nock');
const HTTPStatus = require('http-status');
const expect = require('chai').expect;

const ChanceConstruct = R.construct(Chance);
const domain = R.invoker(1, 'domain')({});
const word = R.invoker(1, 'word');
const url = R.invoker(1, 'url');

const wordLength3 = word({ length: 3 });
const wordLength6 = word({ length: 6 });
const urlEmptyPath = url({ path: '' });

const chanceName = R.pipe(ChanceConstruct, wordLength3);
const chanceUpstreamUrl = R.pipe(ChanceConstruct, urlEmptyPath, R.dropLast(1));
const chanceHosts = R.map(R.pipe(ChanceConstruct, domain));

const chanceUris = R.map(R.pipe(ChanceConstruct, wordLength6, R.concat('/')));

const data = {
  gateway: '127.0.0.1:8001',
  apis: [
    {
      api: {
        name: chanceName(Math.random),
        upstream_url: chanceUpstreamUrl(Math.random),
        hosts: chanceHosts([Math.random, Math.random, Math.random]),
        uris: chanceUris([Math.random, Math.random, Math.random]),
        methods: ['GET', 'POST'],
      },
      plugins: ['jwt'],
    },
    {
      api: {
        name: chanceName(Math.random),
        upstream_url: chanceUpstreamUrl(Math.random),
        hosts: chanceHosts([Math.random, Math.random, Math.random]),
        uris: chanceUris([Math.random, Math.random, Math.random]),
        methods: ['GET', 'POST'],
      },
      plugins: ['jwt'],
    },
  ],
};

const mockApi = api => nock(data.gateway)
      .post('/apis', api)
      .reply(HTTPStatus.CREATED);

const mockPlugin = (api, plugin) => nock(data.gateway)
      .post(`/apis/${api}/plugins`, {
        name: plugin,
      })
      .reply(HTTPStatus.CREATED);

const mockAction = (apis) => {
  R.forEach((api) => {
    mockApi(api);
    R.forEach((plugin) => {
      mockPlugin(api.name, plugin);
    }, api.plugins || []);
  }, apis);
};
