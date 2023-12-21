const fs = require("fs");

const conclusion = process.env.CONCLUSION;
const result = JSON.parse(fs.readFileSync("./result.json", "utf8"));

console.log(result);
if (conclusion === "success") {

}else if(conclusion === "failure") {

}else {
    throw new Error(`UNEXPECTED: conclusion is not success or failure: ${conclusion}`);
}