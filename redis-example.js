const {createDeployment, Machine, githubKeys} = require('@quilt/quilt');
const Redis = require('./redis.js');

const deployment = createDeployment();

const nWorker = 2;

// Boot redis with 2 workers and 1 master. AUTH_PASSWORD is used to secure
// the redis connection
let rds = new Redis(nWorker, 'AUTH_PASSWORD');

let baseMachine = new Machine({
    provider: 'Amazon',
    sshKeys: githubKeys('ejj'), // Replace with your GitHub username.
});

deployment.deploy(baseMachine.asMaster());
deployment.deploy(baseMachine.asWorker().replicate(nWorker));
deployment.deploy(rds);
