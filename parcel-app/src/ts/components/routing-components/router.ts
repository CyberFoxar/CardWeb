import { LitElement, html } from 'lit';
import { outlet, router, navigator, Routes } from 'lit-element-router';

import { customElement, property } from 'lit/decorators.js';
import { getState } from '../../utils/AppState';

// Import components for webpack
import '../homepage/home';
import '../markdown-vis/md-view';

@customElement('router-outlet')
export class RouterComponent extends router(navigator(outlet(LitElement))) {

    private activeRoute: string | undefined;
    private params: any | undefined;
    private query: object | undefined;
    private data: object | undefined;

    @property({ type: Object})
    public generatedMenu: HTMLElement | null = null;

    static routes: Routes =
        [
            {
                name: "test",
                pattern: "test",
            },
            {
                name: "rule",
                pattern: "rule/:id",
            },
            {
                name: "home",
                pattern: "*",
            },
        ];

    router(route?: string, params?: object, query?: object, data?: object) {
        this.activeRoute = route;
        this.params = params;
        this.query = query;
        this.data = data;
        console.log('route:', route, 'params:', params, 'query:', query, 'data:', data);
    }

    render() {
        console.log(getState());

        return html`
        <router-link href="/">hom</router-link>
        <router-link href="/test">test</router-link>
        <router-link href="/rule/ascenseur">rule</router-link>

        <h1 route="test"> Test !</h1>
        <homepage-view route="home"></homepage-view>
        <div route="rule">
            <!-- <md-view  markdownFileText="${this.params.id}" ></md-view> -->
            <!-- <md-view  markdownFileText="${getState().currentIndex?.entries[6].content as string}"></md-view> -->
            <md-view  markdownFileText=""></md-view>
        </div>
    `;

    }

    linkClick(event: any) {
        event.preventDefault();
        this.navigate(event.target.href);
    }

    constructor() {
        super();
        this.params = {};
        this.query = {};
        this.data = {};
    }

}

declare global {
    interface HTMLElementTagNameMap {
        "router-outlet": RouterComponent;
    }
}