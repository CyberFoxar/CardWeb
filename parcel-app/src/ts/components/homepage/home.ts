import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { Rule } from '~src/ts/models/Index.model';
import { getState } from '~src/ts/utils/AppState';
import '~src/ts/components/routing-components/router-link';
import { styles } from '~src/styles/global-styles';

@customElement('homepage-view')
class HomepageElement extends LitElement {

  @state()
  private entries: Rule[] = [];

  static styles = [styles, css``];

  constructor() {
    super();
    this.subToIndexChanges();
  }

  async subToIndexChanges() {
    var state = await getState();

    this.entries = state.currentIndex?.entries ?? [];
    this.requestUpdate();

    state.subEvent.on(e => {
      getState().then(state => {
        this.entries = state.currentIndex?.entries ?? [];
        this.requestUpdate();
      });
    });


  }

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
    
      ${this.entries.map(entry => html`
      <div>
        <router-link href="/rule/${entry.id}">${entry.id}</router-link>
      </div>
      `)}
    </div>
    `;

  }

}

declare global {
  interface HTMLElementTagNameMap {
    "homepage-view": HomepageElement;
  }
}