Notes on my webpack install: aka, why everything is here

# Basic

So, it's a basic webpack project, initially. At least until when I need to put up a dev server.
I've added an HTMLPlugin to keep the same index.html
I've add `typescript` and its (better?) loader `esbuild-loader`.
I've added proper support for relative typescript paths with the `resolve` part of the config

# Tailwind
To install it properly, we need to use postCSS as a loader for it.
So we follow tailwind's guide for it:
-> create tailwind config file
-> create postCSS config file

Then integrate postCSS in webpack, so we follow someone else's footstep and use `postcss-loader`

# Adding pre-install
We setup another nodejs project for compiling stuff
We change folder structure a bit to make it work better
We configure webpack-dev-server to have it serve the files

# Fixing polyfill
`yaml-front-matter` needs NodeJS.buffer as a polyfill, so we add the config in resolvers and `buffer`