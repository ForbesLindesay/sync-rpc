'use strict';

const path = require('path');
const spawn = require('child_process').spawn;
const spawnSync = require('child_process').spawnSync;
const JSON = require('./json-buffer');

const host = '127.0.0.1';
const NC_PATH = require.resolve('./nc');
const WIN_NC = path.resolve(__dirname + '/nc-windows/ncat.exe');

const FUNCTION_PRIORITY = [
  nativeNC,
  winNC,
  nodeNC,
];

let started = false;
const configuration = {port: null, fastestFunction: null};
function start() {
  if (!spawnSync) {
    throw new Error(
      'Sync-request requires node version 0.12 or later.  If you need to use it with an older version of node\n' +
      'you can `npm install sync-request@2.2.0`, which was the last version to support older versions of node.'
    );
  }
  const port = findPort();
  const p = spawn(process.execPath, [require.resolve('./worker'), port], {stdio: 'inherit'});
  p.unref();
  process.on('exit', () => {
    p.kill();
  });
  waitForAlive(port);
  const fastestFunction = getFastestFunction(port);
  configuration.port = port;
  configuration.fastestFunction = fastestFunction;
  started = true;
}

function findPort() {
  const findPortResult = spawnSync(process.execPath, [require.resolve('./find-port')]);
  if (findPortResult.status !== 0) {
    throw new Error(
      findPortResult.stderr.toString() ||
      ('find port exited with code ' + findPortResult.status)
    );
  }
  if (findPortResult.error) {
    if (typeof findPortResult.error === 'string') {
      throw new Error(findPortResult.error);
    }
    throw findPortResult.error;
  }
  const portString = findPortResult.stdout.toString('utf8').trim();
  if (!/^[0-9]+$/.test(portString)) {
    throw new Error('Invalid port number string returned: ' + portString);
  }
  return +portString;
}

function waitForAlive(port) {
  let response = null;
  while (response !== 'pong') {
    const result = nodeNC(port, 'ping\r\n');
    response = result.stdout && result.stdout.toString();
  }
}

function nativeNC(port, input) {
  return spawnSync('nc', [host, port], {input: input});
}

function winNC(port, input) {
  return spawnSync(WIN_NC, [host, port], {input: input});
}

function nodeNC(port, input) {
  return spawnSync(process.execPath, [NC_PATH, host, port], {input: input});
}

function test(fn, port) {
  const result = fn(port, 'ping\r\n');
  const response = result.stdout && result.stdout.toString();
  return response === 'pong';
}

function getFastestFunction(port) {
  for (let i = 0; i < FUNCTION_PRIORITY.length; i++) {
    if (test(FUNCTION_PRIORITY[i], port)) {
      return FUNCTION_PRIORITY[i];
    }
  }
}

function sendMessage(input) {
  if (!started) start();
  const res = configuration.fastestFunction(configuration.port, JSON.stringify(input) + '\r\n');
  if (res.status !== 0) {
    throw new Error(res.stderr.toString());
  }
  if (res.error) {
    if (typeof res.error === 'string') res.error = new Error(res.error);
    throw res.error;
  }
  return JSON.parse(res.stdout.toString('utf8'));
}

function createClient(filename, args) {
  const res = sendMessage({t: 1, f: filename, a: args});
  if (!res.s) {
    throw new Error(res.v);
  }
  const id = res.v;
  return function (args) {
    const res = sendMessage({t: 0, i: id, a: args});;
    if (!res.s) {
      throw new Error(res.v);
    }
    return res.v;
  }
}
createClient.FUNCTION_PRIORITY = FUNCTION_PRIORITY;
createClient.configuration = configuration;

module.exports = createClient;
