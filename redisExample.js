const { Machine, Infrastructure } = require('kelda');
const Redis = require('./redis.js');

const nWorker = 2;

// Boot redis with 2 workers and 1 master. AUTH_PASSWORD is used to secure
// the redis connection
const rds = new Redis(nWorker, 'AUTH_PASSWORD');

const baseMachine = new Machine({ provider: 'Amazon' });

const infra = new Infrastructure(baseMachine, baseMachine.replicate(nWorker));
rds.deploy(infra);
