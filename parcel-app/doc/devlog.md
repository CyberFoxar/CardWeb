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

# Todo:
See [Reseach](useful-things-research.md).

- Definir un format de données ✅
- Preprocess pour l'API (packagé avec l'app parcel - mais preprocess) ✅
- PostProcess dans la webapp (indexedDB / LocalStorage)
- UI work (MD styles, app styles)
    - MD styles
    - App styles
    - DarkTheme
    - Accordeons
- ScrollSpy (unsure)
- Search
  Will probably be an indexedDB search thingamajid of some sort. Not sure how I'll handle it yet.
- JS card game plugin thing
  - define
  - md extension
  - visuals
  - mock-up
