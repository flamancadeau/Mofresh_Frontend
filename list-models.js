import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.VITE_GOOGLE_AI_KEY);
  try {
    const modelList = await genAI.listModels();
    console.log("Available Models:");
    console.log(JSON.stringify(modelList, null, 2));
  } catch (error) {
    console.error("Error listing models:", error.message);
  }
}

listModels();
