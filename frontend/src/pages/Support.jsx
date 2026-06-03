import React, { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import api from "../services/api";
import "../styles/dashboard.css";

function Support() {
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSent(false);
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const payload = {
      fullName: formData.get("nom"),
      email: formData.get("email"),
      message: formData.get("message"),
    };

    try {
      await api.post("/public/contact", payload);
      setSent(true);
      form.reset();
    } catch (err) {
      setError(err.message || "Une erreur est survenue lors de l'envoi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard page-pad">
      <div className="container dashboard__inner">
        <header className="dashboard__head">
          <p className="dashboard__eyebrow">Assistance</p>
          <h1 className="dashboard__title">Aide &amp; support</h1>
          <p className="dashboard__subtitle">
            Une question sur le portail ? Écrivez-nous ou contactez le secrétariat.
          </p>
        </header>

        <div className="support-grid">
          <section className="panel">
            <h2 className="panel__title panel__title--solo">Nous contacter</h2>
            <form className="form" onSubmit={handleSubmit}>
              <label className="form__label">
                Nom
                <input className="form__input" name="nom" type="text" required placeholder="Votre nom" />
              </label>
              <label className="form__label">
                Email
                <input className="form__input" name="email" type="email" required placeholder="vous@exemple.fr" />
              </label>
              <label className="form__label">
                Message
                <textarea
                  className="form__input form__textarea"
                  name="message"
                  rows={5}
                  required
                  placeholder="Décrivez votre demande…"
                />
              </label>
              <button type="submit" className="btn btn--primary form__submit" disabled={loading}>
                <Send size={18} />
                {loading ? "Envoi..." : "Envoyer"}
              </button>
              {sent && (
                <p className="form__success" role="status">
                  Merci — votre message a bien été envoyé à l'administration.
                </p>
              )}
              {error && (
                <p className="form__success" style={{ background: "rgba(239, 68, 68, 0.12)", color: "#991b1b" }}>
                  {error}
                </p>
              )}
            </form>
          </section>

          <aside className="panel panel--contact">
            <h2 className="panel__title panel__title--solo">Coordonnées</h2>
            <ul className="contact-block">
              <li>
                <Mail size={20} aria-hidden="true" />
                <div>
                  <span className="contact-block__label">Email</span>
                  <a href="mailto:issatkas@issatkas.rnu.tn">issatkas@issatkas.rnu.tn</a>
                </div>
              </li>
              <li>
                <Phone size={20} aria-hidden="true" />
                <div>
                  <span className="contact-block__label">Téléphone</span>
                  <span>T.: +216 77 418 258 / F.: +216 77 418 256</span>
                </div>
              </li>
              <li>
                <MapPin size={20} aria-hidden="true" />
                <div>
                  <span className="contact-block__label">Adresse</span>
                  <span>Campus Universitaire de Kasserine BP 471 - 1200 Kasserine</span>
                </div>
              </li>
            </ul>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default Support;
