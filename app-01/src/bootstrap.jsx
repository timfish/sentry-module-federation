import App from "./App";
import React from "react";
import ReactDOM from "react-dom";
import { getFramesWithModuleData } from "sentry-module-federation";
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://233a45e5efe34c47a3536797ce15dafa@o447951.ingest.sentry.io/5650507",
  beforeSend: (event) => {
    console.log(getFramesWithModuleData(event));
  },
});

ReactDOM.render(<App />, document.getElementById("root"));
