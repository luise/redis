const { Container, allow } = require('@quilt/quilt');

const port = 6379;
const image = 'quilt/redis';

/**
 * Creates a master Redis container.
 * @param {string} auth - The password for autheticating with Redis.
 * @return {Container} The Redis master container.
 */
function createMaster(auth) {
  return new Container('redis-master', image, {
    command: ['run'],
    env: {
      ROLE: 'master',
      AUTH: auth,
    },
  });
}

/**
 * Creates replicated Redis workers.
 * @param {number} n - The desired number of workers.
 * @param {string} auth - The password for autheticating with Redis.
 * @param {Container} master - The master Redis container.
 * @return {Container[]} - The worker Redis containers.
 */
function createWorkers(n, auth, master) {
  const workers = [];
  for (let i = 0; i < n; i += 1) {
    workers.push(
      new Container('redis-wk', image, {
        command: ['run'],
        env: {
          ROLE: 'worker',
          AUTH: auth,
          MASTER: master.getHostname(),
        },
      }));
  }
  return workers;
}

/**
 * Creates a replicated Redis database.
 * @param {number} nWorker - The desired number of Redis replicas.
 * @param {string} auth - The password for authenticating with Redis instances.
 */
function Redis(nWorker, auth) {
  this.master = createMaster(auth);
  this.workers = createWorkers(nWorker, auth, this.master);
  this.master.allowFrom(this.workers, port);
  allow(this.master, this.workers, port);

  this.deploy = function deploy(deployment) {
    this.master.deploy(deployment);
    this.workers.forEach(worker => worker.deploy(deployment));
  };

  // Only masters can accept write requests, so for simplicity, allowFrom
  // only connects other services to the master.
  this.allowFrom = function allowFrom(src) {
    this.master.allowFrom(src, port);
  };
}

module.exports = Redis;
