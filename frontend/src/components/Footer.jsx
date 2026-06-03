import React, { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Facebook, Linkedin, Youtube, Instagram, Send } from "lucide-react";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import "../styles/footer.css";

const ISSAT_KASSERINE = {
  name: "ISSAT Kasserine",
  lat: 35.171536981791675,
  lng: 8.779816278120064,
};

function Footer() {
  const mapId = useId();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;
    if (mapInstanceRef.current) return;

    L.Icon.Default.mergeOptions({
      iconRetinaUrl: markerIcon2x,
      iconUrl: markerIcon,
      shadowUrl: markerShadow,
    });

    const map = L.map(mapRef.current, {
      center: [ISSAT_KASSERINE.lat, ISSAT_KASSERINE.lng],
      zoom: 14,
      zoomControl: false,
      scrollWheelZoom: false,
      dragging: true,
      attributionControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    L.control
      .zoom({
        position: "bottomright",
      })
      .addTo(map);

    L.marker([ISSAT_KASSERINE.lat, ISSAT_KASSERINE.lng])
      .addTo(map)
      .bindPopup(ISSAT_KASSERINE.name);

    mapInstanceRef.current = map;

    const handleResize = () => map.invalidateSize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  const [email, setEmail] = useState("");
  
  const handleSubscribe = (e) => {
    e.preventDefault();
    if(email) {
      alert("Merci pour votre inscription à la newsletter !");
      setEmail("");
    }
  };

  return (
    <footer className="footer">
      <div className="footer__newsletter-bar">
        <div className="footer__newsletter-inner">
          <div className="footer__newsletter-text">
            <h4>Restez informé</h4>
            <p>Abonnez-vous à notre newsletter pour recevoir les dernières actualités de l'ISSAT.</p>
          </div>
          <form className="footer__newsletter-form" onSubmit={handleSubscribe}>
            <input 
              type="email" 
              placeholder="Votre adresse email..." 
              value={email}
              onChange={e => setEmail(e.target.value)}
              required 
            />
            <button type="submit"><Send size={18} /></button>
          </form>
        </div>
      </div>
      
      <div className="footer__inner">
        <div className="footer__brand-col">
          <div className="footer__logo-area">
            <span className="footer__logo-text">ISSAT Kasserine</span>
            <p className="footer__tagline">L'excellence au cœur du centre-ouest tunisien. Formons les ingénieurs et technologues de demain.</p>
          </div>
          <div className="footer__socials">
            <a href="#" aria-label="Facebook"><Facebook size={20} /></a>
            <a href="#" aria-label="LinkedIn"><Linkedin size={20} /></a>
            <a href="#" aria-label="YouTube"><Youtube size={20} /></a>
            <a href="#" aria-label="Instagram"><Instagram size={20} /></a>
          </div>
        </div>

        <div className="footer__links-col">
            <h3 className="footer__heading">Liens utiles</h3>
            <ul className="footer__links">
              <li>
                <Link to="/">Accueil</Link>
              </li>
              <li>
                <Link to="/etudiants">Espace étudiant</Link>
              </li>
              <li>
                <Link to="/enseignants">Espace enseignant</Link>
              </li>kk
              <li>
                <Link to="/emploi-du-temps">Emploi du temps</Link>
              </li>
              <li>
                <Link to="/resultats">Résultats</Link>
              </li>
              <li>
                <Link to="/telechargements">Téléchargements</Link>
              </li>
              <li>
                <Link to="/support">Aide &amp; support</Link>
              </li>
            </ul>
          </div>

          <div className="footer__col">
            <h3 className="footer__heading">Contact</h3>
            <ul className="footer__contact">
              <li>
                <Mail size={18} aria-hidden="true" />
                <a href="mailto:issatkas@issatkas.rnu.tn">issatkas@issatkas.rnu.tn</a>
              </li>
              <li>
                <Phone size={18} aria-hidden="true" />
                <a href="tel:+21677418258">T.: +216 77 418 258 / F.: +216 77 418 256</a>
              </li>
              <li>
                <MapPin size={18} aria-hidden="true" />
                <span>Campus Universitaire de Kasserine BP 471 - 1200 Kasserine</span>
              </li>
            </ul>
          </div>
          <div className="footer__map-col">
            <h3 className="footer__heading">Où nous trouver</h3>
            <div className="footer__map-wrap" role="region" aria-label="Carte de l'université">
              <div className="footer__map" id={mapId} ref={mapRef} />
            </div>
          </div>
        </div>
      <div className="footer__bar">
        <div className="footer__bar-inner">
          <p>© {new Date().getFullYear()} ISSAT KASSERINE — Tous droits réservés.</p>
          <p className="footer__credit">Créé par <span className="footer__highlight">Med Aziz Nachet</span></p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
