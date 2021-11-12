# Cardweb
> A website reborn

Cardweb is a tentative website about rules of card games, usually played with a normal deck.

At its core it's a semi-local website+API for browsing and serving Markdown documents, all the while being offline-capable.

## Launching

To launch the website, in this folder:
`yarn parcel .\src\index.html`
This has hot-reloading (sortof) for everything.

To build a dist:
`yarn parcel build src/index.html`

To serve a very basic File API:
`npx http-server data-md/ --cors -c-1`
We deactivate CORS and cache because parcel is annoying
