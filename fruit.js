const net = require("net");
const fs = require("fs");

const log_file = "server.log";

function log(name, color) {
  const line = `${name} ${color}\n`;
  fs.appendFileSync(log_file, line);
}

function read() {
  try {
    const data = fs.readFileSync(log_file, "utf8");
    return data.split(/\r?\n|\r/).filter((line) => line.trim() !== "");
  } catch {
    return [];
  }
}

const server = net
  .createServer((client) => {
    client.on("data", (data) => {
      const input = data.toString().trim();
      if (!input) return;

      const arr = read();

      // If input has two words, it's a "fruit color" save request
      const parts = input.split(" ");
      if (parts.length === 2) {
        const [name, color] = parts;
        log(name, color);
        client.write(`Saved: ${name} is ${color}\n`);
        return;
      }

      // Otherwise treat it as a fruit lookup
      const fruit = arr.find((line) => line.split(" ")[0] === input);
      if (fruit) {
        const [name, color] = fruit.split(" ");
        client.write(`${name} is ${color}\n`);
      } else {
        // Tell the client to prompt for the color
        client.write(`UNKNOWN:${input}\n`);
      }
    });

    client.on("end", () => console.log("Client disconnected."));
    client.on("error", (err) => console.error(`Client error: ${err.message}`));
  })
  .listen(5000, () => console.log("Listening on port 5000"));

server.on("error", (err) => console.error(`Server error: ${err.message}`));
