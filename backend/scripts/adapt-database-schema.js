/**
 * Migre une base MongoDB existante après ajout des champs :
 * - utilisateurs élèves : studyClass (rattrapage comptes seed / démo)
 * - cours : studyClass pour le cours seed « JAVA POO »
 * - devoirs : evaluationType + maxScore
 * - soumissions : filePath par défaut (Oral / Examen sans fichier)
 *
 * Usage (depuis le dossier backend) : npm run db:migrate
 */
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const { mongoUri } = require("../src/config/env");

const DEMO_GROUP_A = "GLSI-L2-A";
const DEMO_GROUP_B = "GLSI-L2-B";
/** CIN des étudiants du seed officiel du projet */
const SEED_STUDENTS_A = ["22222222", "22222223"];
const SEED_STUDENTS_B = ["22222224", "22222225"];

async function migrate() {
  await mongoose.connect(mongoUri);
  const db = mongoose.connection.db;

  console.log(`Connecté à ${mongoUri.replace(/:\/\/.*@/, "://***@")}`);

  const assignmentsResultEval = await db.collection("assignments").updateMany(
    { evaluationType: { $exists: false } },
    { $set: { evaluationType: "TP" } }
  );
  const assignmentsResultMax = await db.collection("assignments").updateMany(
    { maxScore: { $exists: false } },
    { $set: { maxScore: 20 } }
  );
  console.log(
    `[assignments] evaluationType défini TP : ${assignmentsResultEval.modifiedCount} doc(s)` +
      ` (+ match ${assignmentsResultEval.matchedCount})`
  );
  console.log(
    `[assignments] maxScore défini 20 : ${assignmentsResultMax.modifiedCount} doc(s)` +
      ` (+ match ${assignmentsResultMax.matchedCount})`
  );

  const submissionsFp = await db.collection("submissions").updateMany(
    { $or: [{ filePath: { $exists: false } }, { filePath: null }] },
    { $set: { filePath: "" } }
  );
  console.log(`[submissions] filePath \"\" : ${submissionsFp.modifiedCount} doc(s) (match ${submissionsFp.matchedCount})`);

  const demoA = await db.collection("users").updateMany(
    {
      role: "student",
      cin: { $in: SEED_STUDENTS_A },
      $or: [{ studyClass: { $exists: false } }, { studyClass: null }, { studyClass: "" }],
    },
    { $set: { studyClass: DEMO_GROUP_A } }
  );
  const demoB = await db.collection("users").updateMany(
    {
      role: "student",
      cin: { $in: SEED_STUDENTS_B },
      $or: [{ studyClass: { $exists: false } }, { studyClass: null }, { studyClass: "" }],
    },
    { $set: { studyClass: DEMO_GROUP_B } }
  );
  console.log(`[users] élèves seed groupe A (${DEMO_GROUP_A}) : ${demoA.modifiedCount} doc(s)`);
  console.log(`[users] élèves seed groupe B (${DEMO_GROUP_B}) : ${demoB.modifiedCount} doc(s)`);

  const javaCourse = await db.collection("courses").updateMany(
    {
      title: "JAVA POO",
      $or: [{ studyClass: { $exists: false } }, { studyClass: null }, { studyClass: "" }],
    },
    { $set: { studyClass: DEMO_GROUP_A } }
  );
  console.log(`[courses] titre exact « JAVA POO » → studyClass ${DEMO_GROUP_A} : ${javaCourse.modifiedCount} doc(s)`);

  try {
    await db.collection("attendancerecords").createIndex({ teacher: 1, sessionDate: -1 });
    await db.collection("attendancerecords").createIndex({ teacher: 1, studyClass: 1, sessionDate: -1 });
    console.log("[attendancerecords] index teacher/sessionDate (+ teacher/studyClass) OK");
  } catch (err) {
    console.warn("[attendancerecords] index (infos) :", err.message);
  }

  console.log("\nMigration terminée.");
}

migrate()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Migration échouée:", err.message);
    process.exit(1);
  });
