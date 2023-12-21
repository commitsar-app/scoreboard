function answerFailedTemplate(sender, challengeId, answerUrl, error) {
    return `
Hello @${sender}!

[Your answer](${answerUrl}) for challenge ${challengeId} failed to pass the validation.

Please check the error message below for more details:
\`\`\`
${error}
\`\`\`

If you believe this is an error, please contact [RyotaK](https://twitter.com/ryotkak) or [open an issue](https://github.com/ryotak-ctf/scoreboard/issues/new).
`;
}

function answerCorrectTemplate(sender, challengeId, answerUrl) {
    return `
Hello @${sender}!

Congratulations! [Your answer](${answerUrl}) for challenge ${challengeId} is correct!

The scoreboard will be updated within a few minutes ;)
`;
}

exports.answerFailedTemplate = answerFailedTemplate;
exports.answerCorrectTemplate = answerCorrectTemplate;