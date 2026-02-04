import { useState, useEffect } from "react";
import XIcon from "@mui/icons-material/X";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import GitHubIcon from "@mui/icons-material/GitHub";
import FacebookIcon from "@mui/icons-material/Facebook";
import { getDownloadCount, incrementDownloadCount } from "../downloadCounter";
import "./App.css";

function App() {
  const [downloads, setDownloads] = useState(0);
  const [pop, setPop] = useState(false);

  // Load initial count from Supabase
  useEffect(() => {
    const loadCount = async () => {
      const count = await getDownloadCount();
      setDownloads(count);
    };
    loadCount();
  }, []);

  // Fade-in observer & carousel
  useEffect(() => {
    const faders = document.querySelectorAll(".fade-in");

    const appearOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
          obs.unobserve(entry.target);
        }
      });
    }, appearOptions);

    faders.forEach((fader) => observer.observe(fader));

    const slides = document.querySelectorAll(".carousel-slide");
    const container = document.querySelector(".carousel-container");

    let currentIndex = 0;
    const total = slides.length;

    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % total;
      container.style.transform = `translateX(-${currentIndex * 100}%)`;
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Function to handle download clicks
  const handleDownloadClick = async () => {
    const newCount = await incrementDownloadCount();
    setDownloads(newCount);
    setPop(true);
    setTimeout(() => setPop(false), 250);
  };

  return (
    <>
      {/* HERO */}
      <header className="hero">
        <div className="container hero-content">
          <div className="hero-text">
            <h1>
              Organize Your Songs <br />
              <span>With Clarity & Ease</span>
            </h1>

            <p>
              ChoirFlo helps choir directors, musical band members, worship
              teams, and music leaders save songs, manage keys, and build
              worship line-ups without stress.
            </p>

            <div className="hero-actions">
              <a
                href="/ChoirFlo.apk"
                className="btn-primary large"
                download
                onClick={handleDownloadClick}
              >
                Download Android App
              </a>
              <span className="hero-note">Android • Free to use</span>
            </div>

            {/* Download count */}
            <div className={`download-count ${pop ? "pop" : ""}`}>
              {downloads.toLocaleString()}+ Downloads
            </div>
          </div>

          <div className="hero-visual">
            <div className="carousel-container">
              <img src="/cf4.jpg" className="carousel-slide" alt="ChoirFlo" />
              <img
                src="/cf (2).jpg"
                className="carousel-slide"
                alt="ChoirFlo"
              />
              <img src="/cf3.jpg" className="carousel-slide" alt="ChoirFlo" />
              <img
                src="/cf (1).jpg"
                className="carousel-slide"
                alt="ChoirFlo"
              />
              <img src="/cf5.jpg" className="carousel-slide" alt="ChoirFlo" />
            </div>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main>
        {/* VIDEO */}
        <section className="section video-section">
          <div className="container">
            <h2 style={{ color: "#1c6e3f" }}>See ChoirFlo in Action</h2>
            <p className="section-desc">
              A quick walkthrough showing how ChoirFlo simplifies real music
              team work.
            </p>

            <div className="video-wrapper fade-in">
              <iframe
                src="https://www.youtube.com/embed/0u96uTOB9IA"
                title="ChoirFlo App Demo"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="section features-section">
          <div className="container">
            <h2 style={{ color: "#1c6e3f" }}>Built for Real Music Team Work</h2>

            <div className="features-grid">
              <div className="feature fade-in">
                <h3>Song Library</h3>
                <p>Save and organize songs by category, key, and usage.</p>
              </div>

              <div className="feature fade-in">
                <h3>Line-Up Builder</h3>
                <p>
                  Arrange worship and praise sessions in seconds —
                  rehearsal-ready.
                </p>
              </div>

              <div className="feature fade-in">
                <h3>Key Awareness</h3>
                <p>
                  Keep vocal ranges comfortable and transitions smooth every
                  time.
                </p>
              </div>

              <div className="feature fade-in">
                <h3>Cloud Sync</h3>
                <p>Your data stays safe and accessible whenever you need it.</p>
              </div>
            </div>
          </div>
        </section>

        {/* DOWNLOAD SECTION */}
        <section className="section download-section">
          <div className="container download-box fade-in">
            <h2 style={{ color: "#1c6e3f" }}>Start Using ChoirFlo Today</h2>
            <p>
              Download the Android app and experience a better way to manage
              your team's music.
            </p>

            <a
              href="/ChoirFlo.apk"
              className="btn-primary large"
              download
              onClick={handleDownloadClick}
            >
              Download APK
            </a>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer id="footer" style={{ backgroundColor: "#1c6e3f" }}>
        <ul className="icons">
          <li>
            <a
              href="https://x.com/DavidOneVoice"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
            >
              <XIcon fontSize="medium" />
            </a>
          </li>
          <li>
            <a
              href="https://www.linkedin.com/in/badrudavid"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
            >
              <LinkedInIcon fontSize="medium" />
            </a>
          </li>
          <li>
            <a
              href="https://github.com/DavidOneVoice"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              <GitHubIcon fontSize="medium" />
            </a>
          </li>
          <li>
            <a
              href="https://www.facebook.com/profile.php?id=61559488910917"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <FacebookIcon fontSize="medium" />
            </a>
          </li>
        </ul>

        <ul className="menu">
          <li>&copy; 2026 Badru Olumide David</li>
          <li>
            Design:
            <a
              style={{ marginLeft: "5px" }}
              href="https://web.facebook.com/profile.php?id=61559488910917"
              target="_blank"
              rel="noopener noreferrer"
            >
              OVTech
            </a>
          </li>
          <li>
            <a
              href="https://badrudavidportfolio.netlify.app"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#fff" }}
            >
              View My Portfolio
            </a>
          </li>
        </ul>
      </footer>
    </>
  );
}

export default App;
