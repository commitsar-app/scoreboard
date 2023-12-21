const template = require("./template");

const fs = require("fs");

const token = process.env.GITHUB_TOKEN;
const result = JSON.parse(fs.readFileSync("./result.json", "utf8"));

(async () => {
    console.log(result);
    let title;
    let message;
    if (result.correct) {
        title = `Answer for challenge ${result.challengeId} is correct`;
        message = template.answerCorrectTemplate(result.sender, result.challengeId, result.answerUrl);
        const resp = await fetch("https://api.github.com/repos/ryotak-ctf/scoreboard/dispatches", {
            method: "POST",
            headers: {
                Authorization: `token ${token}`,
                "Content-Type": "application/json",
                "User-Agent": "ryotak-ctf scoreboard"
            },
            body: JSON.stringify({
                event_type: "update_scoreboard",
                client_payload: {
                    sender: result.sender,
                    challengeId: result.challengeId,
                }
            })
        });
        if (!resp.ok) {
            throw new Error(`Failed to dispatch an event: ${resp.status} ${resp.statusText} ${await resp.text()}`);
        }
    } else {
        title = `Answer for challenge ${result.challengeId} failed`;
        message = template.answerFailedTemplate(result.sender, result.challengeId, result.answerUrl, result.error);
    }
    let resp = await fetch("https://api.github.com/repos/ryotak-ctf/scoreboard/issues", {
        method: "POST",
        headers: {
            Authorization: `token ${token}`,
            "Content-Type": "application/json",
            "User-Agent": "ryotak-ctf scoreboard"
        },
        body: JSON.stringify({
            title,
            body: message,
        })
    });
    if (!resp.ok) {
        throw new Error(`Failed to create an issue: ${resp.status} ${resp.statusText}`);
    }
    const issue = await resp.json();
    resp = await fetch(`https://api.github.com/repos/ryotak-ctf/scoreboard/issues/${issue.number}`, {
        method: "PATCH",
        headers: {
            Authorization: `token ${token}`,
            "Content-Type": "application/json",
            "User-Agent": "ryotak-ctf scoreboard"
        },
        body: JSON.stringify({
            state: "closed"
        })
    });
    if (!resp.ok) {
        throw new Error(`Failed to close the issue: ${resp.status} ${resp.statusText}`);
    }
})();