function init(connection) {
  return function(message) {
    if (message === 'slow') {
      return new Promise(resolve =>
        setTimeout(() => resolve('slow'), 8 * 60 * 1000)
      );
    }
    return Promise.resolve('sent ' + message + ' to ' + connection);
  };
}
module.exports = init;
