# TS Outliner Font Ayarları Rehberi

## ⚠️ Önemli Bilgi

VS Code'da TreeView fontları doğrudan değiştirilemez. Bu VS Code'un güvenlik kısıtlamalarından kaynaklanır.

## 🔧 Çözüm Yöntemleri

### Yöntem 1: Custom CSS Extension (Önerilen)

1. **Extension Yükle:**

   - Command Palette: `Ctrl+Shift+P`
   - `Extensions: Install Extensions`
   - Ara: "Custom CSS and JS Loader"
   - Yükle: "Custom CSS and JS Loader" by be5invis

2. **CSS Dosyası Oluştur:**

   ```css
   /* custom.css dosyası oluşturun */
   div[id="tsOutlineEnhancer"] .monaco-list-row {
     font-family: "Fira Code", monospace !important;
     font-size: 14px !important;
     line-height: 1.3 !important;
     font-weight: normal !important;
   }

   div[id="tsOutlineEnhancer"] .monaco-tl-contents {
     font-family: "Fira Code", monospace !important;
     font-size: 14px !important;
   }
   ```

3. **VS Code Settings:**

   ```json
   {
     "vscode_custom_css.imports": ["file:///C:/path/to/your/custom.css"]
   }
   ```

4. **Reload VS Code**

### Yöntem 2: TS Outliner Font Settings Komutu

1. `Ctrl+Shift+P` → "TS Outliner: Open Font Settings"
2. Font ayarlarınızı yapın
3. Komut otomatik CSS kodu üretecek
4. CSS kodunu kullanarak Yöntem 1'i uygulayın

### Yöntem 3: Workspace Ayarları (Genel Etki)

Tüm VS Code fontlarını değiştirmek için:

```json
{
  "editor.fontFamily": "'Fira Code', monospace",
  "editor.fontSize": 14,
  "workbench.tree.indent": 12,
  "workbench.tree.renderIndentGuides": "always"
}
```

## 🎨 Font Önerileri

### Programming Fonts:

- **Fira Code:** `'Fira Code', monospace` (Ligature desteği)
- **JetBrains Mono:** `'JetBrains Mono', monospace`
- **Cascadia Code:** `'Cascadia Code', monospace`
- **Source Code Pro:** `'Source Code Pro', monospace`
- **SF Mono (Mac):** `'SF Mono', Consolas, monospace`

### Ayar Örnekleri:

```json
// TS Outliner settings.json
{
  "tsOutlineEnhancer.fontSettings": {
    "fontFamily": "'Fira Code', monospace",
    "fontSize": 14,
    "fontWeight": "normal",
    "lineHeight": 1.3
  }
}
```

## 🚨 Sorun Giderme

**Problem:** Font değişmiyor
**Çözüm:**

1. Custom CSS extension yüklü mü kontrol edin
2. CSS dosya yolunu doğrulayın
3. VS Code'u yeniden başlatın
4. F12 Developer Tools ile CSS'in uygulandığını kontrol edin

**Problem:** Extension güvenlik uyarısı veriyor  
**Çözüm:** Bu normaldir, "Don't show again" seçin

## 💡 İpuçları

- Font ayarları her VS Code güncellemesinde sıfırlanabilir
- Backup CSS dosyanızı saklayın
- Font lisanslarını kontrol edin
- Geliştirici araçları ile CSS selector'leri test edin

## 🔗 Yardımcı Linkler

- [Custom CSS Extension](https://marketplace.visualstudio.com/items?itemName=be5invis.vscode-custom-css)
- [Fira Code Font](https://github.com/tonsky/FiraCode)
- [VS Code CSS Customization](https://code.visualstudio.com/docs/getstarted/themes#_customizing-a-color-theme)
