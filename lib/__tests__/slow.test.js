const rpc = require('../');

const client = rpc(__dirname + '/../test-worker.js', 'My Server');

jest.setTimeout(10 * 60 * 1000);

rpc.FUNCTION_PRIORITY.forEach((fn, i) => {
  test('profile ' + fn.name, () => {
    rpc.configuration.fastestFunction = fn;
    expect(client('slow')).toBe('slow');
  });
});
