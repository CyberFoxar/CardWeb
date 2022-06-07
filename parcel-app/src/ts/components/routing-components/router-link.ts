import { LitElement, html } from 'lit';

import { customElement, property } from 'lit/decorators.js';
import { navigator } from 'lit-element-router';


@customElement('router-link')
class RouterLinkComponent extends navigator(LitElement) {

    @property()
    public href: string;

    constructor() {
        super();
        this.href = "";
    }

    render() {

        return html`
    <a href="${this.href}" @click="${this.linkClick}">
        <slot></slot>
    </a>
  `;

    }

    linkClick(event: any) {
        event.preventDefault();
        this.navigate(this.href);
    }

}

declare global {
    interface HTMLElementTagNameMap {
      "router-link": RouterLinkComponent;
    }
}