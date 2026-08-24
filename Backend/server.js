require("dotenv").config();

const connectDB = require("./config/db");
const app = require("./app");

// const { testAI } = require("./services/ai.service");
connectDB();

app.listen(3000,async () => {
  console.log("server started..");

  // console.log(
  //   "Gemini AI key loaded:",
  //   Boolean(process.env.Gemini_API_KEY)
  // );

// const result = await testAI();
// console.log("AI response:", result);
});