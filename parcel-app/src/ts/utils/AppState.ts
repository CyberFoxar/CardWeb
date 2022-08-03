import { MarkdownToc } from "../MarkdownToc";
import { MainIndex, MainIndexJson, RuleIndex } from "../models/Index.model";
import { SubscribableEvent } from "./SubscribableEvent";

export class State {

    public subEvent = new SubscribableEvent<String>();
    private currentStateVersion = 2;

    private _currentIndex: MainIndex | null = null;
    public get currentIndex(): MainIndex | null {
        return this._currentIndex;
    }
    public set currentIndex(value: MainIndex | null) {
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
            this.currentIndex.indexes.forEach(i => {
                i.index.subEvent.on((e) => {
                    this.subEvent.fire(e);
                });
            })
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
                console.warn("State version mismatch, cannot load state, removing saved state and retrying.");
                // TODO: migrate state properly
                window.localStorage.removeItem('cwAppState');
                return this.load();
            }

            if (state.currentIndex) {
                this.currentIndex = {indexes: state.currentIndex.indexes}
            } else {
                // TODO: Env Var/config file for this
                var index = await this.loadIndex("/rules/main-index.json");
                this.currentIndex = index;
                this.save();
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

    async loadIndex(url: string): Promise<MainIndex> {
        return new Promise(async (resolve, reject) => {
            var index: MainIndex | null;
            try {
                console.log("loading Index");
                const response = await fetch(url);
                const text = await response.text();
                index = RuleIndex.fromMainIndexJson(JSON.parse(text));
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