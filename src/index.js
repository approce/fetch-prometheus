const {requestCount, requestHistogram} = require('./metrics');
const {generalizeStatusCode}           = require('./normalizer');

const setup = fetch => {
  if (!fetch) {
    fetch = require('node-fetch');
  }

  const fetchPrometheus = async (url, opts = {}) => {
    const method     = opts.method ? opts.method.toUpperCase() : 'GET';
    const publishURL = opts.publishURL ? opts.publishURL : url;

    let result;
    const end = requestHistogram.startTimer({url: publishURL, method});

    try {
      result = await fetch(url, opts);
    } finally {
      const status            = result.status;
      const generalizedStatus = generalizeStatusCode(status);

      end({generalized_status: generalizedStatus, status});
      requestCount.inc({url: publishURL, method, generalized_status: generalizedStatus, status});
    }

    return result;
  };

  return fetchPrometheus;
};

module.exports = setup;