import { LitElement, html, customElement, property, css } from "lit-element";

import { registerModule } from "sentry-module-federation";

registerModule({ release: "app-05@1.0.0", tags: { dsn: "__DSN_5__" } });

@customElement("action-button")
export class ActionButton extends LitElement {
  @property({ type: String }) foo: string;

  static get styles() {
    return css`
      button {
        display: inline-block;
        border-radius: 3px;
        padding: 0.5rem 0;
        margin: 0.5rem 1rem;
        width: 11rem;
        background: palevioletred;
        color: white;
        font-size: 1rem;
        font-family: sans-serif;
      }
    `;
  }

  alert() {
    alert("You have pressed a button.");
  }

  render() {
    return html` <button @click="${this.alert}">${this.foo}</button> `;
  }
}
