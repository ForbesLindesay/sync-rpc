var client = require('net').connect(
  process.argv[3],
  process.argv[2],
  function() {
    process.stdin.pipe(client).pipe(process.stdout);
  }
);
