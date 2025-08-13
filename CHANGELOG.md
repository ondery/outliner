# Change Log

All notable changes to the "typescript-outline-enhancer" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [0.0.4] - 2025-01-13

### 🎯 Major Features Added

- **Icon Type Selection**: Choose between emoji, FontAwesome, or no icons
- **Typography Control**: Custom font family, size, and line height settings
- **FontAwesome Support**: Professional icon library with 100+ configurable icons
- **Enhanced Settings**: New command palette shortcuts for quick configuration

### ✨ New Settings

- `tsOutlineEnhancer.iconType` - Choose icon style ("emoji", "fontawesome", "none")
- `tsOutlineEnhancer.fontFamily` - Custom font family for outline view
- `tsOutlineEnhancer.fontSize` - Font size control (8-30px)
- `tsOutlineEnhancer.lineHeight` - Line height adjustment (0.8-3.0)
- `tsOutlineEnhancer.fontAwesomeSettings` - Complete FontAwesome icon customization

### 🎮 New Commands

- **TS Outliner: Open Icon Settings** - Quick access to icon type selection
- **TS Outliner: Open Font Settings** - Font and typography configuration
- **TS Outliner: Open Emoji Settings** - Existing emoji customization (enhanced)

### 📚 Documentation

- Enhanced README with new features and examples
- Updated FONT-SETUP-GUIDE with FontAwesome instructions
- New example configuration files

### 🔧 Technical Improvements

- WebView template system supports FontAwesome CDN loading
- Dynamic CSS variable system for font styling
- Enhanced IconManager with multi-format support
- Improved settings synchronization

## [Unreleased]

- Initial release
