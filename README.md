# Hardtime – Shopify theme

Thème Online Store 2.0, minimal et clair, pensé pour la revente de vêtements et de montres.

## Dev

```sh
shopify theme dev --store votre-boutique.myshopify.com
shopify theme check
```

## Metafields produit (namespace `custom`)

| Clé | Type | Usage |
| --- | --- | --- |
| `condition` | Texte | Badge d'état (Neuf, Très bon état…) |
| `reference` | Texte | Référence (montres) |
| `year` | Texte | Année |
| `case_size` | Texte | Taille du boîtier |
| `movement` | Texte | Mouvement |
| `box_papers` | Texte | Boîte et papiers |

## Structure

- `sections/` hero, tuiles catégories, collection mise en avant, réassurance, image + texte, newsletter, pages principales
- `snippets/` carte produit, prix, meta tags
- `assets/` `theme.css`, `theme.js` (sans dépendance)
