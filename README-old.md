# TypeScript Outline Enhancer

VS Code extension that enhances TypeScript outline view with **multiple icons** for visibility and modifiers.

## 🌟 Features

### Multi-Icon Display

- **🌐** Public methods/properties
- **🔒** Private methods/properties
- **🛡️** Protected methods/properties
- **📌** Static members
- **📖** Readonly properties
- **🎭** Abstract methods
- **⚡** Async methods

### Smart Icon Combinations

Shows multiple emoji icons for complex modifiers:

- `🌐📌⚡ createFromServerAsync` - public + static + async method
- `🔒📖 uuid` - private + readonly property
- `🛡️⚡ setupAsync` - protected + async method
- `🔒📌 formatId` - private + static method

### Customizable Icons

All VS Code icons are customizable through settings:

```json
{
  "tsOutlineEnhancer.icons.public": "symbol-method",
  "tsOutlineEnhancer.icons.private": "lock",
  "tsOutlineEnhancer.icons.protected": "shield",
  "tsOutlineEnhancer.icons.static": "pin",
  "tsOutlineEnhancer.icons.readonly": "book",
  "tsOutlineEnhancer.icons.abstract": "question",
  "tsOutlineEnhancer.icons.async": "sync"
}
```

### Advanced Features

- **Auto-refresh**: Updates outline when you edit TypeScript files
- **Detailed tooltips**: Hover to see all modifiers and line numbers
- **Smart parsing**: Ignores control flow keywords (if, for, while)
- **Class hierarchies**: Shows nested class members
- **Top-level functions**: Displays functions outside classes

## ⚙️ Settings

| Setting                                   | Default | Description                      |
| ----------------------------------------- | ------- | -------------------------------- |
| `tsOutlineEnhancer.showIconsInLabel`      | `true`  | Show emoji icons in labels       |
| `tsOutlineEnhancer.showVisibilityInLabel` | `false` | Show visibility text in brackets |
| `tsOutlineEnhancer.icons.*`               | Various | Customize VS Code icons          |
| `tsOutlineEnhancer.colors.*`              | Various | Customize icon colors            |

## 🚀 Usage

1. Open any TypeScript file
2. Go to **View** → **Open View** → **TS Outline Enhancer**
3. See your code structure with multiple icons!

## 📝 Example Output

```
TestClass
├── 🌐 name                    (public property)
├── 🔒 _id                     (private property)
├── 🔒📖 uuid                  (private readonly)
├── 🌐📌📖 count               (public static readonly)
├── 🌐 getName                 (public method)
├── 🔒 validate                (private method)
├── 🌐⚡ saveAsync             (public async method)
├── 🔒⚡ loadDataAsync         (private async method)
├── 🌐📌⚡ createFromServerAsync (public static async)
└── 🔒📌 formatId             (private static method)
```

## 🛠️ Development

```bash
npm install
npm run compile
# Press F5 to debug
```

## 📄 License

MIT
