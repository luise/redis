const {Service, Container} = require("@quilt/quilt");

const port = 6379;
var image = "quilt/redis";

function Redis(nWorker, auth) {
    this.master = createMaster(auth);
    this.workers = createWorkers(nWorker, auth, this.master);
    this.master.allowFrom(this.workers, port);
    this.workers.allowFrom(this.master, port);

    this.deploy = function(deployment) {
        deployment.deploy([this.master, this.workers]);
    }

    // Only masters can accept write requests, so for simplicity, allowFrom
    // only connects other services to the master.
    this.allowFrom = function(senderService, port) {
      this.master.allowFrom(senderService, port);
    }
}

function createMaster(auth) {
    return new Service("redis-ms", [
        new Container(image, ["run"]).withEnv({
            "ROLE": "master",
            "AUTH": auth,
        })
    ]);
}

function createWorkers(n, auth, master) {
    var refWorker = new Container(image, ["run"]).withEnv({
        "ROLE": "worker",
        "AUTH": auth,
        "MASTER": master.hostname(),
    });
    return new Service("redis-wk", refWorker.replicate(n));
}

module.exports = Redis;
