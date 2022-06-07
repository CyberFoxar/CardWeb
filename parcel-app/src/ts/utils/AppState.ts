import { RuleIndex } from "../models/Index.model";

export class State {
    public currentIndex: RuleIndex | undefined;

    constructor() { 
        if(window.localStorage.getItem('cwAppState')) {
            Object.assign(this, JSON.parse(window.localStorage.getItem('cwAppState')!));
        }
        else {
            this.currentIndex = undefined;
        }
    }

    /**
     * Save current state to localStorage
     */
    save() {
        window.localStorage.setItem('cwAppState', JSON.stringify(this));
    }
}

export function getState() {
    if(window.cwAppState === undefined) {
        window.cwAppState = new State();
    }
    return window.cwAppState;
}

declare global {
    interface Window {
        cwAppState: State;
    }
}