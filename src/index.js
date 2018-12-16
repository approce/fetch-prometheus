const debug                            = require('debug')('fetch-prometheus');
const {requestCount, requestHistogram} = require('./metrics');
const {generalizeStatusCode}           = require('./normalizer');

const setup = customFetch => {
  let fetch;

  if (customFetch && typeof customFetch === 'function') {
    fetch = customFetch;
    debug('using custom fetch module passed in options');
  } else {
    fetch = require('node-fetch');
    debug('using default node-fetch module');
  }

  return fetchPrometheusWrapper(fetch);
};

const fetchPrometheusWrapper = fetch => async (url, opts = {}) => {
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