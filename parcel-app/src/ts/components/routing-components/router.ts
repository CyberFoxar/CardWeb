import { LitElement, html } from 'lit';
import { outlet, router, navigator, Routes } from 'lit-element-router';

import { customElement } from 'lit/decorators.js';

@customElement('router-outlet')
class RouterComponent extends router(navigator(outlet(LitElement))) {

    private activeRoute: string | undefined;

    static routes: Routes =
        [
            {
                name: "home",
                pattern: "",
            },
            {
                name: "test",
                pattern: "test",
            }
        ];

    router(route?: string, params?: object, query?: object, data?: object) {
        this.activeRoute = route;
        console.log('route:', route, 'params:', params, 'query:', query, 'data:', data);	
    }

    render() {
        return html`
        <router-link href="/">hom</router-link>
        <router-link href="/test">test</router-link>

        <h1 route="home">Home !</h1>
        <h1 route="test"> Test !</h1>
    `;

    }

    linkClick(event: any) {
        event.preventDefault();
        this.navigate(event.target.href);
    }

}

declare global {
    interface HTMLElementTagNameMap {
      "router-outlet": RouterComponent;
    }
}