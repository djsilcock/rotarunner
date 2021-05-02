/*eslint-env node*/

import { createServer } from "http";

import next from "next";
import { AddressInfo } from "node:net";

const listen = (server) =>
  new Promise<void>((res, rej) =>
    server.listen((err) => {
      if (err) rej(err);
      res();
    })
  );

async function runDevServer() {
  const app = next({
    dev: true,
  });
  const handle = app.getRequestHandler();

  await app.prepare();
  const server = createServer(handle);
  await listen(server);

  return {
    port: (server.address() as AddressInfo).port,
    close: () => app.close().then(() => {server.close()}),
  };
}

export default function (on, config) {
  on("task", () => {
    let closeServer:()=>Promise<void>;
    return {
      async startServer() {
        const server = await runDevServer();
        closeServer = server.close;
        return server.port;
      },
      stopServer() {
        return closeServer();
      },
    };
  });
  config.env.reactDevtools = true;

  return config;
}
