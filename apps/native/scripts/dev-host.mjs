// Injects the machine's current LAN IP as NUXT_PUBLIC_API_BASE_URL before running
// the given command, so the mobile (iOS/Android) app can reach the web dev server
// on the host. Desktop dev uses the localhost default and does not need this.
//
// Usage: node apps/native/scripts/dev-host.mjs <command> [...args]
import { networkInterfaces } from "node:os";
import { spawn } from "node:child_process";

const API_PORT = 3000;

function getLanIp() {
  const nets = networkInterfaces();
  for (const addrs of Object.values(nets)) {
    for (const net of addrs ?? []) {
      // Node <18 reports family as "IPv4", newer versions as the number 4.
      const isIPv4 = net.family === "IPv4" || net.family === 4;
      if (isIPv4 && !net.internal) {
        return net.address;
      }
    }
  }
  return null;
}

const [command, ...args] = process.argv.slice(2);

if (!command) {
  console.error("[dev-host] No command provided to run.");
  process.exit(1);
}

const ip = getLanIp();

if (!ip) {
  console.error(
    "[dev-host] Could not determine a LAN IP address. Ensure you are connected to a network."
  );
  process.exit(1);
}

const apiBaseUrl = `http://${ip}:${API_PORT}`;
console.log(`[dev-host] Using API base URL: ${apiBaseUrl}`);

const child = spawn(command, args, {
  stdio: "inherit",
  env: { ...process.env, NUXT_PUBLIC_API_BASE_URL: apiBaseUrl },
  shell: process.platform === "win32",
});

child.on("error", (err) => {
  console.error(`[dev-host] Failed to start command: ${err.message}`);
  process.exit(1);
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  } else {
    process.exit(code ?? 0);
  }
});
