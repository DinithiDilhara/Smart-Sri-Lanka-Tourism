const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");

const userModelPath = require.resolve("../src/models/User");
const middlewarePath = require.resolve("../src/middleware/authMiddleware");
const originalUserModel = require.cache[userModelPath];
const originalMiddleware = require.cache[middlewarePath];

function loadMiddlewareWithUser(user) {
  require.cache[userModelPath] = {
    id: userModelPath,
    filename: userModelPath,
    loaded: true,
    exports: {
      findById() {
        return {
          select: async () => user
        };
      }
    }
  };
  delete require.cache[middlewarePath];
  return require("../src/middleware/authMiddleware");
}

function responseDouble() {
  return {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    }
  };
}

after(() => {
  if (originalUserModel) require.cache[userModelPath] = originalUserModel;
  else delete require.cache[userModelPath];
  if (originalMiddleware) require.cache[middlewarePath] = originalMiddleware;
  else delete require.cache[middlewarePath];
});

test("requireAdmin allows a current admin user", async () => {
  const { requireAdmin } = loadMiddlewareWithUser({ role: "admin" });
  let nextCalled = false;

  await requireAdmin({ user: { sub: "admin-id" } }, responseDouble(), () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
});

test("requireAdmin rejects a regular user", async () => {
  const { requireAdmin } = loadMiddlewareWithUser({ role: "user" });
  const response = responseDouble();
  let nextCalled = false;

  await requireAdmin({ user: { sub: "user-id" } }, response, () => {
    nextCalled = true;
  });

  assert.equal(response.statusCode, 403);
  assert.deepEqual(response.body, { message: "Administrator access required" });
  assert.equal(nextCalled, false);
});
