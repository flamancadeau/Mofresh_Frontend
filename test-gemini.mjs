import dotenv from 'dotenv';
dotenv.config();

async function testRest() {
  const apiKey = process.env.VITE_GOOGLE_AI_KEY;
  const url = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log("REST API Response:");
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("REST Error:", error.message);
  }
}

testRest();
