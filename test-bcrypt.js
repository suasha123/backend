
const argon2 = require("argon2");

const testPassword = "password123"; // Change this to match your test case

(async () => {
    const hash = await argon2.hash(testPassword);
    console.log("Generated Hash:", hash);

    const isMatch = await argon2.verify(hash, testPassword);
    console.log("Does it match?", isMatch);
})();
