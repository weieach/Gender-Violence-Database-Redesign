# Glossary Data Structure

The glossary data is stored in `glossary.json` as a JSON array of sections.

## Structure

Each section has:
- `section`: The section title (e.g., "I. POPULATION")
- `items`: Array of glossary items

Each item can have:
- `title`: The term name
- `description`: The definition/explanation (optional)
- `subitems`: Array of nested items (optional, for hierarchical structure)

## Example

```json
{
  "section": "I. POPULATION",
  "items": [
    {
      "title": "Geography",
      "description": "Definition here..."
    },
    {
      "title": "Demographics",
      "subitems": [
        {
          "title": "Class",
          "description": "Definition...",
          "subitems": [
            {
              "title": "Low income",
              "description": "Definition..."
            }
          ]
        }
      ]
    }
  ]
}
```

## Adding New Entries

1. Open `data/glossary.json`
2. Add new sections or items following the structure above
3. Save the file - changes will appear automatically when you refresh the page

## Notes

- Items are automatically numbered based on their position in arrays
- Nesting can go as deep as needed (subitems within subitems)
- HTML in descriptions will be escaped for security
