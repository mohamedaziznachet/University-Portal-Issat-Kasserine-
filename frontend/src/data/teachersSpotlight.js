/**
 * Profils mis en avant (photos locales dans public/images/teachers/).
 * Déposez les fichiers : mouradHamdi.jpg, mouhibHayouni.jpg, ouniChayma.jpg
 */
const img = (file) => `${process.env.PUBLIC_URL}/images/teachers/${file}`;

export const teachersSpotlight = [
  {
    prenom: "Mourad",
    nom: "Hamdi",
    grade: "Enseignant contractuel",
    filiere: "Département technologie",
    email: "mourad.hamdi@issatk.rnu.tn",
    localPhoto: img("mouradHamdi.jpg"),
  },
  {
    prenom: "Mouhib",
    nom: "Hayouni",
    grade: "Enseignant contractuel",
    filiere: "Département technologie",
    email: "mouhib.hayouni@issatk.rnu.tn",
    localPhoto: img("mouhibHayouni.jpg"),
  },
  {
    prenom: "Chayma",
    nom: "Ouni",
    grade: "Enseignant contractuel",
    filiere: "Département technologie",
    email: "ouni.chayma@issatk.rnu.tn",
    localPhoto: img("ouniChayma.jpg"),
  },
];
