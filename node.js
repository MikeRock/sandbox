import cluster from "cluster";
import net from "net";
import os from "os";
cluster.setupMaster({
  exec: "node2.js",
  stdio: ["pipe", "inherit", "inherit", "ipc"],
  args: ["test", "test2"]
});
if (cluster.isMaster) {
  cluster.on("online", worker => {
    console.log(`WORKER ${worker.process.pid} ONLINE`);
    process.stdin.pipe(worker.process.stdin);
  });

  cluster.on("listening", worker => {
    console.log(`WORKER ${worker.process.pid} LISTENING`);
  });
  cluster.on("fork", worker => {
    console.log(`WORKER ${worker.process.pid} FORKED`);
  });
  cluster.on("disconnect", worker => {
    console.log(`WORKER ${worker.process.pid} DISCONNECTED`);
    setTimeout(() => {
      // worker.kill()
    }, 6000);
  });
  const fork = cluster.fork();
  setTimeout(() => {
    console.log("END");
  }, 5000);
} else {
  const server = net.createServer(socket => {});
  server.listen(0, () => {
    console.log(`SERVER LISTENING ON PORT ${server.address().port}`);
  });
  server.on("close", () => console.log("SERVER CLOSED"));

  setTimeout(() => {
    cluster.worker.kill();
  }, 1000);
}
