const challengeId = process.env.CHALLENGE_ID;
const sender = process.env.SENDER;

(async () => {
    // stats repository file
    const contentResp = await fetch(`https://api.github.com/repos/ryotak-ctf/scoreboard/contents/challenges_${challengeId}/solvers.json`, {
        headers: {
            // retrieve the raw content instead of the base64-encoded content
            Accept: 'application/vnd.github.raw'
        }
    });


    let flag;
    let solvers = [];
    if (contentResp.status === 404) {
        flag = true;
    } else {
        solvers = await contentResp.json();
        if (!solvers.includes(sender)) {
            flag = true;
        }
    }

    if (!flag) {
        return;
    }

    const putResp = await fetch(`https://api.github.com/repos/ryotak-ctf/scoreboard/contents/challenges_${challengeId}/solvers.json`, {
        method: "PUT",
        headers: {
            Authorization: `token ${process.env.GITHUB_TOKEN}`,
            "Content-Type": "application/json",
            "User-Agent": "ryotak-ctf scoreboard"
        },
        body: JSON.stringify({
            message: `Add ${sender} to challenges_${challengeId}/solvers.json`,
            content: Buffer.from(JSON.stringify([...solvers, sender])).toString("base64"),
            sha: contentResp.status === 404 ? null : contentResp.headers.get("ETag").replace(/"/g, "")
        })
    });
    console.log(await putResp.text());
})();