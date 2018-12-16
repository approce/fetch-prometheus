# Fetch Prometheus
This is a wrapper for 'node-fetch' module that submits metrics for all executed requests to Prometheus service.

## Install 
```
npm i --save fetch-prometheus
```

## Example

Basic example:
```
const fetch = require('fetch-prometheus')(); //will use default node-fetch module to fetch data

fetch('https://api.ipify.org?format=json');
```

Custom fetch module usage:
```
const fetchRetry = require('fetch-retry');
const fetch      = require('fetch-prometheus')(fetchRetry); //will use custom 'fetch-retry' module to fetch Data.

fetch('https://api.ipify.org?format=json');
```

Custom `publishURL` example:
```
fetch('https://api.ipify.org?format=json', {
  publishURL: 'get_ip_request' //instead of publishing 'https://api.ipify.org?format=json' to prometheus it will publish metrics for this request under 'get_ip_request' request name. It should improve readability of metrics. 
});
```
## Example of submitted metrics at Grafana (dashboard for Prometheus):

Requests per minute chart:
<p align="center">
  <img src="https://github.com/approce/fetch-prometheus/blob/master/screenshots/performance.jpg?raw=true">
</p>

Request execution time in seconds:
<p align="center">
  <img src="https://github.com/approce/fetch-prometheus/blob/master/screenshots/execution_time.jpg?raw=true">
</p>


## Options added to default node-fetch options. 
| Name | Description |
| :-: | :- |
| publishURL |Customize name of request when publishing metrics to prometheus. Designed to increase readability of metrics at Prometheus |

## `prom-client` integration:

This module only submits metrics to Prometheus by using [prom-client](https://github.com/siimon/prom-client) module. Make sure you expose metrics as an endpoint so Prometheus can collect them, or make sure you push them by using PushGateway.

Example of exposing `prom-client` metrics assuming you use `Express.js`:

```
const Prometheus = require('prom-client');
const express = require('express');

app.get('prometheus-metrics', (req, res) => {
  res.set('Content-Type', Prometheus.register.contentType);
  res.end(Prometheus.register.metrics());
});
```

Example of pushing metrics to `Prometheus` by using `PushGateway`:

```
const {Pushgateway} = require('prom-client');
const gateway  = new Pushgateway('http://localhost:9091');

const push = () => gateway.push({jobName: 'test_job'}, err => {
  if (err) {
    console.error(`Error on pushing metrics to Prometheus. Reason: ${err.message}`);
  } else {
    console.log('Metrics pushed to Prometheus');
  }
});

setInterval(() => {
  push();
}, 10000);
```

For more detailed information visit [prom-client](https://github.com/siimon/prom-client) page.

## Metrics exposed
- `http_requests_total`: Counter for total requests received, has labels `url`, `method`, `status`, `generalized_status`
- `http_request_duration_seconds`: Duration of HTTP requests in seconds, has labels `url`, `method`, `status`, `generalized_status`

Label `generalized_status` is normalized to status code family groups, like `2XX` or `4XX`

Label `url` may be customized by passing custom `publishURL` in options
