# FONT SETUP GUIDE - TS OUTLINER

Bu rehber, TS Outliner extension'unda font ve ikon ayarlarını nasıl yapacağını açıklar.

## İkon Türleri

Extension üç farklı ikon türünü destekler:

### 1. 🔤 Emoji İkonlar (Varsayılan)

- **Ayar**: `"tsOutlineEnhancer.iconType": "emoji"`
- **Avantajlar**: Her yerde çalışır, kurulum gerektirmez
- **Özelleştirme**: `tsOutlineEnhancer.emojiSettings` ile

### 2. ⭐ FontAwesome İkonlar

- **Ayar**: `"tsOutlineEnhancer.iconType": "fontawesome"`
- **Avantajlar**: Profesyonel görünüm, binlerce seçenek
- **Gereksinimler**: FontAwesome font kurulumu (CDN otomatik yüklenir)
- **Özelleştirme**: `tsOutlineEnhancer.fontAwesomeSettings` ile

### 3. ❌ İkon Yok

- **Ayar**: `"tsOutlineEnhancer.iconType": "none"`
- **Avantajlar**: Sade görünüm, hız

## Font Family Ayarları

### Önerilen Font Aileleri

1. **Fira Code** (Ligature desteği)

   ```json
   "tsOutlineEnhancer.fontFamily": "Fira Code, monospace"
   ```

2. **JetBrains Mono** (Modern, okunabilir)

   ```json
   "tsOutlineEnhancer.fontFamily": "JetBrains Mono, monospace"
   ```

3. **Cascadia Code** (Microsoft'un geliştirici fontu)

   ```json
   "tsOutlineEnhancer.fontFamily": "Cascadia Code, monospace"
   ```

4. **Source Code Pro** (Adobe'nin açık kaynak fontu)

   ```json
   "tsOutlineEnhancer.fontFamily": "Source Code Pro, monospace"
   ```

5. **Hack** (Özellikle kodlama için tasarlandı)
   ```json
   "tsOutlineEnhancer.fontFamily": "Hack, monospace"
   ```

### Font Boyutu ve Satır Yüksekliği

```json
{
  "tsOutlineEnhancer.fontSize": 14, // 8-30 px arası
  "tsOutlineEnhancer.lineHeight": 1.3 // 0.8-3.0 arası
}
```

## Hızlı Kurulum

### Settings.json'a Ekle:

```json
{
  "tsOutlineEnhancer.iconType": "fontawesome",
  "tsOutlineEnhancer.fontFamily": "Fira Code, JetBrains Mono, Consolas, monospace",
  "tsOutlineEnhancer.fontSize": 14,
  "tsOutlineEnhancer.lineHeight": 1.3,
  "tsOutlineEnhancer.showIconsInLabel": true
}
```

## Komut Paleti Komutları

- `TS Outliner: Open Icon Settings` - İkon türü ayarları
- `TS Outliner: Open Font Settings` - Font ayarları
- `TS Outliner: Open Emoji Settings` - Emoji özelleştirmesi

## FontAwesome Kurulumu

### Otomatik (CDN) - Varsayılan

Extension otomatik olarak FontAwesome CDN'den yükler. İnternet bağlantısı gerekli.

### Manuel Kurulum

1. [FontAwesome](https://fontawesome.com/) sitesinden fontları indir
2. Sistem fontlarına yükle
3. WebView'de CDN yerine lokal kullanım için extension kodunu düzenle

## Özelleştirme Örnekleri

### Renkli Emoji Seti:

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

### Alternatif FontAwesome Seti:

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

## Sorun Giderme

**FontAwesome ikonları görünmüyor:**

- İnternet bağlantını kontrol et
- Browser cache'ini temizle
- VS Code'u yeniden başlat

**Font değişmiyor:**

- VS Code'u yeniden başlat
- Settings'in doğru kaydedildiğini kontrol et
- Extension'u devre dışı bırakıp tekrar etkinleştir

**Performance sorunları:**

- `iconType` ayarını `"none"` yap
- `fontSize` değerini düşür
- Emoji kullanmayı tercih et (FontAwesome yerine)
