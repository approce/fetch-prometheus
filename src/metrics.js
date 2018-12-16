const Prometheus = require('prom-client');

const requestCount = new Prometheus.Counter({
  name      : 'http_requests_total',
  help      : 'Counter for total requests received',
  labelNames: ['url', 'method', 'generalized_status', 'status'],
});

const requestHistogram = new Prometheus.Histogram({
  name      : 'http_request_duration_seconds',
  help      : 'Duration of HTTP requests in seconds',
  labelNames: ['url', 'method', 'generalized_status', 'status'],
  buckets   : [0.5, 2, 5, 10],
});

module.exports = {
  requestCount,
  requestHistogram,
};