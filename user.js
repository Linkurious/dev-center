(function () {
  const prompt = require('prompt');
  const credentials = require('./src/credentials');
  const C = require('./src/config');

  function exit(code, msg) {
    console.error(msg);
    process.exit(code);
  }

  const VALID_COMMANDS = ['add', 'del', 'update'];

  var argv = process.argv.slice(2),
      command = argv[0],
      user = argv[1], subdomain = argv[2];

  if (argv.length != 3 || VALID_COMMANDS.indexOf(command) === -1) {
    exit(1, `Usage: node user.js add|del|update <username> <sub-domain>`);
  }

  if (subdomain !== 'all' && C.APPS.indexOf(subdomain) === -1) {
    exit(2, `sub-domain "${subdomain}" does not exist`);
  }

  if (command === 'add' || command === 'update') {
    var userExists = credentials.hasAccess(subdomain, user);

    if (userExists && command === 'add') {
      exit(3, `unable to add user ${user} to sub-domain ${subdomain}: this user already exists; use the "update" command if you wish to update this user's password`);
    } else if (!userExists && command === 'update') {
      exit(3, `unable to update user ${user} in sub-domain ${subdomain}: this user does not exist; use the "add" command if you wish to add this user`);
    }

    prompt.start();
    prompt.get({
      properties: {
        password: {
          description: 'Enter the password',
          required: true,
          hidden: true
        }
      }
    }, function (err, result) {
      if (err) {
        console.error(err);
        process.exit(3);
      }

      var password = result.password;

      credentials.add(subdomain, user, password);
      console.log(`User ${user} successfully ${userExists ? 'updated in' : 'added to'} sub-domain ${subdomain}!`);
    });

  } else if (command === 'del') {
    credentials.remove(subdomain, user);
    console.log(`User ${user} successfully removed from ${subdomain}!`);
  }
})();