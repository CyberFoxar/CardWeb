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

# 2022-06-08
DID THINGS CANT DO THAT NOW -- and now I don't remember.
Judging fomr commits:
Fixed some code
Added proper fetching component for getting rules
And began first shot at making events

# 2022-06-09
Changed how I handle state to make it async somewhat.
I fixed it somehow by not choosing yet.

# 2022-06-10
HERE WE REMOVE TAILWIND DAMMIT.
And we didn't, kek.
We made it work with our components. WE MADE IT WORK.
And we also added an entry point component, because we need one.
And then fixed all the styles to get back to where we were.

# 2022-06-13
Done... a bunch of things.
Fixed tailwind
Fixed some bugs
Fixed w/Xo CI/CD and put a build + deploy process


# todo short term:

Create caching system
Save rules in indexedDB
Handle rule version change in db

Add permalink next to headings

Nice to have: A way to clear storage
Nice to have: Better events
Nice to have: Refactor fetch/view to use lit directive like `until`.

~~Add IndexEntries in indexedDB -- DONE~~ (need to do it better, but works good enough for now)
~~Add proper link between index entries and url/id (new component for fetching and stuff ? Might also have the caching mecanism and such) -- on it~~ -- done, sorta
~~Add index entries link into homepage (so I can finally remove them from sidebar)~~ done, but ugly
~~Add fucking favicon (favicon made, but not implemented) DONE~~

Add better way to update TOC, maybe using events ? -- DONE ! Sorta. Enough.
  ~~Like, when a document is "finished processing" you send an event to a lot of listeners with the new MarkdownTOC, would be better than replacing HTML inside divs, esp. for sidebar content.~~

~~Make permalink work (like, /rule/belote from cold should work).~~ DONE !

~~Merge into master, fix CI/CD~~ DONE \o/

~~BUG: Coming from an empty localstorage/indexedDB does not work.~~ fixed
~~BUG: On first load of homepage component, rules are not there, only by switching on/off they appear.~~ done, a bit ugly but works.
WEIRD: Sidebar do not have a fixed enough width, makes it jump around on load when long titles are there
~~BUG: On first load of a rule page, content is not properly scrolled to according to anchor.~~ ugly fix, but it works.

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
    - ToC at the top of articles too (_a la_ wikipedia mobile, open by default on mobile, closed on bigger screens)
- ScrollSpy (unsure -- would be dope)
- Search
  Will probably be an indexedDB search thingamajid of some sort. Not sure how I'll handle it yet.
- JS card game plugin thing
  - define
  - md extension
  - visuals
  - mock-up
- Prepare CI/CD ✅
  - ~~Build working dockerfile~~ -- no need
