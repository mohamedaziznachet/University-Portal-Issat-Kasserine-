const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const User = require("../src/models/User");
const { mongoUri } = require("../src/config/env");

async function seedTeachers() {
  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB...");

    // Read teachers from frontend data
    const teachersDataPath = path.resolve(__dirname, "../../frontend/src/data/teachersIssat.json");
    const teachers = JSON.parse(fs.readFileSync(teachersDataPath, "utf-8"));

    console.log(`Found ${teachers.length} teachers to seed.`);

    let count = 0;
    for (const t of teachers) {
      // Check if user already exists
      const existing = await User.findOne({ email: t.email.toLowerCase() });
      if (existing) {
        console.log(`Skipping existing teacher: ${t.email}`);
        continue;
      }

      // Create new teacher user
      // Default CIN is generated or set to something unique if missing, but User model says CIN is required for non-visitors.
      // I'll use a dummy CIN based on email hash or just a sequence.
      const dummyCin = Math.random().toString().slice(2, 10); 

      const newUser = new User({
        firstName: t.prenom,
        lastName: t.nom,
        email: t.email.toLowerCase(),
        role: "teacher",
        status: "active",
        password: "IssatPassword2024!", // Default password
        filiere: t.filiere,
        grade: t.grade,
        cin: dummyCin,
        uploads: {
          studentPhoto: t.photoPath
        }
      });

      await newUser.save();
      count++;
    }

    console.log(`Successfully seeded ${count} teachers.`);
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

seedTeachers();
