import { Rule, RuleIndex } from "../models/Index.model";
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
        return new Promise((resolve, reject) => {
            if (!window.localStorage.getItem('cwAppState')) {
                reject(new Error("No state to load, creating blank state"));
            }

            // Assume we have a state, and try copying to properties we want into our own state
            var state = JSON.parse(window.localStorage.getItem('cwAppState')!) as State;
            if (this.currentStateVersion !== state.currentStateVersion) {
                reject(new Error("State version mismatch, cannot load state"));
            }

            if (state.currentIndex) {
                this.currentIndex = new RuleIndex(state.currentIndex.lang, state.currentIndex.entries);
            }
            this.subToIndexChanges();
            this.subEvent.fire("state:loaded");
            resolve(this);
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
        window.cwAppState = new State();
        return window.cwAppState.load();
    }
    return window.cwAppState;
}

declare global {
    interface Window {
        cwAppState: State;
    }
}