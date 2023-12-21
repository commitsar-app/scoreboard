const { decrypt } = require("./encryption.js");
const crypto = require("crypto");
const cp = require("child_process");
const fs = require("fs");

const CLIENT_PAYLOAD = process.env.ENCRYPTED_CLIENT_PAYLOAD;
if (!CLIENT_PAYLOAD) {
	throw new Error("UNEXPECTED: CLIENT_PAYLOAD environment variable is not set");
}
const ENCRYPTION_PASSWORD = process.env.ENCRYPTION_PASSWORD;
if (!ENCRYPTION_PASSWORD) {
	throw new Error("UNEXPECTED: ENCRYPTION_PASSWORD environment variable is not set");
}

(async () => {
	const stopCommandId = crypto.randomUUID();
	// disable the Actions commands to prevent the garbages from being parsed as commands
	let eventPayload;
	let challengeIdNum;
	let answer;
	let sender;
	try {
		try {
			eventPayload = JSON.parse(await decrypt(CLIENT_PAYLOAD, ENCRYPTION_PASSWORD));
		} catch (e) {
			throw new Error(`UNEXPECTED: Could not decrypt payload: ${e}. Check your ENCRYPTION_PASSWORD.`);
		}

		if (!eventPayload) {
			throw new Error("UNEXPECTED: Payload could not be parsed.");
		}

		const advisory = eventPayload.repository_advisory;
		if (!advisory) {
			throw new Error("No advisory found in payload.");
		}
		const challengeId = advisory.summary?.trim();
		if (!challengeId) {
			throw new Error("No challenge ID found in advisory.");
		}
		// validate if the challenge id is an integer
		challengeIdNum = Number(challengeId);
		if (!Number.isInteger(challengeIdNum)) {
			throw new Error("challenge ID is not an integer.");
		}
		sender = eventPayload.sender?.login;
		if (!sender) {
			throw new Error("No sender found in payload.");
		}
		answer = advisory.description;
		if (!answer) {
			throw new Error("No answer found in payload.");
		}
	} catch (e) {
		console.log(`::error::${e}`);
		// something went very wrong, so notify me instead of the sender
		fs.writeFileSync("./result.json", JSON.stringify({
			error: e.message,
			answerUrl: eventPayload?.repository_advisory?.html_url,
			sender: "Ry0taK",
			challengeId: challengeIdNum,
			correct: false,
		}));
		return;
	}

	try {
		await runValidation(challengeIdNum, answer);
		fs.writeFileSync("./result.json", JSON.stringify({
			answerUrl: eventPayload?.repository_advisory?.html_url,
			sender,
			challengeId: challengeIdNum,
			correct: true,
		}));
	} catch (e) {
		console.log(`::error::${e}`);
		fs.writeFileSync("./result.json", JSON.stringify({
			error: e.message,
			sender,
			answerUrl: eventPayload.repository_advisory?.html_url,
			challengeId: challengeIdNum,
			correct: false,
		}));
		return;
	}
})();

async function runValidation(challengeId, answer,) {
	// mask the answer
	for (const line of answer.split(/[\n\r]/)) {
		if (line.trim().length === 0) {
			continue;
		}
		console.log(`::add-mask::${line}`);
	}

	// check if the challenge exists
	const challengeDir = `./challenges_${challengeId}`;
	if (!fs.existsSync(challengeDir)) {
		throw new Error(`Challenge ${challengeId} does not exist.`);
	}

	const runScript = cp.spawnSync(`./challenges_${challengeId}/run.sh`, {
		stdio: "inherit",
		env: {
			...process.env,
			INPUT: answer
		}
	});
	if (runScript.status !== 0) {
		throw new Error(`Answer is not correct! Exit code: ${runScript.status}`);
	}
}
