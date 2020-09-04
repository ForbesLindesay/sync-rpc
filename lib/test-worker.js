function init(connection, ...restInitArgs) {
  return function (message, ...restArgs) {
    if (message === 'big') {
      return Promise.resolve(Buffer.alloc(30 * 1024 * 1024, 42));
    }
    if (message == 'getInitArgs') {
      return Promise.resolve(
        'sent init arguments ' + JSON.stringify([connection, ...restInitArgs])
      );
    }
    if (restArgs.length > 0) {
      // arguments is object not array
      return Promise.resolve(
        'sent arguments ' +
          JSON.stringify(Array.from(arguments)) +
          ' to ' +
          connection
      );
    }
    return Promise.resolve('sent ' + message + ' to ' + connection);
  };
}
module.exports = init;
