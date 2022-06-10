import { LitElement, html, css } from 'lit';

import { customElement, property } from 'lit/decorators.js';
import { navigator } from 'lit-element-router';
import { styles } from '~src/styles/global-styles';


@customElement('router-link')
class RouterLinkComponent extends navigator(LitElement) {

    static styles = [styles, css``]

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