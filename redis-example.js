var redis = require("github.com/quilt/redis");

var deployment = createDeployment({});

var nWorker = 1;

// Boot redis with 2 workers and 1 master. AUTH_PASSWORD is used to secure
// the redis connection
var rds = new redis.Redis(nWorker, "AUTH_PASSWORD");
rds.exclusive();

var baseMachine = new Machine({
    provider: "Amazon",
    sshKeys: githubKeys("ejj"), // Replace with your GitHub username.
});

deployment.deploy(baseMachine.asMaster())
deployment.deploy(baseMachine.asWorker().replicate(nWorker + 1))
deployment.deploy(rds);
