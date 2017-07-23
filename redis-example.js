const {createDeployment, Machine, githubKeys} = require("@quilt/quilt");
var Redis = require("./redis.js");

var deployment = createDeployment({});

var nWorker = 1;

// Boot redis with 2 workers and 1 master. AUTH_PASSWORD is used to secure
// the redis connection
var rds = new Redis(nWorker, "AUTH_PASSWORD");

var baseMachine = new Machine({
    provider: "Amazon",
    sshKeys: githubKeys("ejj"), // Replace with your GitHub username.
});

deployment.deploy(baseMachine.asMaster())
deployment.deploy(baseMachine.asWorker().replicate(nWorker + 1))
deployment.deploy(rds);
