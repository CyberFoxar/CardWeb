# Parcel and pre-loading scripts
## Ideas
What do I really want to do ?
I'd like for my  markdown files (later splitted by lang) to be processed and bundled with my app.
The idea would be something like that:

1. Write md files
2. digest files for easier search and lang support
3. bundle resulting files in parcel dist files

First: How do you bundle assets with parcel
Parcel website and github issues seems to say that in the resolving phase, parcel builds a graph of assests. So if I want anything bundled, I need to `require` it or its path -> https://en.parceljs.org/module_resolution.html#glob-file-paths

However, I'va also seen plugins that would move things in the dist directory automatically upon bundling -> https://github.com/elwin013/parcel-plugin-static-files-copy

Because putting stuff in the `dist` directory allows them to be served by the parcel server and will bundle them when building prod (I think). This seems a bit annoying to do automatically, but the alternatives are as annoying.

Previous idea are:
1. Separate node server serves pre-processed files/indexes and our app go fetch them as need
2. A script of some sort pre-process the files and bundle them with the parcel app as static thingies.
    1. ~~include the whole folder in parcel and have a transformer transform it into our index thingy.~~ -- Not worth the hassle to do. Would require a separate package and other bits and bobs and would probably make me run into other problems (it seems, for example, that there's no persistence or way to pass options to it).
    2. run a small script in // of parcel that do just what I want: checkin for md files, processing them and then allowing this to be served by parcel (or anyone else, really).This script weould go in my script key in pckg.json. It would look something like running `Concurrently` to have both task and have my process task being run with `nodemon`.

Current ( 2022-03-22 ) idea:
Do not bundle anything / bundle as little as possible.
Have all the .md available ~somewhere~ on the server as cleartext / not obsfucated
Have a digest/meta of all files made (index.json, currently)
Each time a file is requested, cache the contents (or don't if client does not wishes it).
Have an option to cache everything from a given lang.

## Why bundling files in the dist ?
Not having multiple app running is a plus for me, even if running with `file://` is not an option for a local distrib, running just the thing locally would be trivial if it's just a bunch of js/html/json. That would also (probably) allow me to serve it from virtually anything that lets me upload HTML/JS/CSS+Assets.

## bundler ?
I began with parcel. All was well until I had to dig in to handle complex stuff, like postCSS and tailwind. Then, parcel's code-splitting broke my static code, because their implementation as of 2022-06-04 is not up to spec and they do not respect `static` keyword, thus breaking a fundamental part of my app and requiering ugly workarounds.

So i've elected to change. But what to choose ?
Lit has a default implementation using rollup, but webpack is more widerly used/available.
I elected to go with webpack, it's got a load of resources and support, it's highly configurable and it work with what I want.

# Tailwind, lit, and the shadow of ~~man~~ dom
So.
Tailwind is great and all, but shadow dom is, well, a shadow. It doesn't cascade styles, or anything else like that.
Removing the shadow dom is a can of worms, as it might (and by might I mean break) our router, and I don't want to change my router lib or do it myself.
So, tailwind has a problem, it needs to read CSS using postCSS, however, it also needs to encapsulate its styles in CSS template literals, sometimes. The issue with that, is that I'm a fucking pig which has a ton of annoying code and legacy stuff. 
I could probably makje tailwind work with lit. Maybe. Those guys did:
https://dev.to/43081j/using-tailwind-at-build-time-with-web-components-1bhm
https://dev.to/43081j/using-tailwind-postcss-and-stylelint-with-lit-element-projects-2hb9

But their methods are annoying, look brittle, and depends on stuff I don't feel like doing. I'll try the first guy's method, for kicks.
It works. Somewhat. Styles do not seem to work outside of components, though.
But, it didn't work, really. And would require more work than I'm willing to put to make it work.
Sooo...
We're removing tailwind.

OR NOT LOL
We're trying again, this time we encapsulate our whole app inside a component, hopefully this will solve some things.
Let's try the first link, again.
We're going to use `cssnano` `postcss-loader` `cssnano-preset-lit` `postcss-syntax` `@stylelint/postcss-css-in-js`
We want to load the emitted JS from our typescript loader into postcss:
```js
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        use: [{
          loader: "esbuild-loader",
          options: {
            loader: "ts",
            target: "es2021",
          },
        },
        'postcss-loader'],
      },
    ]
  }
```
Then, we modify `postcss.config.js`
```js
module.exports = {
  syntax: require('@stylelint/postcss-css-in-js'),
  plugins: [
    require('tailwindcss/nesting'),
    require('tailwindcss'),
    require('autoprefixer'),
    require('cssnano')({
      preset: require('cssnano-preset-lite')
    })
  ]
}
```

And this should allow us to have a working css-in-js solution.
Then, we need to modify our tailwind styles to actually work inside our components.
This will require the use of a css template literal, and exporting the variable for our styles by encapsulating them inside:
```ts
// inside styles.ts
import { css } from "lit";

export const styles = css`...`
```

Though if we're doing that, we might as well use `postcss-lit` and save ourselves the hassle.

# Markdown parsing
`Marked` is a big chonky boy, if I want to shave some kb I could try to learn to use `unified` and `remark`, and even replace `yaml-front-matter` with `remark-frontmatter`.
All in all, I could probably /3 or /2 the vendor size.

# Routing
We have some problems with the routing we're using:
It sucks -- It's old. It's wonky. It does not lazy-load. It does not support (really) lit2. It is not actively developped or reviewed.
We should probably change it. 

Current options are:
Vaadin route: https://vaadin.com/router -- Somewhat actively developped and has actual peopleS behind it. 
Implement it ourselves -- That would require quite a lot of work that might not be needed.
  Resources for it: https://www.willtaylor.blog/client-side-routing-in-vanilla-js/
  https://info340.github.io/client-side-routing.html
  https://medium.com/swlh/lets-code-a-client-side-router-for-your-no-framework-spa-19da93105e10

# Let's take it offline (PWA?)
I want to make my website work even on a limited (or absent) internet connection.
How do I do this?
The idea for a Progressive Web App is to offer a native-like behavior. This means providing a way and hooks into the push and notifications.

An offline-capable website, at its core need mostly _something_ to cache stuff, and that something is a service worker levraging the cache API and other storage mechanisms.
A service worker mainly hooks into the `fetch` API to intercept calls and provide a caching stategy.

An issue I will encounter quickly when building my service worker is that webpack makes hashes out of my bundles and compile my JS and do a lot of stuff with it, thus making caching the bundle/assets/things harder.
To handle this I have multiple options:
1. use [workbox](https://developer.chrome.com/docs/workbox/), a solution from google to abstract and handle all the service workers, comes with a webpack plugin that does most of the heavy lifting.
   - I'm adding _another_ build dependency, and need to learn a specific thing
   - It will probably work long term and be updated for a good long while
   - It's probably quite robust and good at what it does
   - Also, is google.
2. use [offline-plugin](https://github.com/NekR/offline-plugin), a webpack plugin that only caches all the webpack-generated files, but does so automatically.
   - Not updated, not any news since 2019.
   - Black box, both a good thing (no need to learn anything) and a bad thing (reliant on webpack, don't know how it works exactly) 
   - Sorta middle of the road between workbox and serviceworker-webpack
3. use [serviceworker-webpack-plugin](https://github.com/oliviertassinari/serviceworker-webpack-plugin), a webpack plugins that sits as a very thin layer over webpack and loads a serviceworker while giving it the end generated files.
   - Not updated, and no news since 2019.
   - Very thin layer, no type definitions. Will make me learn how to _actually_ do a service worker.
   - Rely on webpack, but not that heavily.
   - **Also does not work with webpack 5, so there's that.**
4. build my own webpack plugin.
   - Has to learn to build a service worker.
   - Has to learn to make a webpack plugin

Flemme d'apprendre a faire mes plugins webpack.
Workbox it is ¯\_(ツ)_/¯

## current state
2022-06-18
Workbox: Annoying to use with webpack-dev-server, seems to want to do a lot of things I'm not really wanting to do right now (like precaching a fuckton of stuff ?). It also does _not_ work with webpack-dev-server, which is very annoying -- then again, I might just provide a no-op SW when in dev and work by staging my stuff when working on the SW. It's annoying, but that would work-ish.

serviceworker-webpack-plugin: On paper, does what I want. 
In practice, is not compatible with webpack 5, despite some forks pretending that it is because (it seems) babel is doing some fucky stuff and compiler/transpiler is adding some hooks which should not be. 
The OG code seem fine, but the various steps seem to break it.

I might look into making my own plugin which emulate its features.

2022-06-22
Made my own webpack plugin ! It simply export the asset list with their names and directory relative to origin. 
Note: Service worker `scope` cannot be greater than where it is itself.

2022-06-24
Service worker working with typescript and webpack and dev-server. I only had to do weird stuff.
I'm not really happy with the whole boilerplate that webpack add to my file but for now it'll do (changing that would probably require doing something similar to serviceworker-webpack-plugin and I'm not ready for that yet).
I should probably overhaul that, but for now it'll work.

2022-07-04
Working, log is back into devlog.

## Resources
PWAs:
https://pocketjavascript.com/blog/2015/11/23/introducing-pokedex-org
https://pwaresources.dev/ 
https://web.dev/learn/pwa/

Service Workers:
https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers
  Basic API, basic example, very, very useful
https://www.devextent.com/create-service-worker-typescript/
  Doing it in typescript, somehow.

# Re: DataMD
Je veux pouvoir avoir un support multilingue.
Il me faut un "point d'entrée" qui soit fixe, toujours présent, que je puisse mettre en dur/env dans le reste de l'app.
Ce point d'entrée doit avoir:
- les indexes
  - leurs chemins
  - quelques meta (langue, type?, etc.)

A partir de là, tant que l'arborescence de fichiers est respectée, ça doit pas trop mal se passer?
En gros je vais avoir:
```
├╴main-index.json
├╴/assets
│ └╴banner.jpg
├╴/fr
│ ├╴/assets
│ ├╴index.json
│ ├╴love-letter.md
│ └╴8-americain.md
├╴/en
│ ├╴/assets
│ ├╴index.json
│ ├╴love-letter.md
│ └╴growl.md
```
Règles:
- Les index désignent les ressources par rapport a leur position
- Le dossier ou se trouve un index est sa langue
- Les ressources designent par rapport a leur position ex:
    `love-letter.md`:
    ```md
      Here is banner: ![alt-text](../assets/banner.jpg)
    ```
    Et normalement ça marche.

A tester que je peux bien respecter ces règles au runtime.
