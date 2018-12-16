const debug                            = require('debug')('fetch-prometheus');
const {requestCount, requestHistogram} = require('./metrics');
const {generalizeStatusCode}           = require('./normalizer');

const setup = (uri, opts) => {
  let fetch;

  if (opts.fetch && typeof opts.fetch === 'function') {
    fetch = opts.fetch;
    debug('using custom fetch module passed in options');
  } else {
    fetch = require('node-fetch');
    debug('using default node-fetch module');
  }

  return fetchPrometheusWrapper(fetch, uri, opts);
};

const fetchPrometheusWrapper = async (fetch, url, opts = {}) => {
  const method     = opts.method ? opts.method.toUpperCase() : 'GET';
  const publishURL = opts.publishURL ? opts.publishURL : url;

  const end = requestHistogram.startTimer({url: publishURL, method});
  let result;

  try {
    result = await fetch(url, opts);
  } finally {
    const status            = result.status;
    const generalizedStatus = generalizeStatusCode(status);

    end({generalized_status: generalizedStatus, status});
    requestCount.inc({url: publishURL, method, generalized_status: generalizedStatus, status});

    debug(`Status: ${status}. Method: ${method}. URL: ${publishURL}`)
  }

  return result;
};

module.exports = setup;