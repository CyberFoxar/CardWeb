import {LitElement, html} from 'lit';

import {customElement} from 'lit/decorators.js';


@customElement('my-element')
class MyElement extends LitElement {

  render() {

    return html`

      <div>Hello from MyElement!</div>

    `;

  }

}