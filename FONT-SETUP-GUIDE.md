# FONT SETUP GUIDE - TS OUTLINER

This guide explains how to configure fonts and icons in the TS Outliner extension.

## Icon Types

The extension supports three different icon types:

### 1. 🔤 Emoji Icons (Default)

- **Setting**: `"tsOutlineEnhancer.iconType": "emoji"`
- **Advantages**: Works everywhere, no installation required
- **Customization**: Via `tsOutlineEnhancer.emojiSettings`

### 2. ⭐ FontAwesome Icons

- **Setting**: `"tsOutlineEnhancer.iconType": "fontawesome"`
- **Advantages**: Professional look, thousands of options
- **Requirements**: FontAwesome font installation (CDN loads automatically)
- **Customization**: Via `tsOutlineEnhancer.fontAwesomeSettings`

### 3. ❌ No Icons

- **Setting**: `"tsOutlineEnhancer.iconType": "none"`
- **Advantages**: Clean look, faster performance

## Font Family Settings

### Recommended Font Families

1. **Fira Code** (Ligature support)

   ```json
   "tsOutlineEnhancer.fontFamily": "Fira Code, monospace"
   ```

2. **JetBrains Mono** (Modern, readable)

   ```json
   "tsOutlineEnhancer.fontFamily": "JetBrains Mono, monospace"
   ```

3. **Cascadia Code** (Microsoft’s developer font)

   ```json
   "tsOutlineEnhancer.fontFamily": "Cascadia Code, monospace"
   ```

4. **Source Code Pro** (Adobe’s open-source font)

   ```json
   "tsOutlineEnhancer.fontFamily": "Source Code Pro, monospace"
   ```

5. **Hack** (Specifically designed for coding)

   ```json
   "tsOutlineEnhancer.fontFamily": "Hack, monospace"
   ```

### Font Size and Line Height

```json
{
  "tsOutlineEnhancer.fontSize": 14, // between 8-30 px
  "tsOutlineEnhancer.lineHeight": 1.3 // between 0.8-3.0
}
```

## Quick Setup

### Add to Settings.json:

```json
{
  "tsOutlineEnhancer.iconType": "fontawesome",
  "tsOutlineEnhancer.fontFamily": "Fira Code, JetBrains Mono, Consolas, monospace",
  "tsOutlineEnhancer.fontSize": 14,
  "tsOutlineEnhancer.lineHeight": 1.3,
  "tsOutlineEnhancer.showIconsInLabel": true
}
```

## Command Palette Commands

- `TS Outliner: Open Icon Settings` – Icon type settings
- `TS Outliner: Open Font Settings` – Font settings
- `TS Outliner: Open Emoji Settings` – Emoji customization

## FontAwesome Installation

### Automatic (CDN) – Default

The extension automatically loads FontAwesome from the CDN. Internet connection required.

### Manual Installation

1. Download fonts from [FontAwesome](https://fontawesome.com/)
2. Install them to your system fonts
3. Edit the extension code to use local fonts instead of CDN in the WebView

## Customization Examples

### Colored Emoji Set:

```json
{
  "tsOutlineEnhancer.emojiSettings": {
    "public": "🟢",
    "private": "🔴",
    "protected": "🟡",
    "method": "⚙️",
    "class": "📦"
  }
}
```

### Alternative FontAwesome Set:

```json
{
  "tsOutlineEnhancer.fontAwesomeSettings": {
    "public": "fas fa-unlock",
    "private": "fas fa-user-secret",
    "protected": "fas fa-exclamation-triangle",
    "method": "fas fa-cogs",
    "class": "fas fa-building"
  }
}
```

## Troubleshooting

**FontAwesome icons not showing:**

- Check your internet connection
- Clear browser cache
- Restart VS Code

**Font not changing:**

- Restart VS Code
- Make sure settings are saved correctly
- Disable and re-enable the extension

**Performance issues:**

- Set `iconType` to `"none"`
- Lower the `fontSize` value
- Prefer emojis instead of FontAwesome
