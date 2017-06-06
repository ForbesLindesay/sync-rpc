const rpc = require('../');

const client = rpc(__dirname + '/../test-worker.js', 'My Server');
test('it should work', () => {
  for (let i = 0; i < 10; i++) {
    expect(client('My Message')).toBe('sent My Message to My Server');
  }
});

rpc.FUNCTION_PRIORITY.forEach((fn, i) => {
  test('profile ' + fn.name, () => {
    try {
      rpc.configuration.fastestFunction = fn;
      const start = Date.now();
      for (let i = 0; i < 100; i++) {
        expect(client('My Message')).toBe('sent My Message to My Server');
      }
      const end = Date.now();
      console.log(fn.name + ': ' + (end - start));
    } catch (ex) {
      console.log(fn.name + ' fails');
    }
  });
});
