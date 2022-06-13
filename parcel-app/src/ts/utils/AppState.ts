import { MarkdownToc } from "../MarkdownToc";
import { RuleIndex } from "../models/Index.model";
import { SubscribableEvent } from "./SubscribableEvent";

export class State {

    public subEvent = new SubscribableEvent<String>();
    private currentStateVersion = 1;

    private _currentIndex: RuleIndex | null = null;
    public get currentIndex(): RuleIndex | null {
        return this._currentIndex;
    }
    public set currentIndex(value: RuleIndex | null) {
        this._currentIndex = value;
        this.subToIndexChanges();
        this.subEvent.fire("index:set");
    }

    private _currentTOC = new MarkdownToc();
    public get currentTOC() {
        return this._currentTOC;
    }
    public set currentTOC(value) {
        this._currentTOC = value;
        this.subEvent.fire("toc:set");
    }

    constructor() {
    }

    private subToIndexChanges() {
        if (this.currentIndex) {
            console.log("Subscribing to index changes");
            this.currentIndex.subEvent.on((e) => {
                this.subEvent.fire(e);
            });
        }
    }

    // I want to import and export my state in a local storage friendly way
    async load(): Promise<State> {
        try {
            console.log("Loading state");

            var state: State;
            if (!window.localStorage.getItem('cwAppState')) {
                console.warn("No state to load, creating blank state");
                // If load could be called, then this is a blank state already, so just continue.
                state = this;
            }
            else {
                // We have a state in storage, and try copying to properties we want into our own state
                state = JSON.parse(window.localStorage.getItem('cwAppState')!) as State;
            }


            if (this.currentStateVersion !== state.currentStateVersion) {
                console.warn("State version mismatch, cannot load state, resetting to blank state");
                // TODO: migrate state properly
                window.localStorage.removeItem('cwAppState');
            }

            if (state.currentIndex) {
                this.currentIndex = new RuleIndex(state.currentIndex.lang, state.currentIndex.entries);
            } else {
                var index = await this.loadIndex("/fr/fr-index.json");
                this.currentIndex = index;
            }

            this.subToIndexChanges();
            this.subEvent.fire("state:loaded");
            console.log("Loaded state", this);
            return Promise.resolve(this);
        }
        catch (error) {
            return Promise.reject(error);
        }
    }

    async loadIndex(url: string): Promise<RuleIndex> {
        return new Promise(async (resolve, reject) => {
            var index: RuleIndex | null;
            try {
                console.log("loading Index");
                const response = await fetch(url);
                const text = await response.text();
                index = RuleIndex.from(JSON.parse(text));
                if (!index) {
                    throw ("Index is null");
                }
            } catch (error) {
                reject(`Error while fetching index: ${error}`);
            }

            console.log("Loaded index", index!);
            resolve(index!);
        });
    }

    /**
     * Save current state to localStorage
     */
    save() {
        window.localStorage.setItem('cwAppState', JSON.stringify(this));
    }
}

export async function getState(): Promise<State> {
    if (!window.cwAppState) {
        const state = new State();
        window.cwAppState = state.load();
    }
    return window.cwAppState;
}

declare global {
    interface Window {
        cwAppState: Promise<State>;
    }
}