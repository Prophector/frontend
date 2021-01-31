const PROXY_CONFIG = [
  {
    context: ['/api', '/oauth2', '/login/oauth2'],
    target: 'http://localhost:8080',
    secure: false,
    logLevel: 'debug',
  },
];

module.exports = PROXY_CONFIG;
