const template = require("./template");

const fs = require("fs");

const conclusion = process.env.CONCLUSION;
const token = process.env.GITHUB_TOKEN;

const result = JSON.parse(fs.readFileSync("./result.json", "utf8"));

console.log(result);
if (conclusion === "success") {

} else if (conclusion === "failure") {
    const message = template.answerFailedTemplate(result.sender, result.challengeId, result.answerUrl, result.error);
    const resp = await fetch("https://api.github.com/repos/ryotak-ctf/scoreboard/issues", {
        method: "POST",
        headers: {
            Authorization: `token ${token}`,
            "Content-Type": "application/json",
            "User-Agent": "ryotak-ctf scoreboard"
        },
        body: JSON.stringify({
            title: `Answer for challenge ${result.challengeId} failed`,
            body: message,
        })
    });
    if (!resp.ok) {
        throw new Error(`Failed to create an issue: ${resp.status} ${resp.statusText}`);
    }
} else {
    throw new Error(`UNEXPECTED: conclusion is not success or failure: ${conclusion}`);
}