import styled from "styled-components";

import { registerModule } from "sentry-module-federation";

registerModule("app-03", document.currentScript.src);

const Button = styled.button`
  display: inline-block;
  border-radius: 3px;
  padding: 0.5rem 0;
  margin: 0.5rem 1rem;
  width: 11rem;
  background: palevioletred;
  color: white;
  font-size: 1rem;
  font-family: sans-serif;
`;

export default Button;
