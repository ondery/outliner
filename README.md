# TS OUTLINER

A comprehensive TypeScript outline extension for VS Code that enhances your development workflow with **smart navigation** and **customizable emoji icons**.

## ✨ Key Features

## 🧠 Technical Features

### LSP-Based Analysis

- **Language Server Protocol (LSP)**: Uses VS Code's TypeScript Language Server for accurate symbol detection
- **AST-Based Parsing**: Leverages Abstract Syntax Tree data instead of regex parsing for better accuracy
- **Intelligent Fallback**: Automatically falls back to text-based parsing if LSP is unavailable
- **Real-time Updates**: Seamlessly integrates with TypeScript compiler's semantic analysis

### Enhanced Detection Capabilities

- **Precise Visibility**: Accurately detects public, private, and protected modifiers from TypeScript AST
- **Advanced Getter/Setter Recognition**: Identifies TypeScript getter/setter patterns both from LSP and source analysis
- **Static/Async/Abstract Detection**: Comprehensive modifier detection through language server integration
- **Constructor Special Handling**: Proper TypeScript constructor visibility analysis

## 🎯 Smart Navigation

- **Auto-sync**: Editor cursor movement automatically highlights the corresponding element in outline
- **One-way sync**: Click outline items to navigate to code without interfering with auto-sync
- **Center positioning**: Elements are positioned optimally in the outline view for better visibility

## 📊 Smart Sorting

**3 flexible sorting modes** accessible via the three-dot menu in outline header:

- **📍 Sort By: Position** (default) - Elements ordered by their appearance in source code
- **🔤 Sort By: Name** - Alphabetical sorting for easy navigation
- **📂 Sort By: Category** - Logical grouping: Classes → Interfaces → Constructors → Properties → Getters → Setters → Methods → Functions

**Quick access**: Click the `⋮` (three dots) button in the outline header to switch between sorting modes instantly.

## 🎨 Advanced Emoji System

**15 customizable emoji categories** for complete visual control:

**Type-based icons:**

- **🏗️** Constructors
- **📝** Properties
- **⚙️** Methods
- **🔧** Functions
- **📤** Getters
- **📥** Setters
- **📦** Classes
- **📋** Interfaces

**Visibility-based icons:**

- **🌐** Public methods/properties
- **🔒** Private methods/properties
- **🛡️** Protected methods/properties

**Modifier-based icons:**

- 📌 **Static** members
- 📖 **Readonly** properties
- 🎭 **Abstract** methods
- ⚡ **Async** methods

## 🎪 Multi-Emoji Display

Combines multiple emojis for complex elements:

- `🌐📌⚡ createFromServerAsync` - public + static + async method
- `📝🔒📖 uuid` - private + readonly property
- `⚙️🛡️⚡ setupAsync` - protected + async method
- `🏗️🌐 constructor` - public constructor
- `📤🔒 secretValue` - private getter

## 🎨 Complete Customization

### 🎨 Emoji Settings (UPDATED!)

**Simple object-based emoji configuration** like `editor.quickSuggestions`:

```json
{
  "tsOutlineEnhancer.emojiSettings": {
    "public": "🌐",
    "private": "🔒",
    "protected": "🛡️",
    "static": "📌",
    "readonly": "📖",
    "abstract": "🎭",
    "async": "⚡",
    "constructor": "🏗️",
    "property": "📝",
    "method": "⚙️",
    "function": "🔧",
    "getter": "📤",
    "setter": "📥",
    "class": "📦",
    "interface": "📋"
  }
}
```

**Quick setup:**

1. Open Command Palette (`Ctrl+Shift+P`)
2. Run `TS Outliner: Open Emoji Settings`
3. VS Code will open settings focused on `emojiSettings`

**Theme examples:**

```json
// Color-coded theme
"tsOutlineEnhancer.emojiSettings": {
  "public": "🟢", "private": "🔴", "protected": "�",
  "static": "🟦", "readonly": "🟪", "method": "⚙️"
}

// Minimalist theme
"tsOutlineEnhancer.emojiSettings": {
  "public": "●", "private": "○", "protected": "◐",
  "static": "■", "method": "▶", "class": "▦"
}
```

### Behavior Settings

| Setting                                      | Default            | Description                                                            |
| -------------------------------------------- | ------------------ | ---------------------------------------------------------------------- |
| `tsOutlineEnhancer.showIconsInLabel`         | `true`             | Show emoji icons in labels                                             |
| `tsOutlineEnhancer.showVisibilityInLabel`    | `false`            | Show visibility text in brackets                                       |
| `tsOutlineEnhancer.autoSelectCurrentElement` | `false`            | **Smart navigation**: Auto-highlight current element when cursor moves |
| `tsOutlineEnhancer.sortMode`                 | `"position"`       | **Default sorting**: Position, Name, or Category                       |
| `tsOutlineEnhancer.emojiSettings`            | `{ ... }` (object) | **Emoji configuration**: Object with emoji properties for all elements |

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

### Example Output

```text
📦 TestClass
├── 📝🌐 name                     (public property)
├── 📝🔒 _id                      (private property)
├── 📝🛡️ level                   (protected property)
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
  "tsOutlineEnhancer.emojis.property": "📝",
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

### v0.0.3

- 🚀 **Major Architecture Update**: Replaced regex-based parsing with Language Server Protocol (LSP) integration
- ✨ Added **AST-Based Analysis** for precise TypeScript symbol detection
- ✨ Added **Intelligent Fallback System** - automatically switches to text parsing when LSP unavailable
- ✨ Enhanced **Visibility Detection** - accurate public/private/protected analysis from TypeScript compiler
- ✨ Improved **Getter/Setter Recognition** with both LSP and source code analysis
- ✨ Better **Modifier Detection** (static, async, abstract, readonly) through language server
- ✨ Added **Smart Sorting System** - 3 sorting modes accessible via three-dot menu (Position, Name, Category)
- 🔧 Added **Persistent Sort Preference** - remembers your sorting choice in settings
- 🐛 Fixed **Constructor Visibility** parsing for TypeScript-specific patterns
- ⚡ **Performance Improvement**: Leverages VS Code's built-in TypeScript analysis
- 🎯 **Better Accuracy**: Eliminates false positives from regex-based detection

### v0.0.2

- ✨ Added smart navigation with auto-sync
- ✨ Added 15 fully customizable emoji categories
- ✨ Added center positioning for better UX
- ✨ Added one-way sync to prevent navigation loops
- 🐛 Fixed destructuring parameter parsing
- 🐛 Fixed multi-line method signature support

## 📄 License

MIT © 2025

```

```
