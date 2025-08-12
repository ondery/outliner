# TypeScript Outline Enhancer

VS Code extension that enhances TypeScript outline view with **customizable emoji icons** for visibility and modifiers.

## 🌟 Features

### Multi-Emoji Display

- **🌐** Public methods/properties
- **🔒** Private methods/properties
- **🛡️** Protected methods/properties
- **📌** Static members
- **📖** Readonly properties
- **🎭** Abstract methods
- **⚡** Async methods

### Smart Emoji Combinations

Shows multiple emojis for complex modifiers:

- `🌐📌⚡ createFromServerAsync` - public + static + async method
- `🔒📖 uuid` - private + readonly property
- `🛡️⚡ setupAsync` - protected + async method
- `🔒📌 formatId` - private + static method

### 🎨 Fully Customizable Emojis

All emojis are completely customizable through VS Code settings:

```json
{
  "tsOutlineEnhancer.emojis.public": "🌐", // or 🟢, ✅, 📢, 🔓
  "tsOutlineEnhancer.emojis.private": "🔒", // or 🔴, ❌, 🚫, 🖤
  "tsOutlineEnhancer.emojis.protected": "🛡️", // or 🟡, ⚠️, 🔰, 🧡
  "tsOutlineEnhancer.emojis.static": "📌", // or 🏗️, 🔧, 🎯, ⚙️
  "tsOutlineEnhancer.emojis.readonly": "📖", // or 👀, 🔍, 📋, 👁️
  "tsOutlineEnhancer.emojis.abstract": "🎭", // or 💭, 🔮, 👻, 🌟
  "tsOutlineEnhancer.emojis.async": "⚡" // or 🚀, 🔄, ⏳, 🌀
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
| `tsOutlineEnhancer.emojis.*`              | Various | Customize all emojis freely      |

## 🚀 Usage

1. Open any TypeScript file
2. Go to **View** → **Open View** → **TS Outline Enhancer**
3. See your code structure with customizable emojis!

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

## 🎨 Customization Examples

**Color Theme:**

```json
{
  "tsOutlineEnhancer.emojis.public": "🟢",
  "tsOutlineEnhancer.emojis.private": "🔴",
  "tsOutlineEnhancer.emojis.protected": "🟡"
}
```

**Symbols Theme:**

```json
{
  "tsOutlineEnhancer.emojis.public": "✅",
  "tsOutlineEnhancer.emojis.private": "❌",
  "tsOutlineEnhancer.emojis.protected": "⚠️"
}
```

**Fun Theme:**

```json
{
  "tsOutlineEnhancer.emojis.static": "🏗️",
  "tsOutlineEnhancer.emojis.async": "🚀",
  "tsOutlineEnhancer.emojis.readonly": "👀"
}
```

**Text-Based Theme:**

```json
{
  "tsOutlineEnhancer.emojis.public": "[PUB]",
  "tsOutlineEnhancer.emojis.private": "[PVT]",
  "tsOutlineEnhancer.emojis.protected": "[PRO]",
  "tsOutlineEnhancer.emojis.static": "[S]",
  "tsOutlineEnhancer.emojis.async": "[A]"
}
```

## 🛠️ Development

```bash
npm install
npm run compile
# Press F5 to debug
```

## 📄 License

MIT
