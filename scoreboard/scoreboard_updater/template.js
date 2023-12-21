function generateSolversList(challengeId, solvers) {
    const template = `## Solvers for challenge ${challengeId}\n`
    + `| User |\n`
    + `| ---- |\n`
        + solvers.map(solver => `| [@${solver}](https://github.com/${solver}) |`).join("\n");
    return template;
}

exports.generateSolversList = generateSolversList;