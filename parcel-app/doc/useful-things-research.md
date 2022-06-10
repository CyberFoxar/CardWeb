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