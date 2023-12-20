const CLIENT_PAYLOAD = process.env.ENCRYPTED_CLIENT_PAYLOAD;
if (!CLIENT_PAYLOAD) {
  throw new Error("UNEXPECTED: CLIENT_PAYLOAD environment variable is not set");
}

console.log(JSON.parse(CLIENT_PAYLOAD));
