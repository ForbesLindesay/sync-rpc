'use strict';

const getPort = require('get-port');

getPort({ host: process.argv[2] })
  .then(port => process.stdout.write('' + port))
  .catch(err =>
    setTimeout(() => {
      throw err;
    }, 0)
  );
