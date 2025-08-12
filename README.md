# TS OUTLINER

**Type-based icons:**

- 🏗️ \*\*ConstrucCombines multiple emojis for complex elements:

- `⚙️🌐📌⚡ createFromServerAsync` - method + public + static + async
- `📝🔒📖 uuid` - property + private + readonly
- `⚙️🛡️⚡ setupAsync` - method + protected + async
- `🏗️🌐 constructor` - constructor + public
- `📤🔒 getValue` - getter + private

### 🔧 Smart Features

- **Auto-refresh**: Updates when you edit TypeScript files
- **Intelligent parsing**: Ignores control flow keywords and destructuring parameters
- **Multi-line support**: Handles complex method signatures
- **Class hierarchies**: Shows nested class members with proper indentation
- **Context awareness**: Distinguishes between classes, interfaces, and top-level functions
- 📝 **Properties**
- ⚙️ **Methods**
- 🔧 **Functions**
- 📤 **Getters**
- 📥 **Setters**
- 📦 **Classes**
- � **Interfaces**

**Visibility-based icons:**

- 🌐 **Public** methods/properties
- 🔒 **Private** methods/properties
- 🛡️ **Protected** methods/propertiesypeScript outline extension** for VS Code that enhances your development workflow with **smart navigation** and **customizable emoji icons\*\*.

## ✨ Key Features

### 🎯 Smart Navigation

- **Auto-sync**: Editor cursor movement automatically highlights the corresponding element in outline
- **One-way sync**: Click outline items to navigate to code without interfering with auto-sync
- **Center positioning**: Elements are positioned optimally in the outline view for better visibility

### 🎨 Advanced Emoji System

**15 customizable emoji categories** for complete visual control:

**Type-based icons:**

- **�️** Constructors
- **📝** Properties
- **⚙️** Methods
- **🔧** Functions
- **📤** Getters
- **📥** Setters
- **📦** Classes
- **📋** Interfaces

**Visibility-based icons:**

- **�🌐** Public methods/properties
- **🔒** Private methods/properties
- **🛡️** Protected methods/properties

**Modifier-based icons:**

- 📌 **Static** members
- 📖 **Readonly** properties
- 🎭 **Abstract** methods
- ⚡ **Async** methods

### 🎪 Multi-Emoji Display

Combines multiple emojis for complex elements:

- `🌐📌⚡ createFromServerAsync` - public + static + async method
- `��🔒📖 uuid` - private + readonly property
- `⚙️🛡️⚡ setupAsync` - protected + async method
- `🏗️🌐 constructor` - public constructor
- `�� secretValue` - private getter

## 🎨 Complete Customization

### Emoji Settings

All 15 emoji types are fully customizable through VS Code settings:

```json
{
  // Type-based emojis
  "tsOutlineEnhancer.emojis.constructor": "�️",
  "tsOutlineEnhancer.emojis.property": "�",
  "tsOutlineEnhancer.emojis.method": "⚙️",
  "tsOutlineEnhancer.emojis.function": "�",
  "tsOutlineEnhancer.emojis.getter": "�",
  "tsOutlineEnhancer.emojis.setter": "📥",
  "tsOutlineEnhancer.emojis.class": "�",
  "tsOutlineEnhancer.emojis.interface": "📋",

  // Visibility emojis
  "tsOutlineEnhancer.emojis.public": "🌐",
  "tsOutlineEnhancer.emojis.private": "🔒",
  "tsOutlineEnhancer.emojis.protected": "🛡️",

  // Modifier emojis
  "tsOutlineEnhancer.emojis.static": "📌",
  "tsOutlineEnhancer.emojis.readonly": "📖",
  "tsOutlineEnhancer.emojis.abstract": "🎭",
  "tsOutlineEnhancer.emojis.async": "⚡"
}
```

### Behavior Settings

### Behavior Settings

| Setting                                      | Default | Description                                                            |
| -------------------------------------------- | ------- | ---------------------------------------------------------------------- |
| `tsOutlineEnhancer.showIconsInLabel`         | `true`  | Show emoji icons in labels                                             |
| `tsOutlineEnhancer.showVisibilityInLabel`    | `false` | Show visibility text in brackets                                       |
| `tsOutlineEnhancer.autoSelectCurrentElement` | `false` | **Smart navigation**: Auto-highlight current element when cursor moves |

## 🚀 Getting Started

### Installation

1. Open VS Code
2. Press `Ctrl+Shift+X` (or `Cmd+Shift+X` on Mac) to open Extensions
3. Search for "TS OUTLINER"
4. Click Install

### Usage

1. Open any TypeScript (.ts) or TypeScript React (.tsx) file
2. The "TS OUTLINER" panel will appear in the Explorer sidebar
3. Enable smart navigation: Add to your settings.json:
   ```json
   {
     "tsOutlineEnhancer.autoSelectCurrentElement": true
   }
   ```

## 📱 Interface

## � Interface

### Example Output

```text
📦 TestClass
├── 📝🌐 name                     (public property)
├── ��🔒 _id                      (private property)
├── ��️ level                   (protected property)
├── 📝🌐📌📖 count               (public static readonly)
├── 🏗️🌐 constructor             (public constructor)
├── ⚙️🌐 getName                  (public method)
├── ⚙️🔒 validate                 (private method)
├── ⚙️🌐⚡ saveAsync              (public async method)
├── ⚙️🌐📌⚡ createFromServerAsync (public static async)
└── 📤🔒 secretValue              (private getter)
```

### Smart Navigation in Action

- **Click in editor** → Outline element highlights automatically
- **Click outline item** → Navigate to code without triggering re-highlight
- **Perfect sync** → Always know where you are in complex files

## 🎨 Theme Examples

### Color-Coded Theme

```json
{
  "tsOutlineEnhancer.emojis.public": "🟢",
  "tsOutlineEnhancer.emojis.private": "🔴",
  "tsOutlineEnhancer.emojis.protected": "🟡",
  "tsOutlineEnhancer.emojis.static": "🟦",
  "tsOutlineEnhancer.emojis.readonly": "🟪"
}
```

### Professional Theme

```json
{
  "tsOutlineEnhancer.emojis.class": "🏢",
  "tsOutlineEnhancer.emojis.interface": "📄",
  "tsOutlineEnhancer.emojis.method": "🔧",
  "tsOutlineEnhancer.emojis.property": "�",
  "tsOutlineEnhancer.emojis.constructor": "🏗️"
}
```

### Minimalist Theme

```json
{
  "tsOutlineEnhancer.emojis.public": "●",
  "tsOutlineEnhancer.emojis.private": "○",
  "tsOutlineEnhancer.emojis.protected": "◐",
  "tsOutlineEnhancer.emojis.static": "■",
  "tsOutlineEnhancer.emojis.async": "→"
}
```

## 🛠️ Development

### Setup

```bash
git clone https://github.com/ondery/outliner.git
cd outliner
npm install
npm run compile
```

### Debug

1. Open in VS Code
2. Press `F5` to launch Extension Development Host
3. Open a TypeScript file to test

### Build

```bash
npm run compile    # Compile TypeScript
npm run watch      # Watch mode for development
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📋 Changelog

### v0.0.2

- ✨ Added smart navigation with auto-sync
- ✨ Added 15 fully customizable emoji categories
- ✨ Added center positioning for better UX
- ✨ Added one-way sync to prevent navigation loops
- 🐛 Fixed destructuring parameter parsing
- 🐛 Fixed multi-line method signature support

## 📄 License

MIT © 2025
