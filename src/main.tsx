import { JazzProvider } from "jazz-react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { JazzInspector } from "jazz-inspector";
import { apiKey } from "./apiKey.ts";
import { UpdatesAccount } from "./schema.ts";

export const APPLICATION_NAME = "Standup";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <JazzProvider
      sync={{
        peer: `wss://cloud.jazz.tools/?key=${apiKey}`,
      }}
      AccountSchema={UpdatesAccount}
    >
      <App />
      <JazzInspector />
    </JazzProvider>
  </StrictMode>
);
