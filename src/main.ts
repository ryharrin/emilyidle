import "./style.css";

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) {
  throw new Error("Missing #app root element");
}

app.innerHTML = `
  <main class="container">
    <h1>Watch Idle</h1>
    <p class="muted">Phase 1 scaffold: app is wired and building.</p>
  </main>
`;
