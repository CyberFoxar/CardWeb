import {LitElement, html} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import { Rule } from '~src/ts/models/Index.model';


@customElement('homepage-view')
class HomepageElement extends LitElement {

  @state()
  private entries: Rule[] = [];

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
        ${this.entries.map(entry => html`entry: ${entry.id}`)}
    </div>
    `;

  }

}

declare global {
    interface HTMLElementTagNameMap {
      "homepage-view": HomepageElement;
    }
}