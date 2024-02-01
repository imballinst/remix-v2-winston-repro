import { createRequestHandler } from "@remix-run/express";
import { ServerBuild, broadcastDevReady } from "@remix-run/node";
import express from "express";
import { createLogger } from "winston";

// notice that the result of `remix build` is "just a module"
import * as build from "./build/index.js";

const serverBuild = build as unknown as ServerBuild;

declare module "@remix-run/server-runtime" {
  interface AppLoadContext {
    logger: {
      info(message: string): void;
    };
  }
}

const app = express();
app.use(express.static("public"));

// and your app is "just a request handler"
app.all(
  "*",
  createRequestHandler({
    build: serverBuild,
    getLoadContext() {
      return { logger: createLogger() };
    },
  })
);

app.listen(3000, () => {
  if (process.env.NODE_ENV === "development") {
    broadcastDevReady(serverBuild);
  }

  console.log("App listening on http://localhost:3000");
});
