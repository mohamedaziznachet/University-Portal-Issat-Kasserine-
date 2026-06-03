import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import "../styles/dashboard.css";
import api, { loginRequest } from "../services/api";

function Login() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState({ etudiant: true, enseignant: false, admin: false });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitted(false);
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const role = roles.admin ? "admin" : roles.etudiant ? "student" : "teacher";

    try {
      const data = await loginRequest({
        cin: formData.get("cin"),
        password: formData.get("password"),
        role,
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("storage"));
      setSubmitted(true);
      navigate("/espace");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = (key) => {
    setRoles({
      etudiant: key === "etudiant",
      enseignant: key === "enseignant",
      admin: key === "admin",
    });
  };

  const [showResetForm, setShowResetForm] = useState(false);
  const [resetStatus, setResetStatus] = useState("");

  const handleResetRequest = async (e) => {
    e.preventDefault();
    setResetStatus("");
    const formData = new FormData(e.currentTarget);
    try {
      const res = await api.post("/auth/request-password-reset", {
        cin: formData.get("cin"),
        email: formData.get("email"),
      });
      setResetStatus(res.data.message);
    } catch (err) {
      setResetStatus(err.response?.data?.message || "Une erreur est survenue.");
    }
  };

  if (showResetForm) {
    return (
      <div className="dashboard page-pad page-pad--center auth-page">
        <div className="container container--narrow auth-narrow">
          <div className="login-card">
            <div className="login-card__brand">
              <h1 className="login-card__title">Réinitialiser</h1>
              <p className="login-card__subtitle">Demandez une réinitialisation de votre mot de passe à l'administration.</p>
            </div>
            <form className="form form--tight" onSubmit={handleResetRequest}>
              <label className="form__label">
                Votre CIN
                <input className="form__input" type="text" name="cin" required />
              </label>
              <label className="form__label">
                Votre Email
                <input className="form__input" type="email" name="email" required />
              </label>
              <button type="submit" className="btn btn--primary form__full">Envoyer la demande</button>
              <button type="button" onClick={() => setShowResetForm(false)} className="btn btn--link form__full" style={{ marginTop: '10px' }}>Retour à la connexion</button>
              {resetStatus && <p className="form__success" style={{ marginTop: '1rem', background: 'rgba(59, 130, 246, 0.1)', color: '#1e40af' }}>{resetStatus}</p>}
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard page-pad page-pad--center auth-page">
      <div className="container container--narrow auth-narrow">
        <div className="login-card">
          <div className="login-card__brand">
            <span className="login-card__logo">
              <LogIn size={28} />
            </span>
            <div>
              <h1 className="login-card__title">Connexion</h1>
              <p className="login-card__subtitle">
                Accédez à votre espace sécurisé étudiant, enseignant ou administrateur.
              </p>
            </div>
          </div>

          <form className="form form--tight" onSubmit={handleSubmit}>
            <label className="form__label">
              Numéro CIN
              <input className="form__input" type="text" name="cin" required maxLength={12} />
            </label>
            <label className="form__label">
              Mot de passe
              <input
                className="form__input"
                type="password"
                name="password"
                required
                autoComplete="current-password"
              />
            </label>

            <div className="role-picker" role="group" aria-label="Profil utilisateur">
              <label className="role-picker__item">
                <input
                  type="checkbox"
                  checked={roles.etudiant}
                  onChange={() => toggleRole("etudiant")}
                />
                Étudiant
              </label>
              <label className="role-picker__item">
                <input
                  type="checkbox"
                  checked={roles.enseignant}
                  onChange={() => toggleRole("enseignant")}
                />
                Enseignant
              </label>
              <label className="role-picker__item">
                <input type="checkbox" checked={roles.admin} onChange={() => toggleRole("admin")} />
                Administrateur
              </label>
            </div>

            <div className="form__row">
              <button type="submit" className="btn btn--primary form__full" disabled={loading}>
                {loading ? "Connexion..." : "Se connecter"}
              </button>
            </div>
            <div className="form__row form__row--between">
              <button type="button" onClick={() => setShowResetForm(true)} className="form__link" style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit', color: 'var(--color-primary)' }}>
                Mot de passe oublié
              </button>
              <Link to="/inscription" className="form__link">
                Créer un compte
              </Link>
            </div>
            {error ? (
              <p className="form__success" style={{ background: "rgba(239, 68, 68, 0.12)", color: "#991b1b" }}>
                {error}
              </p>
            ) : null}
            {submitted && !error && (
              <p className="form__success" role="status">
                Connexion réussie.
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
