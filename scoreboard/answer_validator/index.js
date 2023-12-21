const { decrypt } = require("./encryption.js");

const CLIENT_PAYLOAD = process.env.ENCRYPTED_CLIENT_PAYLOAD;
if (!CLIENT_PAYLOAD) {
	throw new Error("UNEXPECTED: CLIENT_PAYLOAD environment variable is not set");
}
const ENCRYPTION_PASSWORD = process.env.ENCRYPTION_PASSWORD;
if (!ENCRYPTION_PASSWORD) {
	throw new Error("UNEXPECTED: ENCRYPTION_PASSWORD environment variable is not set");
}

(async () => {
	let eventPayload;
	try {
		eventPayload = JSON.parse(await decrypt(CLIENT_PAYLOAD, ENCRYPTION_PASSWORD));
	} catch (e) {
		throw new Error(`Could not decrypt payload: ${e}. Check your ENCRYPTION_PASSWORD.`);
	}

	if(!eventPayload) {
		throw new Error("Payload could not be parsed.");
	}

	const advisory = eventPayload.repository_advisory;
	if(!advisory) {
		throw new Error("No advisory found in payload.");
	}
	const problemId = advisory.summary?.trim();
	if(!problemId) {
		throw new Error("No problem ID found in advisory.");
	}
	// check if the problem id is an integer
	const problemIdNum = Number(problemId);
	if(!Number.isInteger(problemIdNum)) {
		throw new Error("Problem ID is not an integer.");
	}
	const sender = eventPayload.sender?.login;
	if(!sender) {
		console.error("No sender found in payload.");
		process.exit(1);
	}
	const answer = advisory.description;
	if(!answer) {
		console.error("No answer found in payload.");
		process.exit(1);
	}
	

	// mask the answer
	for(const line of answer.split("\n")) {
		if(line.trim().length === 0) {
			continue;
		}
		console.log(`::add-mask::${line}`);
	}

	console.log(`Problem ID: ${problemId}\nSender: ${sender}\nAnswer: ${answer}`);
})();
