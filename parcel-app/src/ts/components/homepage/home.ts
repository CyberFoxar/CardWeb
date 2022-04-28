import {LitElement, html} from 'lit';

import {customElement} from 'lit/decorators.js';


@customElement('homepage-view')
class HomepageElement extends LitElement {

  render() {

    return html`

    <h1>CardWeb: A Website Reborn</h1>
    <div>
        <p>
            Here will live the "main" "home" page of this website.
        </p>
        <p>
            Later, this will be filled with a list of ~things~.
        </p>
    </div>
    `;

  }

}

declare global {
    interface HTMLElementTagNameMap {
      "homepage-view": HomepageElement;
    }
}