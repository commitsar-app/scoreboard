function generateSolversList(challengeId, solvers) {
    const template = `## Solvers for challenge ${challengeId}\n`
        + solvers.map(solver => `- @${solver}`).join("\n");
    return template;
}

exports.generateSolversList = generateSolversList;