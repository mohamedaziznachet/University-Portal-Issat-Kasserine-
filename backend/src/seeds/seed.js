const connectDb = require("../config/db");
const User = require("../models/User");
const Course = require("../models/Course");
const Assignment = require("../models/Assignment");
const Submission = require("../models/Submission");
const Notification = require("../models/Notification");
const TeacherMessage = require("../models/TeacherMessage");
const DirectMessage = require("../models/DirectMessage");
const Post = require("../models/Post");
const SitePage = require("../models/SitePage");
const GalleryItem = require("../models/GalleryItem");
const ContactMessage = require("../models/ContactMessage");
const Enrollment = require("../models/Enrollment");
const VisitorLog = require("../models/VisitorLog");

async function seed() {
  await connectDb();

  await Promise.all([
    DirectMessage.deleteMany({}),
    TeacherMessage.deleteMany({}),
    Notification.deleteMany({}),
    Submission.deleteMany({}),
    Assignment.deleteMany({}),
    Enrollment.deleteMany({}),
    Course.deleteMany({}),
    Post.deleteMany({}),
    SitePage.deleteMany({}),
    GalleryItem.deleteMany({}),
    ContactMessage.deleteMany({}),
    VisitorLog.deleteMany({}),
    User.deleteMany({}),
  ]);

  const admin = await User.create({
    role: "admin",
    cin: "00000001",
    password: "Admin@123",
    firstName: "Admin",
    lastName: "Portal",
    email: "admin@issatk.tn",
    phone: "+21670000001",
  });

  const teacher = await User.create({
    role: "teacher",
    cin: "11111111",
    password: "Teacher@123",
    firstName: "Mouhib",
    lastName: "Hayouni",
    email: "mouhib.hayouni@issatk.tn",
    phone: "+21670000002",
    filiere: "Sciences de l'Informatique - LN GLSI",
  });

  const teacher2 = await User.create({
    role: "teacher",
    cin: "11111112",
    password: "Teacher@123",
    firstName: "Chayma",
    lastName: "Ouni",
    email: "chayma.ouni@issatk.tn",
    phone: "+21670000012",
    filiere: "Génie mécanique",
  });

  const teacher3 = await User.create({
    role: "teacher",
    cin: "11111113",
    password: "Teacher@123",
    firstName: "Mourad",
    lastName: "Hamdi",
    email: "mourad.hamdi@issatk.tn",
    phone: "+21670000013",
    filiere: "Systèmes embarqués",
  });

  const student = await User.create({
    role: "student",
    cin: "22222222",
    password: "Student@123",
    firstName: "Aymen",
    lastName: "Ben Salah",
    email: "aymen.bensalah@etudiant.issatk.tn",
    phone: "+21670000003",
    maritalStatus: "celibataire",
    birthDate: "2004-09-15",
    birthPlace: "Kasserine",
    bacNature: "principale",
    bacGrade: 15.75,
    academicPath: "Bac sciences -> 1ère année licence informatique",
    parents: {
      father: { firstName: "Mohamed", lastName: "Ben Salah", profession: "Enseignant" },
      mother: { firstName: "Sonia", lastName: "Ben Salah", profession: "Infirmière" },
    },
    filiere: "Sciences de l'Informatique - LN GLSI",
    studyClass: "GLSI-L2-A",
    uploads: {
      studentPhoto: "uploads/studentPhoto/demo-student.jpg",
      cinFront: "uploads/cinFront/demo-cin-front.jpg",
      cinBack: "uploads/cinBack/demo-cin-back.jpg",
      bacDiploma: "uploads/bacDiploma/demo-bac-diploma.jpg",
      bacTranscript: "uploads/bacTranscript/demo-bac-transcript.jpg",
    },
  });

  const student2 = await User.create({
    role: "student",
    cin: "22222223",
    password: "Student@123",
    firstName: "Sarra",
    lastName: "Kefi",
    email: "sarra.kefi@etudiant.issatk.tn",
    phone: "+21670000023",
    maritalStatus: "celibataire",
    birthDate: "2003-12-22",
    birthPlace: "Sidi Bouzid",
    bacNature: "principale",
    bacGrade: 14.2,
    academicPath: "Bac maths -> licence informatique",
    parents: {
      father: { firstName: "Khaled", lastName: "Kefi", profession: "Technicien" },
      mother: { firstName: "Amel", lastName: "Kefi", profession: "Professeur" },
    },
    filiere: "Sciences de l'Informatique - LN GLSI",
    studyClass: "GLSI-L2-A",
  });

  const student3 = await User.create({
    role: "student",
    cin: "22222224",
    password: "Student@123",
    firstName: "Ahmed",
    lastName: "Dhaoui",
    email: "ahmed.dhaoui@etudiant.issatk.tn",
    phone: "+21670000024",
    maritalStatus: "celibataire",
    birthDate: "2004-01-10",
    birthPlace: "Kairouan",
    bacNature: "controle",
    bacGrade: 12.8,
    academicPath: "Bac technique -> licence GL",
    parents: {
      father: { firstName: "Hatem", lastName: "Dhaoui", profession: "Comptable" },
      mother: { firstName: "Meriem", lastName: "Dhaoui", profession: "Cadre bancaire" },
    },
    filiere: "Sciences de l'Informatique - LN GLSI",
    studyClass: "GLSI-L2-B",
  });

  const student4 = await User.create({
    role: "student",
    cin: "22222225",
    password: "Student@123",
    firstName: "Mohamed Aziz",
    lastName: "Nachet",
    email: "mohamedaziz.nachet@etudiant.issatk.tn",
    phone: "+21670000025",
    maritalStatus: "celibataire",
    birthDate: "2004-05-18",
    birthPlace: "Kasserine",
    bacNature: "principale",
    bacGrade: 13.5,
    academicPath: "Bac sciences -> 2ème année GLSI",
    parents: {
      father: { firstName: "Mohsen", lastName: "Nachet", profession: "Commerçant" },
      mother: { firstName: "Salma", lastName: "Nachet", profession: "Enseignante" },
    },
    filiere: "Sciences de l'Informatique - LN GLSI",
    studyClass: "GLSI-L2-B",
  });

  const course = await Course.create({
    title: "JAVA POO",
    description: "Cours de programmation orientée objet.",
    teacher: teacher._id,
    filiere: "LN GLSI",
    studyClass: "GLSI-L2-A",
    documents: [
      { name: "Cours Chapitre 1.pdf", filePath: "uploads/documents/java-poo-ch1.pdf", mimeType: "application/pdf" },
    ],
    videoLinks: ["https://www.youtube.com/watch?v=wpZ7o2J8Q4g"],
  });

  const course2 = await Course.create({
    title: "Systèmes d'exploitation",
    description: "Processus, threads, mémoire, ordonnancement.",
    teacher: teacher3._id,
    filiere: "LN GLSI",
    documents: [
      { name: "SE - Intro.pdf", filePath: "uploads/documents/se-intro.pdf", mimeType: "application/pdf" },
    ],
    videoLinks: ["https://www.youtube.com/watch?v=vBURTt97EkA"],
  });

  const course3 = await Course.create({
    title: "Productique",
    description: "Introduction aux procédés de fabrication.",
    teacher: teacher2._id,
    filiere: "LNGM",
  });

  const assignment = await Assignment.create({
    title: "TP 1 - Classes et objets",
    instructions: "Réaliser les classes demandées et soumettre le projet ZIP.",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    evaluationType: "TP",
    maxScore: 20,
    course: course._id,
    teacher: teacher._id,
  });

  const assignment2 = await Assignment.create({
    title: "Mini-projet Scheduling",
    instructions: "Comparer 2 algorithmes d'ordonnancement CPU.",
    dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    evaluationType: "DS",
    maxScore: 20,
    course: course2._id,
    teacher: teacher3._id,
  });

  await Enrollment.create({
    student: student._id,
    course: course._id,
    academicYear: "2025-2026",
    status: "active",
  });

  await Enrollment.insertMany([
    {
      student: student._id,
      course: course2._id,
      academicYear: "2025-2026",
      status: "active",
    },
    {
      student: student2._id,
      course: course._id,
      academicYear: "2025-2026",
      status: "active",
    },
    {
      student: student2._id,
      course: course2._id,
      academicYear: "2025-2026",
      status: "active",
    },
    {
      student: student3._id,
      course: course._id,
      academicYear: "2025-2026",
      status: "active",
    },
    {
      student: student3._id,
      course: course2._id,
      academicYear: "2025-2026",
      status: "active",
    },
    {
      student: student._id,
      course: course3._id,
      academicYear: "2025-2026",
      status: "active",
    },
    {
      student: student2._id,
      course: course3._id,
      academicYear: "2025-2026",
      status: "active",
    },
    {
      student: student3._id,
      course: course3._id,
      academicYear: "2025-2026",
      status: "active",
    },
    {
      student: student4._id,
      course: course._id,
      academicYear: "2025-2026",
      status: "active",
    },
    {
      student: student4._id,
      course: course2._id,
      academicYear: "2025-2026",
      status: "active",
    },
    {
      student: student4._id,
      course: course3._id,
      academicYear: "2025-2026",
      status: "active",
    },
  ]);

  await Submission.create({
    assignment: assignment._id,
    student: student._id,
    filePath: "uploads/submissionFile/demo-tp1.zip",
    notes: "Première version du travail demandé.",
    mark: 16.5,
    feedback: "Bon travail, améliorer la gestion des exceptions.",
    gradedAt: new Date(),
  });

  await Submission.insertMany([
    {
      assignment: assignment._id,
      student: student2._id,
      filePath: "uploads/submissionFile/sarra-tp1.zip",
      notes: "Version Sarra",
      mark: 14.5,
      feedback: "Bon travail global.",
      gradedAt: new Date(),
    },
    {
      assignment: assignment2._id,
      student: student._id,
      filePath: "uploads/submissionFile/aymen-scheduling.pdf",
      notes: "Comparaison FCFS/SJF",
    },
  ]);

  await TeacherMessage.insertMany([
    {
      teacher: teacher._id,
      student: student._id,
      subject: "Bienvenue",
      content: "Bienvenue dans le cours JAVA POO.",
    },
    {
      teacher: teacher3._id,
      student: student2._id,
      subject: "Rappel mini-projet",
      content: "N'oubliez pas la deadline du mini-projet.",
    },
  ]);

  await DirectMessage.insertMany([
    {
      sender: student._id,
      receiver: teacher._id,
      subject: "Question TP",
      content: "Est-ce que le pattern Singleton est obligatoire ?",
      readAt: new Date(),
    },
    {
      sender: teacher._id,
      receiver: student._id,
      subject: "RE: Question TP",
      content: "Oui, il est demandé dans la partie 2.",
    },
    {
      sender: student2._id,
      receiver: teacher3._id,
      subject: "Mini-projet",
      content: "Puis-je travailler en binôme ?",
    },
  ]);

  await Notification.insertMany([
    {
      user: student._id,
      title: "Nouvelle note publiée",
      message: "Votre note de TP 1 JAVA POO est disponible.",
      type: "success",
    },
    {
      user: student._id,
      title: "Nouveau devoir",
      message: "Mini-projet Scheduling ajouté.",
      type: "info",
    },
    {
      user: teacher._id,
      title: "Soumission reçue",
      message: "Aymen Ben Salah a soumis TP 1.",
      type: "info",
    },
    {
      user: admin._id,
      title: "Nouveau message contact",
      message: "Un visiteur a envoyé une demande.",
      type: "warning",
    },
  ]);

  await Post.insertMany([
    {
      type: "news",
      title: "Rentrée universitaire 2026",
      slug: "rentree-universitaire-2026",
      summary: "Calendrier de rentrée et informations administratives.",
      content: "La rentrée universitaire est fixée au 15 septembre 2026.",
      author: admin._id,
    },
    {
      type: "scientific_event",
      title: "Journée scientifique ISSAT",
      slug: "journee-scientifique-issat",
      summary: "Programme de la journée scientifique annuelle.",
      content: "Conférences, posters et présentations de projets.",
      author: teacher._id,
    },
    {
      type: "agenda",
      title: "Calendrier des examens S2",
      slug: "calendrier-examens-s2-2026",
      summary: "Dates et salles des examens semestriels.",
      content: "Les examens auront lieu du 10 au 20 juin 2026.",
      author: admin._id,
    },
    {
      type: "tender",
      title: "Appel d'offres matériel informatique",
      slug: "appel-offres-materiel-info",
      summary: "Consultation pour acquisition d'équipements.",
      content: "Dossier disponible au service financier.",
      meta: {
        tenderCode: "AO-2026-01",
        closingDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      },
      author: admin._id,
    },
  ]);

  await SitePage.insertMany([
    {
      slug: "creation-law",
      title: "Loi de création",
      content: "ISSAT Kasserine a été créé par décret n°1645 du 04 septembre 2012.",
      lang: "fr",
      author: admin._id,
    },
    {
      slug: "teachers-directory",
      title: "Annuaire des enseignants",
      content: "Liste des enseignants de l'ISSAT Kasserine par département.",
      lang: "fr",
      author: admin._id,
    },
    {
      slug: "scientific-council",
      title: "Conseil scientifique",
      content: "Composition du conseil scientifique de l'institut.",
      lang: "fr",
      author: admin._id,
    },
  ]);

  await GalleryItem.create({
    title: "Campus ISSAT",
    description: "Vue principale du campus universitaire.",
    imagePath: "uploads/gallery/campus.jpg",
    category: "campus",
    eventDate: new Date(),
    author: admin._id,
  });

  await GalleryItem.create({
    title: "Laboratoire embarqué",
    description: "Séance pratique en systèmes embarqués.",
    imagePath: "uploads/gallery/lab-embarque.jpg",
    category: "lab",
    eventDate: new Date(),
    author: teacher3._id,
  });

  await ContactMessage.create({
    fullName: "Visiteur Web",
    email: "contact@example.com",
    phone: "+21670000010",
    subject: "Demande d'information",
    message: "Bonjour, je souhaite des informations sur les licences.",
  });

  await ContactMessage.create({
    fullName: "Parent étudiant",
    email: "parent@example.com",
    phone: "+21670000011",
    subject: "Bourse et inscription",
    message: "Quels sont les délais de dépôt des dossiers de bourse ?",
    status: "in_progress",
  });

  await VisitorLog.insertMany([
    { ip: "127.0.0.1", userAgent: "seed-script", path: "/", method: "GET" },
    { ip: "127.0.0.1", userAgent: "seed-script", path: "/api/public/posts", method: "GET" },
  ]);

  console.log("Database seeded successfully.");
  console.log("Test users:");
  console.log("admin   -> CIN: 00000001 | password: Admin@123");
  console.log("teacher -> CIN: 11111111 | password: Teacher@123");
  console.log("teacher -> CIN: 11111112 | password: Teacher@123");
  console.log("teacher -> CIN: 11111113 | password: Teacher@123");
  console.log("student -> CIN: 22222222 | password: Student@123");
  console.log("student -> CIN: 22222223 | password: Student@123");
  console.log("student -> CIN: 22222224 | password: Student@123");
  console.log("student -> CIN: 22222225 | password: Student@123 (Mohamed Aziz Nachet, GLSI-L2-B)");
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Seed failed:", error.message);
    process.exit(1);
  });
