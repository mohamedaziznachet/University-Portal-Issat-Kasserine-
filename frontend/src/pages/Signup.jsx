import React, { useState } from "react";
import { UserPlus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/dashboard.css";
import { signupRequest } from "../services/api";

function Signup() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(false);
    setError("");
    setLoading(true);

    const formEl = e.currentTarget;
    const formData = new FormData(formEl);
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      setLoading(false);
      return;
    }

    formData.set("role", "student");

    try {
      const data = await signupRequest(formData);
      setSubmitted(true);
      formEl.reset();
      // We no longer log the user in directly since they are pending approval.
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard page-pad auth-page">
      <div className="container auth-wide">
        <div className="login-card">
          <div className="login-card__brand">
            <span className="login-card__logo">
              <UserPlus size={28} />
            </span>
            <div>
              <h1 className="login-card__title">Inscription</h1>
              <p className="login-card__subtitle">Créer un compte étudiant avec dossier complet.</p>
            </div>
          </div>

          <form className="form" onSubmit={handleSubmit}>
            <h2 className="auth-section-title">Informations personnelles</h2>
            <div className="auth-grid auth-grid--3">
              <label className="form__label">
                Nom
                <input className="form__input" name="lastName" required />
              </label>
              <label className="form__label">
                Prénom
                <input className="form__input" name="firstName" required />
              </label>
              <label className="form__label auth-grid-span-2">
                Adresse postale
                <input className="form__input" name="postalAddress" required />
              </label>
              <label className="form__label">
                Numéro de téléphone
                <input className="form__input" name="phone" required />
              </label>
              <label className="form__label">
                Adresse email
                <input className="form__input" type="email" name="email" required />
              </label>
              <label className="form__label">
                Photo d'étudiant
                <input className="form__input" type="file" name="studentPhoto" accept="image/*" required />
              </label>
              <label className="form__label">
                État civil
                <select className="form__input" name="maritalStatus" required>
                  <option value="">Sélectionner</option>
                  <option value="celibataire">Célibataire</option>
                  <option value="marie">Marié(e)</option>
                  <option value="autre">Autre</option>
                </select>
              </label>
              <label className="form__label">
                Numéro de pièce d'identité
                <input className="form__input" name="cin" required />
              </label>
              <label className="form__label">
                Date de naissance
                <input className="form__input" type="date" name="birthDate" required />
              </label>
              <label className="form__label">
                Lieu de naissance
                <input className="form__input" name="birthPlace" required />
              </label>
              <label className="form__label">
                Sexe
                <select className="form__input" name="gender" required>
                  <option value="">Sélectionner</option>
                  <option value="M">Masculin</option>
                  <option value="F">Féminin</option>
                </select>
              </label>
              <label className="form__label">
                Nationalité
                <input className="form__input" name="nationality" defaultValue="Tunisienne" required />
              </label>
            </div>

            <h2 className="auth-section-title">Informations familiales</h2>
            <div className="auth-grid auth-grid--3">
              <label className="form__label">
                Nom du père
                <input className="form__input" name="fatherLastName" required />
              </label>
              <label className="form__label">
                Prénom du père
                <input className="form__input" name="fatherFirstName" required />
              </label>
              <label className="form__label">
                Profession du père
                <input className="form__input" name="fatherProfession" required />
              </label>
              <label className="form__label">
                Nom de la mère
                <input className="form__input" name="motherLastName" required />
              </label>
              <label className="form__label">
                Prénom de la mère
                <input className="form__input" name="motherFirstName" required />
              </label>
              <label className="form__label">
                Profession de la mère
                <input className="form__input" name="motherProfession" required />
              </label>
            </div>

            <h2 className="auth-section-title">Parcours académique</h2>
            <div className="auth-grid auth-grid--3">
              <label className="form__label">
                Nature du Baccalauréat
                <select className="form__input" name="bacNature" required>
                  <option value="">Sélectionner</option>
                  <option value="principale">Session principale</option>
                  <option value="controle">Session contrôle</option>
                </select>
              </label>
              <label className="form__label">
                Note bac
                <input className="form__input" type="number" min="0" max="20" step="0.01" name="bacGrade" required />
              </label>
              <label className="form__label">
                Moyenne / Score GLSI (déjà calculé)
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input className="form__input" type="number" min="0" max="100" step="0.01" name="glsiScore" id="glsiScoreInput" />
                  <button 
                    type="button" 
                    className="btn btn--outline" 
                    style={{ padding: '0 1rem', height: '42px' }}
                    onClick={() => {
                      const bac = prompt("Entrez votre moyenne du Bac :");
                      const lic = prompt("Entrez votre moyenne de Licence (ou parcours précédent) :");
                      if (bac && lic) {
                        const score = (parseFloat(bac) * 0.3 + parseFloat(lic) * 0.7).toFixed(2);
                        document.getElementById("glsiScoreInput").value = score;
                        alert("Score calculé : " + score);
                      }
                    }}
                  >
                    Calculer
                  </button>
                </div>
              </label>
              <label className="form__label">
                Image carte d'identité (recto)
                <input className="form__input" type="file" name="cinFront" accept="image/*,.pdf" required />
              </label>
              <label className="form__label">
                Image carte d'identité (verso)
                <input className="form__input" type="file" name="cinBack" accept="image/*,.pdf" required />
              </label>
              <label className="form__label">
                Image diplôme bac
                <input className="form__input" type="file" name="bacDiploma" accept="image/*,.pdf" required />
              </label>
              <label className="form__label">
                Image relevé de note bac
                <input className="form__input" type="file" name="bacTranscript" accept="image/*,.pdf" required />
              </label>
              <label className="form__label">
                Mot de passe
                <input className="form__input" type="password" name="password" minLength={6} required />
              </label>
              <label className="form__label">
                Confirmer mot de passe
                <input className="form__input" type="password" name="confirmPassword" minLength={6} required />
              </label>
            </div>

            <div className="form__row">
              <button type="submit" className="btn btn--primary" disabled={loading}>
                {loading ? "Création..." : "Créer le compte"}
              </button>
            </div>

            {error ? (
              <p className="form__success" style={{ background: "rgba(239, 68, 68, 0.12)", color: "#991b1b" }}>
                {error}
              </p>
            ) : null}
            {submitted && !error && (
              <div className="form__success" role="status">
                <p style={{ margin: "0 0 0.5rem", fontWeight: "bold" }}>Inscription réussie !</p>
                <p style={{ margin: 0 }}>Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter, mais notez que votre dossier complet doit être validé par l'administration pour accéder à toutes les fonctionnalités.</p>
                <Link to="/connexion" className="btn btn--primary" style={{ marginTop: '1rem', display: 'inline-block', textDecoration: 'none' }}>Se connecter maintenant</Link>
              </div>
            )}

            <div className="form__row form__row--between">
              <Link to="/connexion" className="form__link">
                Déjà inscrit ? Se connecter
              </Link>
              <Link to="/" className="form__link">
                Continuer en visiteur
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signup;
