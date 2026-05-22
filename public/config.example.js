// Runtime config — copy this file to config.js and fill in your values.
// config.js is gitignored and never goes into Docker image.
// In Docker Compose, mount your real config.js as a volume:
//   volumes:
//     - ./config.js:/usr/share/nginx/html/config.js:ro
window.APP_CONFIG = {
  ankrKey: '',
  web3formsKey: '',
};
