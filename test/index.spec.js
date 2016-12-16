const nock = require('nock');
const HTTPStatus = require('http-status');
const Chance = require('chance');
const component = require('./../index');
const expect = require('chai').expect;

const chance = new Chance();

const params = {
  gateway: chance.domain(),
  upstream: `${chance.domain()}/`,
  apis: [
    {
      name: chance.string({ length: 6 }),
      path: `/${chance.string({ length: 3 })}/${chance.string({ length: 6 })}`,
      plugins: ['jwt'],
    },
    {
      name: chance.string({ length: 6 }),
      path: `/${chance.string({ length: 3 })}/${chance.string({ length: 6 })}`,
    },
  ],
};

function mockApi(api) {
  const data = {
    upstream_url: params.upstream,
    request_path: api.path,
    name: api.name,
  };
  nock(params.gateway)
    .post('/apis', data)
    .reply(HTTPStatus.CREATED);
}

function mockPlugin(api, plugin) {
  nock(params.gateway)
    .post(`/apis/${api}/plugins`, {
      name: plugin,
    })
    .reply(HTTPStatus.CREATED);
}

function mockAction(apis) {
  apis.forEach((api) => {
    mockApi(api);
    const plugins = api.plugins || [];
    plugins.forEach((plugin) => {
      mockPlugin(api.name, plugin);
    });
  });
}

describe('a api ', () => {
  it('can register into kong ', (done) => {
    mockAction(params.apis);
    expect(() => {
      component(null, params);
    }).to.not.throw(Error);
    done();
  });

  it('can not register into kong with wrong upstream_url', (done) => {
    const copy = Object.assign({}, params);
    copy.upstream = copy.upstream.substr(0, copy.upstream.length - 1);
    mockAction(copy.apis);
    expect(() => {
      component(null, copy);
    }).to.throw(Error);
    done();
  });
  it('can not register into kong with wrong path of api', (done) => {
    const copy = Object.assign({}, params);
    copy.apis[0].path = copy.apis[0].path.substring(1);
    mockAction(copy.apis);
    expect(() => {
      component(null, copy);
    }).to.throw(Error);
    done();
  });
});
