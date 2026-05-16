const http = require("http");
const crypto = require("crypto");
const { spawn } = require("child_process");

const SECRET = process.env.GITHUB_WEBHOOK_SECRET;
const PORT = Number(process.env.WEBHOOK_PORT || 9000);
const HOST = process.env.WEBHOOK_HOST || "127.0.0.1";
const PATHNAME = process.env.WEBHOOK_PATH || "/github-webhook";
const BRANCH = process.env.BRANCH || "main";
const DEPLOY_SCRIPT = process.env.DEPLOY_SCRIPT || "/opt/personachat/deploy-from-git.sh";
const MAX_BODY_BYTES = Number(process.env.WEBHOOK_MAX_BODY_BYTES || 1024 * 1024);

if (!SECRET) {
  console.error("Missing GITHUB_WEBHOOK_SECRET");
  process.exit(1);
}

let deploymentRunning = false;

function send(res, statusCode, body) {
  res.writeHead(statusCode, { "content-type": "text/plain; charset=utf-8" });
  res.end(body);
}

function verifySignature(rawBody, signature) {
  if (!signature || !signature.startsWith("sha256=")) {
    return false;
  }

  const expected =
    "sha256=" + crypto.createHmac("sha256", SECRET).update(rawBody).digest("hex");
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  return (
    actualBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(actualBuffer, expectedBuffer)
  );
}

function runDeployment(deliveryId) {
  if (deploymentRunning) {
    console.log(`[${deliveryId}] Deployment already running; latest push will be included by git fetch.`);
    return;
  }

  deploymentRunning = true;
  console.log(`[${deliveryId}] Starting deployment: ${DEPLOY_SCRIPT}`);

  const child = spawn(DEPLOY_SCRIPT, [], {
    env: process.env,
    stdio: ["ignore", "pipe", "pipe"],
  });

  child.stdout.on("data", chunk => {
    process.stdout.write(`[${deliveryId}] ${chunk}`);
  });

  child.stderr.on("data", chunk => {
    process.stderr.write(`[${deliveryId}] ${chunk}`);
  });

  child.on("close", code => {
    deploymentRunning = false;
    if (code === 0) {
      console.log(`[${deliveryId}] Deployment finished.`);
    } else {
      console.error(`[${deliveryId}] Deployment failed with exit code ${code}.`);
    }
  });
}

const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/health") {
    send(res, 200, "ok");
    return;
  }

  if (req.method !== "POST" || req.url !== PATHNAME) {
    send(res, 404, "Not found");
    return;
  }

  const chunks = [];
  let bodySize = 0;

  req.on("data", chunk => {
    bodySize += chunk.length;
    if (bodySize > MAX_BODY_BYTES) {
      req.destroy();
      return;
    }
    chunks.push(chunk);
  });

  req.on("end", () => {
    const rawBody = Buffer.concat(chunks);
    const signature = req.headers["x-hub-signature-256"];
    const event = req.headers["x-github-event"];
    const deliveryId = req.headers["x-github-delivery"] || "manual";

    if (!verifySignature(rawBody, signature)) {
      send(res, 401, "Bad signature");
      return;
    }

    let payload;
    try {
      payload = JSON.parse(rawBody.toString("utf8"));
    } catch (error) {
      send(res, 400, "Bad JSON");
      return;
    }

    if (event === "ping") {
      send(res, 200, "pong");
      return;
    }

    if (event !== "push") {
      send(res, 202, `Ignored event: ${event}`);
      return;
    }

    const expectedRef = `refs/heads/${BRANCH}`;
    if (payload.ref !== expectedRef) {
      send(res, 202, `Ignored ref: ${payload.ref}`);
      return;
    }

    runDeployment(deliveryId);
    send(res, 202, "Deployment queued");
  });

  req.on("error", error => {
    console.error(error);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`GitHub webhook listening on http://${HOST}:${PORT}${PATHNAME}`);
});

