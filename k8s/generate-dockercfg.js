const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('registry (e.g. my-registry.azurecr.io): ', registry => {
    rl.question('username: ', username => {
        rl.question('password: ', password => {
            let dockercfg = {};
            dockercfg[registry] = {
                username,
                password,
                email: 'unused@acr.io',
                auth: new Buffer(`${username}:${password}`).toString('base64')
            }

            const json = JSON.stringify(dockercfg);
            rl.write(`dockercfg: ${new Buffer(json).toString('base64')}`);
            process.exit(0);
        });
    });
});