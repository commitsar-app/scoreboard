const { generateSolversList } = require("./template");

const challengeId = process.env.CHALLENGE_ID;
const sender = process.env.SENDER;

(async () => {
    // stats repository file
    const jsonResp = await fetch(`https://api.github.com/repos/ryotak-ctf/scoreboard/contents/challenges_${challengeId}/solvers.json`, {
        headers: {
            // retrieve the raw content instead of the base64-encoded content
            Accept: 'application/vnd.github.raw'
        }
    });


    let flag;
    let solvers = [];
    if (jsonResp.status === 404) {
        flag = true;
    } else {
        solvers = await jsonResp.json();
        if (!solvers.includes(sender)) {
            flag = true;
        }
    }

    if (!flag) {
        return;
    }

    const jsonPutResp = await fetch(`https://api.github.com/repos/ryotak-ctf/scoreboard/contents/challenges_${challengeId}/solvers.json`, {
        method: "PUT",
        headers: {
            Authorization: `token ${process.env.GITHUB_TOKEN}`,
            "Content-Type": "application/json",
            "User-Agent": "ryotak-ctf scoreboard"
        },
        body: JSON.stringify({
            message: `Add ${sender} to challenges_${challengeId}/solvers.json`,
            content: Buffer.from(JSON.stringify([...solvers, sender])).toString("base64"),
            sha: jsonResp.status === 404 ? null : jsonResp.headers.get("ETag").replace(/"/g, "")
        })
    });
    if (!jsonPutResp.ok) {
        throw new Error(`Failed to update solvers.json: ${jsonPutResp.status} ${jsonPutResp.statusText}`);
    }

    const mdResp = await fetch(`https://api.github.com/repos/ryotak-ctf/scoreboard/contents/challenges_${challengeId}/solvers.md`, {
        headers: {
            // retrieve the raw content instead of the base64-encoded content
            Accept: 'application/vnd.github.raw'
        }
    });

    const solversMd = generateSolversList(challengeId, solvers);
    const mdPutResp = await fetch(`https://api.github.com/repos/ryotak-ctf/scoreboard/contents/challenges_${challengeId}/solvers.md`, {
        method: "PUT",
        headers: {
            Authorization: `token ${process.env.GITHUB_TOKEN}`,
            "Content-Type": "application/json",
            "User-Agent": "ryotak-ctf scoreboard"
        },
        body: JSON.stringify({
            message: `Add ${sender} to challenges_${challengeId}/solvers.md`,
            content: Buffer.from(solversMd).toString("base64"),
            sha: mdResp.status === 404 ? null : mdResp.headers.get("ETag").replace(/"/g, "")
        })
    });

    if (!mdPutResp.ok) {
        throw new Error(`Failed to update solvers.md: ${mdPutResp.status} ${mdPutResp.statusText}`);
    }
})();