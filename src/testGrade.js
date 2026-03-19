import mongoose from "mongoose";
import Grade from "./app/models/Grade.js";
import { connectToDB } from "./app/lib/mongodb.js";

async function runTest() {
  await connectToDB();

  const testGrade = new Grade({
    userId: "69b165731a07322b49e91fe2", // replace with real Staff _id
    taskId: "69b7d94788da9a024fc5a1b3", // optional
    score: 85,
    gradedBy: "69b93e16c61e81650950edb3", // replace with real assessor _id
  });

  await testGrade.save();
  console.log("Grade saved:", testGrade);
  process.exit();
}

runTest().catch(console.error);