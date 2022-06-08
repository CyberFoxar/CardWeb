# Devlog about this project

# 2021-11-04
Reprise du dev, plus ou moins. 
Il faut retrouver mes petits pour lancer le site/toussa.

# 2021-11-06
Joujou avec le tokenizer de marked
Pas sur encore de comment je veux faire ça

Je voudrais:
Des ancres sur mon markdown (sur les header)
Des liens vers ces ancres dans mon menu

DONE
Reste a gérer proprement le niveau d'indentation des <li> dans le menu (ou trouver une autre implem plus accessibility-friendly) + ajouter le scrollspy dessus

# 2021-11-07
Todo creation

# 2021-11-08
Looking into how to bundle my files with parcel somewhat easily.

# 2021-11-12
+ Added gitea
+ Took a look at how parcel process things. It's annoying so I'm not bothering with it
+ Added a try with nodemon/concurently
+ bunch of busywork

# 2021-11-15
work on parser / data-build. I'm quite satisfied with the datamodel. The index-building could use some work, but this is enough for now. Also integrated the indexes with parcel webpage, it's basic for now, but I'll upgrade it later.

# 2021-11-27
Finished TOC and TOC rendering (including handling identically-named headings).
Began looking into indexed DB, though I might want to do some UI work.
Current next items: UI & DB

# 2022-02-12
Todo pour ajd:
Styles pour mon MD / site.

# 2022-03-22
Merge stuff, ajout des regles en plus
Changement dans le fetch du MD: l'indexe ne doit plus donner qu'un endroit ou récupérer le fichier.
Prochains dev: Intégrer une version sommaire d'indexedDB

# 2022-03-27
Pour build & deploy:
- checkout folder
- compile indexes & build app
- cp data-md/fr/* dist/main/fr/
- cp data-md/fr-index.json dist/main/indexes/fr-index.json

See [this file](../../.woodpecker/build.yml) for info.
Also fixed Parcel not bundling stuff: The targets were all wrong, if the parcel is a 'main', it won't bundle libraries.

# 2022-03-28
Currently investigating how I'll handle absolutly different pages for my stuff.
'cause I want at least a few "things":
- sidebar
- Searchbar
- header?
- page for search results
- page with a full listing of everything (Kinda like a sitemap) + quick "download / put in cache" ability
- homepage

And few of those things are very different beasts, and should be compartimentalized.
So I found [lit](https://lit.dev/) which is a very lightweight web component library. I might use it, but I need to understand how everything will mesh with everything else. branch time ?

# 2022-04-20 
(date a peu près)\
Bricolages avec Lit. Déplacé des trucs ailleurs.
Prochaine étape: mettre un routeur pour afficher selectivement des composant en fonction de où on est sur le site.
Had to do some magic to use markdown anchors, but I've managed to keep the custom in its own little component.

# 2022-05-16
did ~things~, but unsure what. Done lots of research on webpack/parcel/rollup I guess

# 2022-06-04
ENFIN implémenté webpack proprement:
- webserver correct
- tailwind + postCSS
- lit qui fonctionne
et d'autres trucs. Voir [ce document](./webpackinstall.md).

Au passage, j'ai corrigé le composant markdown, plus besoin de casser le shadow-dom pour faire les ancres, ça fonctionne semi-tout seul. Je dois quand même aller fouiller dans les shadow-dom pour lui donner le menu a remplir mais ça avance.
J'ai un local storage rudimentaire mais qui fonctionne et se rappelle de trucs. C'est pas mal.
J'ai aussi mis ma génération d'index dans son mini-projet a part.

# 2022-06-07
Fixed favicon somewhat
First impl of IndexedDB
Second impl -- now with promises, but not really full, tho.

# todo short term:
~~Add IndexEntries in indexedDB -- DONE~~ (need to do it better, but works good enough for now)
Add proper link between index entries and url/id (new component for fetching and stuff ? Might also have the caching mecanism and such) -- on it
Add better way to update TOC, maybe using events ?
  Like, when a document is "finished processing" you send an event to a lot of listeners with the new MarkdownTOC, would be better than replacing HTML inside divs, esp. for sidebar content.
Add index entries link into homepage (so I can finally remove them from sidebar)
~~Add fucking favicon (favicon made, but not implemented) DONE~~

Merge into develop, fix CI/CD

# Todo long term:
See [Reseach](useful-things-research.md).

- Definir un format de données ✅
- Preprocess pour l'API (packagé avec l'app parcel - mais preprocess) ✅
- PostProcess dans la webapp (indexedDB / LocalStorage)
- UI work (MD styles, app styles)
    - MD styles
      - Add permalink button next to headings
    - App styles
    - DarkTheme & ClearTheme
    - Accordeons (a la m.wikipedia ? Open by default)
- ScrollSpy (unsure)
- Search
  Will probably be an indexedDB search thingamajid of some sort. Not sure how I'll handle it yet.
- JS card game plugin thing
  - define
  - md extension
  - visuals
  - mock-up
- Prepare CI/CD
  - Build working dockerfile
  - Look at how jenkins works for that and plan for it and try.
