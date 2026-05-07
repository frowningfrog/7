const net = require("net");
const readline = require("node:readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const client = net.createConnection({ port: 5000 }, () => {
  console.log("Connected. Type a fruit name to look it up.");
});

client.setEncoding("utf8");

client.on("data", (data) => {
  const message = data.trim();

  if (message.startsWith("UNKNOWN:")) {
    // Server couldn't find the fruit — ask the user for its color
    const fruitName = message.slice("UNKNOWN:".length);
    rl.question(`"${fruitName}" not found. Enter its color: `, (color) => {
      if (color.trim()) {
        client.write(`\n${fruitName} ${color.trim()}`);
      }
    });
  } else {
    console.log(message);
  }
});

client.on("end", () => {
  console.log("Disconnected from server.");
  rl.close();
  process.exit(0);
});

client.on("error", (err) => {
  console.error(`Connection error: ${err.message}`);
  process.exit(1);
});

rl.on("line", (input) => {
  const message = input.trim();
  if (message) {
    client.write(message + "\n");
  }
});
