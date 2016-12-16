const Request = require('superagent');
const HTTPStatus = require('http-status');
const debug = require('debug')('loopback:component:registry:kong');
const assert = require('assert');

module.exports = function RegisterToKong(app, { gateway, upstream, apis = [] }) {
  assert(upstream.endsWith('/'), "upstream must end with /");

  apis.forEach(function (api) {
    assert(api.path.startsWith('/'), 'path of api must start with /');
  });

  const RegisterApi = function RegisterApi(params) {
    return new Promise((resolve, reject) => {
      Request.post(`${gateway}/apis`).send(params).end((err, res) => {

        if (!res && err) throw err;
        const statusCode = res.status;
        const result = res.body;
        if (statusCode === HTTPStatus.CREATED) {
          resolve(result);
        } else {
          reject({
            message: result,
            statusCode,
          });
        }
      });
    });
  };

  const RegisterPlugin = function RegisterPlugin(plugin, name) {
    return new Promise((resolve, reject) => {
      Request.post(`${gateway}/apis/${name}/plugins`).send({
        name: plugin,
      }).end((err, res) => {
        const statusCode = res.status;
        const result = res.body;
        if (statusCode === 201) {
          resolve(null);
        } else {
          reject({
            message: result,
            statusCode,
          });
        }
      });
    });
  };

  const dealPlugin = (plugin, name) => {
    RegisterPlugin(plugin, name).then(() => {
      debug(`plugin: ${plugin} register successfully`);
    }, (error) => {
      if (error.statusCode !== HTTPStatus.CONFLICT) {
        debug(`register plugin ${plugin} failed: statuscode is ${error.statusCode}\nmessage is: ${JSON.stringify(error.message)}`);
      } else {
        debug(`plugin ${plugin} has been registered`);
      }
    });
  };

  apis.forEach((api) => {
    const data = {
      upstream_url: upstream,
      request_path: api.path,
      name: api.name,
    };
    const plugins = api.plugins || [];

    RegisterApi(data).then(() => {
      debug(`api: ${data.name} register successfully`);
      plugins.forEach((plugin) => {
        dealPlugin(plugin, api.name);
      });
    }, (error) => {
      if (error.statusCode !== HTTPStatus.CONFLICT) {
        debug(`register api ${data.name} failed: statuscode is ${error.statusCode} message is: ${JSON.stringify(error.message)}`);
      } else {
        //if api has alreay been registered, plugin register.
        debug(`api ${data.name} has been registered`);
        plugins.forEach((plugin) => {
          dealPlugin(plugin, api.name);
        });
      }
    });
  });
};
