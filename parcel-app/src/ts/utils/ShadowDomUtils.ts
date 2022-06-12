/**
 * Grab an element which has a shadow dom. Unsure about how brittle this is.
 * Adapted from From: https://stackoverflow.com/a/60815639/12584714
 * const shadowSelectorsArr = ['vt-virustotal-app','file-view', '#report', 'vt-ui-file-card', 'vt-ui-generic-card'];
 * const foundDomElem = queryShadow(shadowSelectorsArr, '.file-id');
 * console.log(foundDomElem && foundDomElem.innerText);
 * @param param0 
 * @param itemSelector 
 * @returns 
 */
export function queryShadow([firstShadowSelector, ...restOfTheShadowSelectors]: string[], itemSelector: string) {
    const reduceFunction = (currShadow: Element | null, nextShadowSelector: string) =>  currShadow?.shadowRoot?.querySelector(nextShadowSelector) ?? null;    
    const firstShadow = document.querySelector(firstShadowSelector);
    const lastShadow = restOfTheShadowSelectors.reduce(reduceFunction, firstShadow);
    console.log(firstShadow, lastShadow);
    return lastShadow
}

export function queryShadowClass([firstShadowSelector, ...restOfTheShadowSelectors]: string[], itemSelector: string): Element | null {
    const reduceFunction = (currShadow: any, nextShadowSelector: any) => currShadow.shadowRoot.querySelector(nextShadowSelector);    
    const firstShadow = document.querySelector(firstShadowSelector);
    const lastShadow = restOfTheShadowSelectors.reduce(reduceFunction,firstShadow);
    return lastShadow && lastShadow.querySelector(itemSelector);
}