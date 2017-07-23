const {Service, Container} = require('@quilt/quilt');

const port = 6379;
const image = 'quilt/redis';

/**
 * Creates a replicated Redis database.
 * @param {number} nWorker - The desired number of Redis replicas.
 * @param {string} auth - The password for authenticating with Redis instances.
 */
function Redis(nWorker, auth) {
    this.master = createMaster(auth);
    this.workers = createWorkers(nWorker, auth, this.master);
    this.master.allowFrom(this.workers, port);
    this.workers.allowFrom(this.master, port);

    this.deploy = function(deployment) {
        deployment.deploy([this.master, this.workers]);
    };

    // Only masters can accept write requests, so for simplicity, allowFrom
    // only connects other services to the master.
    this.allowFrom = function(senderService, port) {
      this.master.allowFrom(senderService, port);
    };
}

/**
 * Creates a service with a master Redis instance.
 * @param {string} auth - The password for autheticating with Redis.
 * @return {Service} - The Redis master service.
 */
function createMaster(auth) {
    return new Service('redis-ms', [
        new Container(image, ['run']).withEnv({
            'ROLE': 'master',
            'AUTH': auth,
        }),
    ]);
}

/**
 * Creates a service with replicated Redis workers.
 * @param {number} n - The desired number of workers.
 * @param {string} auth - The password for autheticating with Redis.
 * @param {Service} master - The master Redis service.
 * @return {Service} - The worker Redis service.
 */
function createWorkers(n, auth, master) {
    let refWorker = new Container(image, ['run']).withEnv({
        'ROLE': 'worker',
        'AUTH': auth,
        'MASTER': master.hostname(),
    });
    return new Service('redis-wk', refWorker.replicate(n));
}

module.exports = Redis;
