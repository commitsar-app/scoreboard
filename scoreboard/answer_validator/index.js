const { decrypt } = require("./encryption.js");
const cp = require("child_process");

const CLIENT_PAYLOAD = process.env.ENCRYPTED_CLIENT_PAYLOAD;
if (!CLIENT_PAYLOAD) {
	throw new Error("UNEXPECTED: CLIENT_PAYLOAD environment variable is not set");
}
const ENCRYPTION_PASSWORD = process.env.ENCRYPTION_PASSWORD;
if (!ENCRYPTION_PASSWORD) {
	throw new Error("UNEXPECTED: ENCRYPTION_PASSWORD environment variable is not set");
}

let eventPayload;
try {
	eventPayload = JSON.parse(await decrypt(CLIENT_PAYLOAD, ENCRYPTION_PASSWORD));
} catch (e) {
	throw new Error(`UNEXPECTED: Could not decrypt payload: ${e}. Check your ENCRYPTION_PASSWORD.`);
}

if (!eventPayload) {
	throw new Error("UNEXPECTED: Payload could not be parsed.");
}

try {
	await runValidation(eventPayload);
} catch (e) {
	console.log(`::error::${e}`);
	process.exit(1);
}


async function runValidation(eventPayload) {

	const advisory = eventPayload.repository_advisory;
	if (!advisory) {
		throw new Error("No advisory found in payload.");
	}
	const problemId = advisory.summary?.trim();
	if (!problemId) {
		throw new Error("No problem ID found in advisory.");
	}
	// check if the problem id is an integer
	const problemIdNum = Number(problemId);
	if (!Number.isInteger(problemIdNum)) {
		throw new Error("Problem ID is not an integer.");
	}
	const sender = eventPayload.sender?.login;
	if (!sender) {
		throw new Error("No sender found in payload.");
	}
	const answer = advisory.description;
	if (!answer) {
		throw new Error("No answer found in payload.");
	}

	// mask the answer
	for (const line of answer.split(/[\n\r]/)) {
		if (line.trim().length === 0) {
			continue;
		}
		console.log(`::add-mask::${line}`);
	}

	// run ./challenges_problemIdNum/run.sh and check for the exit code
	// pass the answer as a INPUT environment variable
	const runScript = cp.spawnSync(`./challenges_${problemIdNum}/run.sh`, {
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
