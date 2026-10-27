const assert = require("node:assert/strict");
const http = require("node:http");
const { after, before, test } = require("node:test");
const express = require("express");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

const destinationModelPath = require.resolve("../src/models/Destination");
const userModelPath = require.resolve("../src/models/User");
const controllerPath = require.resolve("../src/controllers/destinationController");
const middlewarePath = require.resolve("../src/middleware/authMiddleware");
const routePath = require.resolve("../src/routes/destinationRoutes");
const originalModules = new Map(
  [destinationModelPath, userModelPath, controllerPath, middlewarePath, routePath]
    .map((path) => [path, require.cache[path]])
);

const controllerCalls = [];

function controller(name, response) {
  return (req, res) => {
    controllerCalls.push(name);
    res.status(response.status || 200).json(response.body);
  };
}

function request(server, method, path, token) {
  return new Promise((resolve, reject) => {
    const { port } = server.address();
    const requestOptions = {
      method,
      path,
      hostname: "127.0.0.1",
      port,
      headers: token ? { Cookie: `explore_world_session=${token}` } : {}
    };
    const request = http.request(requestOptions, (response) => {
      response.resume();
      response.on("end", () => resolve(response.statusCode));
    });
    request.on("error", reject);
    request.end();
  });
}

function loadRoutes() {
  require.cache[userModelPath] = {
    id: userModelPath,
    filename: userModelPath,
    loaded: true,
    exports: {
      findById() {
        return {
          select: async () => ({ role: process.env.TEST_USER_ROLE || "user" })
        };
      }
    }
  };
  require.cache[destinationModelPath] = {
    id: destinationModelPath,
    filename: destinationModelPath,
    loaded: true,
    exports: {}
  };
  require.cache[controllerPath] = {
    id: controllerPath,
    filename: controllerPath,
    loaded: true,
    exports: {
      createDestination: controller("create", { status: 201, body: {} }),
      getDestinations: controller("getAll", { body: [] }),
      getDestinationById: controller("getOne", { body: {} }),
      updateDestination: controller("update", { body: {} }),
      deleteDestination: controller("delete", { body: {} })
    }
  };
  delete require.cache[middlewarePath];
  delete require.cache[routePath];
  return require("../src/routes/destinationRoutes");
}

function createServer() {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use("/api/destinations", loadRoutes());
  return new Promise((resolve) => {
    const server = app.listen(0, () => resolve(server));
  });
}

function sessionToken() {
  return jwt.sign({ sub: "test-user" }, process.env.JWT_SECRET);
}

before(() => {
  process.env.JWT_SECRET = "test-secret";
  process.env.FRONTEND_ORIGINS = "http://localhost:5173";
});

after(() => {
  for (const [path, module] of originalModules) {
    if (module) require.cache[path] = module;
    else delete require.cache[path];
  }
});

test("anonymous destination reads are permitted", async () => {
  controllerCalls.length = 0;
  const server = await createServer();

  try {
    assert.equal(await request(server, "GET", "/api/destinations"), 200);
    assert.equal(await request(server, "GET", "/api/destinations/507f1f77bcf86cd799439011"), 200);
    assert.deepEqual(controllerCalls, ["getAll", "getOne"]);
  } finally {
    server.close();
  }
});

test("anonymous destination mutations return 401", async () => {
  const server = await createServer();

  try {
    for (const [method, path] of [
      ["POST", "/api/destinations"],
      ["PUT", "/api/destinations/507f1f77bcf86cd799439011"],
      ["PATCH", "/api/destinations/507f1f77bcf86cd799439011"],
      ["DELETE", "/api/destinations/507f1f77bcf86cd799439011"]
    ]) {
      assert.equal(await request(server, method, path), 401);
    }
  } finally {
    server.close();
  }
});

test("regular-user destination mutations return 403", async () => {
  process.env.TEST_USER_ROLE = "user";
  const server = await createServer();
  const token = sessionToken();

  try {
    for (const [method, path] of [
      ["POST", "/api/destinations"],
      ["PUT", "/api/destinations/507f1f77bcf86cd799439011"],
      ["PATCH", "/api/destinations/507f1f77bcf86cd799439011"],
      ["DELETE", "/api/destinations/507f1f77bcf86cd799439011"]
    ]) {
      assert.equal(await request(server, method, path, token), 403);
    }
  } finally {
    server.close();
  }
});

test("administrator destination mutations reach their controllers", async () => {
  process.env.TEST_USER_ROLE = "admin";
  controllerCalls.length = 0;
  const server = await createServer();
  const token = sessionToken();

  try {
    for (const [method, path] of [
      ["POST", "/api/destinations"],
      ["PUT", "/api/destinations/507f1f77bcf86cd799439011"],
      ["PATCH", "/api/destinations/507f1f77bcf86cd799439011"],
      ["DELETE", "/api/destinations/507f1f77bcf86cd799439011"]
    ]) {
        const status = await request(server, method, path, token);
        assert.notEqual(status, 401);
        assert.notEqual(status, 403);
    }
    assert.deepEqual(controllerCalls, ["create", "update", "update", "delete"]);
  } finally {
    server.close();
  }
});
