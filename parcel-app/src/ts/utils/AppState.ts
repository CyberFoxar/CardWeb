import { Index } from "../models/Index.model";

export class State {
    public currentIndex: Index | undefined;

    constructor() { 
        console.log("constructor");
        this.currentIndex = undefined;
    }
}

export function getState() {
    console.log("getState");
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