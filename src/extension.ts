import * as vscode from "vscode";
import { TypeScriptParser } from "./typescript-parser";
import { TypeScriptWebviewProvider } from "./webview-provider";
import { OutlineSorter } from "./outline-sorter";
import * as os from "os";
import * as fs from "fs";
import * as path from "path";

/**
 * Sistem fontlarını tespit eden fonksiyonlar
 */
class SystemFonts {
  /**
   * Windows sistem fontlarını tespit eder
   */
  private static getWindowsFonts(): string[] {
    const fonts = new Set<string>(); // Set kullanarak duplicate'ları otomatik kaldır
    const fontDirs = [
      "C:\\Windows\\Fonts",
      path.join(os.homedir(), "AppData\\Local\\Microsoft\\Windows\\Fonts"),
    ];

    // Popüler font isimlerinin mapping'i (dosya adı -> görünen ad)
    const fontMappings: { [key: string]: string } = {
      arial: "Arial",
      times: "Times New Roman",
      cour: "Courier New",
      tahoma: "Tahoma",
      verdana: "Verdana",
      georgia: "Georgia",
      trebuc: "Trebuchet MS",
      impact: "Impact",
      consola: "Consolas",
      calibri: "Calibri",
      cambria: "Cambria",
      candara: "Candara",
      constantia: "Constantia",
      corbel: "Corbel",
      segoeui: "Segoe UI",
      meiryo: "Meiryo",
      yugothic: "Yu Gothic",
      msgothic: "MS Gothic",
      mspgothic: "MS PGothic",
      msmincho: "MS Mincho",
      mspmincho: "MS PMincho",
    };

    for (const fontDir of fontDirs) {
      try {
        if (fs.existsSync(fontDir)) {
          const files = fs.readdirSync(fontDir);
          for (const file of files) {
            const ext = path.extname(file).toLowerCase();
            if ([".ttf", ".otf", ".woff", ".woff2"].includes(ext)) {
              let fontName = path.basename(file, ext).toLowerCase();

              // Özel karakterleri ve numaraları temizle
              fontName = fontName.replace(/[-_\d]/g, "").trim();

              // Mapping'den uygun adı bul
              const mappedName = Object.keys(fontMappings).find((key) =>
                fontName.startsWith(key.toLowerCase())
              );

              if (mappedName) {
                fonts.add(fontMappings[mappedName]);
              } else if (fontName.length > 2) {
                // İlk harfi büyük yap
                const displayName =
                  fontName.charAt(0).toUpperCase() + fontName.slice(1);
                fonts.add(displayName);
              }
            }
          }
        }
      } catch (error) {
        console.error(`Font dizini okunamadı: ${fontDir}`, error);
      }
    }

    return Array.from(fonts).sort();
  }

  /**
   * macOS sistem fontlarını tespit eder
   */
  private static getMacFonts(): string[] {
    const fonts: string[] = [];
    const fontDirs = [
      "/System/Library/Fonts",
      "/Library/Fonts",
      path.join(os.homedir(), "Library/Fonts"),
    ];

    for (const fontDir of fontDirs) {
      try {
        if (fs.existsSync(fontDir)) {
          const files = fs.readdirSync(fontDir);
          for (const file of files) {
            if (
              file.toLowerCase().endsWith(".ttf") ||
              file.toLowerCase().endsWith(".otf") ||
              file.toLowerCase().endsWith(".ttc")
            ) {
              const fontName = path
                .basename(file, path.extname(file))
                .replace(/[-_].*$/, "")
                .replace(/\b\w/g, (l) => l.toUpperCase());

              if (!fonts.includes(fontName) && fontName.length > 2) {
                fonts.push(fontName);
              }
            }
          }
        }
      } catch (error) {
        console.error(`Font dizini okunamadı: ${fontDir}`, error);
      }
    }

    return fonts.sort();
  }

  /**
   * Linux sistem fontlarını tespit eder
   */
  private static getLinuxFonts(): string[] {
    const fonts: string[] = [];
    const fontDirs = [
      "/usr/share/fonts",
      "/usr/local/share/fonts",
      path.join(os.homedir(), ".fonts"),
      path.join(os.homedir(), ".local/share/fonts"),
    ];

    for (const fontDir of fontDirs) {
      try {
        if (fs.existsSync(fontDir)) {
          const scanDir = (dir: string) => {
            const items = fs.readdirSync(dir, { withFileTypes: true });
            for (const item of items) {
              const fullPath = path.join(dir, item.name);
              if (item.isDirectory()) {
                scanDir(fullPath); // Recursive tarama
              } else if (item.isFile()) {
                const ext = path.extname(item.name).toLowerCase();
                if (
                  [".ttf", ".otf", ".woff", ".woff2", ".pfb", ".pfa"].includes(
                    ext
                  )
                ) {
                  const fontName = path
                    .basename(item.name, ext)
                    .replace(/[-_].*$/, "")
                    .replace(/\b\w/g, (l) => l.toUpperCase());

                  if (!fonts.includes(fontName) && fontName.length > 2) {
                    fonts.push(fontName);
                  }
                }
              }
            }
          };
          scanDir(fontDir);
        }
      } catch (error) {
        console.error(`Font dizini okunamadı: ${fontDir}`, error);
      }
    }

    return fonts.sort();
  }

  /**
   * Platform'a göre sistem fontlarını döndürür
   */
  public static getSystemFonts(): string[] {
    const platform = os.platform();

    try {
      switch (platform) {
        case "win32":
          return this.getWindowsFonts();
        case "darwin":
          return this.getMacFonts();
        case "linux":
          return this.getLinuxFonts();
        default:
          console.warn(`Desteklenmeyen platform: ${platform}`);
          return [];
      }
    } catch (error) {
      console.error("Sistem fontları tespit edilirken hata:", error);
      return [];
    }
  }

  /**
   * Popüler programlama fontlarının listesi
   */
  public static getPopularProgrammingFonts(): string[] {
    return [
      "inherit",
      "Fira Code",
      "JetBrains Mono",
      "Source Code Pro",
      "Consolas",
      "Cascadia Code",
      "SF Mono",
      "Roboto Mono",
      "Ubuntu Mono",
      "Droid Sans Mono",
      "Inconsolata",
      "Monaco",
      "Menlo",
      "DejaVu Sans Mono",
      "Liberation Mono",
      "Hack",
      "Anonymous Pro",
      "Noto Sans Mono",
      "PT Mono",
      "IBM Plex Mono",
      "Victor Mono",
      "Input Mono",
      "Operator Mono",
      "Fantasque Sans Mono",
    ];
  }

  /**
   * Sistem ve popüler fontları birleştirir, duplikatları kaldırır
   */
  public static getAllAvailableFonts(): { [key: string]: string[] } {
    const systemFonts = this.getSystemFonts();
    const popularFonts = this.getPopularProgrammingFonts();

    // Kategorilere göre organize et
    const categories = {
      inherit: ["inherit"],
      "Programming Fonts": [
        "Fira Code, 'Courier New', monospace",
        "JetBrains Mono, 'Courier New', monospace",
        "Source Code Pro, 'Courier New', monospace",
        "Consolas, 'Courier New', monospace",
        "Cascadia Code, 'Courier New', monospace",
        "SF Mono, Monaco, 'Courier New', monospace",
        "Roboto Mono, 'Courier New', monospace",
        "Ubuntu Mono, 'Courier New', monospace",
        "Inconsolata, 'Courier New', monospace",
        "Monaco, 'Courier New', monospace",
        "Menlo, 'Courier New', monospace",
        "Hack, 'Courier New', monospace",
        "Anonymous Pro, 'Courier New', monospace",
        "DejaVu Sans Mono, 'Courier New', monospace",
        "Liberation Mono, 'Courier New', monospace",
        "Noto Sans Mono, 'Courier New', monospace",
        "PT Mono, 'Courier New', monospace",
        "IBM Plex Mono, 'Courier New', monospace",
        "Victor Mono, 'Courier New', monospace",
        "Input Mono, 'Courier New', monospace",
        "Operator Mono, 'Courier New', monospace",
        "Fantasque Sans Mono, 'Courier New', monospace",
        "Droid Sans Mono, 'Courier New', monospace",
        "Lucida Console, Monaco, monospace",
        "Courier New, Courier, monospace",
      ],
      "System Fonts": [
        "Arial, sans-serif",
        "Segoe UI, Tahoma, Geneva, Verdana, sans-serif",
        "Helvetica Neue, Helvetica, Arial, sans-serif",
        "Calibri, sans-serif",
        "Tahoma, Geneva, sans-serif",
        "Verdana, Geneva, sans-serif",
        "Trebuchet MS, 'Lucida Grande', sans-serif",
        "Candara, sans-serif",
        "Corbel, sans-serif",
      ],
      "Serif Fonts": [
        "Times New Roman, Times, serif",
        "Georgia, 'Times New Roman', serif",
        "Cambria, serif",
        "Constantia, serif",
      ],
      "Display Fonts": [
        "Impact, Arial Black, sans-serif",
        "Arial Black, Arial, sans-serif",
      ],
    };

    // Sistem fontlarından bulduklarımızı da ekle
    systemFonts.forEach((font) => {
      if (
        !categories["System Fonts"].some((existing) => existing.includes(font))
      ) {
        categories["System Fonts"].push(`${font}, sans-serif`);
      }
    });

    return categories;
  }
}

export function activate(context: vscode.ExtensionContext) {
  console.log("TypeScript Outliner Extension is now active!");

  // TypeScript parser'ı oluştur
  const parser = new TypeScriptParser();

  // Webview provider'ı kaydet
  const webviewProvider = new TypeScriptWebviewProvider(context.extensionUri);
  const webviewDisposable = vscode.window.registerWebviewViewProvider(
    TypeScriptWebviewProvider.viewType,
    webviewProvider
  );

  // Komutları kaydet
  const refreshCommand = vscode.commands.registerCommand(
    "typescriptOutliner.refresh",
    () => {
      webviewProvider.refresh();
      vscode.window.showInformationMessage("TypeScript Outline refreshed!");
    }
  );

  const sortByVisibilityCommand = vscode.commands.registerCommand(
    "typescriptOutliner.sortByVisibility",
    () => {
      webviewProvider.setSortMode("category");
      vscode.window.showInformationMessage("Outline sorted by visibility!");
    }
  );

  const sortAlphabeticallyCommand = vscode.commands.registerCommand(
    "typescriptOutliner.sortAlphabetically",
    () => {
      webviewProvider.setSortMode("name");
      vscode.window.showInformationMessage("Outline sorted alphabetically!");
    }
  );

  // Font ayarları komutunu kaydet
  const openFontSettingsCommand = vscode.commands.registerCommand(
    "typescriptOutliner.openFontSettings",
    () => {
      vscode.commands.executeCommand(
        "workbench.action.openSettings",
        "@ext:undefined_publisher.typescript-outliner font"
      );
    }
  );

  // İkon görünüm ayarları komutunu kaydet
  const openIconAppearanceSettingsCommand = vscode.commands.registerCommand(
    "typescriptOutliner.openIconAppearanceSettings",
    () => {
      vscode.commands.executeCommand(
        "workbench.action.openSettings",
        "@ext:undefined_publisher.typescript-outliner icon"
      );
    }
  );

  // Tüm ayarlar komutunu kaydet
  const openAllSettingsCommand = vscode.commands.registerCommand(
    "typescriptOutliner.openAllSettings",
    () => {
      vscode.commands.executeCommand(
        "workbench.action.openSettings",
        "@ext:undefined_publisher.typescript-outliner"
      );
    }
  );

  // Test komutunu kaydet
  const testCommand = vscode.commands.registerCommand(
    "typescriptOutliner.test",
    () => {
      const config = vscode.workspace.getConfiguration("typescriptOutliner");
      const iconType = config.get<string>("iconType", "emoji");
      const fontFamily = config.get<string>("fontFamily", "inherit");
      const fontSize = config.get<number>("fontSize", 14);

      vscode.window.showInformationMessage(
        `TS Outliner - Icon: ${iconType}, Font: ${fontFamily}, Size: ${fontSize}px`
      );
    }
  );

  // Font seçici komutunu kaydet
  const selectFontCommand = vscode.commands.registerCommand(
    "typescriptOutliner.selectFont",
    async () => {
      const fontCategories = SystemFonts.getAllAvailableFonts();
      const currentFont = vscode.workspace
        .getConfiguration("tsOutlineEnhancer")
        .get<string>("fontFamily", "inherit");

      // QuickPick için kategorilere ayırılmış item'lar oluştur
      const fontItems: vscode.QuickPickItem[] = [];

      // Her kategori için separator ve fontları ekle
      Object.entries(fontCategories).forEach(([categoryName, fonts]) => {
        if (categoryName !== "inherit") {
          // Kategori separator'ı ekle
          fontItems.push({
            label: `$(symbol-folder) ${categoryName}`,
            kind: vscode.QuickPickItemKind.Separator,
          });
        }

        fonts.forEach((fullFontDeclaration) => {
          // Font adını çıkar (virgül öncesi kısım)
          const fontName = fullFontDeclaration
            .split(",")[0]
            .replace(/['"]/g, "")
            .trim();

          let icon = "$(symbol-text)";
          let description = "";

          if (fontName === "inherit") {
            icon = "$(symbol-property)";
            description = "Use VS Code editor font";
          } else if (fullFontDeclaration === currentFont) {
            icon = "$(check)";
            description = "Currently selected";
          }

          fontItems.push({
            label: `${icon} ${fontName}`,
            description,
            detail:
              fullFontDeclaration !== fontName
                ? fullFontDeclaration
                : undefined,
            fontName: fullFontDeclaration,
          } as any);
        });
      });

      const selected = await vscode.window.showQuickPick(fontItems, {
        placeHolder: "Select a font family for TypeScript Outliner",
        matchOnDescription: true,
        matchOnDetail: true,
        ignoreFocusOut: false,
        title: "TS OUTLINER - Font Family Selection",
      });

      if (selected && (selected as any).fontName) {
        const config = vscode.workspace.getConfiguration("tsOutlineEnhancer");
        const fontName = (selected as any).fontName;
        await config.update(
          "fontFamily",
          fontName,
          vscode.ConfigurationTarget.Global
        );

        const displayName =
          fontName === "inherit" ? "inherit (VS Code Editor Font)" : fontName;
        vscode.window.showInformationMessage(
          `TS Outliner font family updated to: ${displayName}`
        );

        // Manuel refresh çağır - configuration event'in gecikmesi olabilir
        webviewProvider.refresh();
      }
    }
  );

  // Configuration değişikliklerini dinle
  const configChangeDisposable = vscode.workspace.onDidChangeConfiguration(
    (event) => {
      if (
        event.affectsConfiguration("typescriptOutliner") ||
        event.affectsConfiguration("tsOutlineEnhancer")
      ) {
        console.log("TypeScript Outliner configuration changed");
        webviewProvider.refresh();
      }
    }
  );

  // Aktif editörün değişmesini dinle
  const activeEditorChangeDisposable =
    vscode.window.onDidChangeActiveTextEditor(() => {
      webviewProvider.refresh();
    });

  // Text document değişikliklerini dinle
  const documentChangeDisposable = vscode.workspace.onDidChangeTextDocument(
    (event) => {
      const activeEditor = vscode.window.activeTextEditor;
      if (activeEditor && event.document === activeEditor.document) {
        // Debounced refresh için setTimeout kullan
        setTimeout(() => {
          webviewProvider.refresh();
        }, 500);
      }
    }
  );

  // Disposable'ları context'e ekle
  context.subscriptions.push(
    webviewDisposable,
    refreshCommand,
    sortByVisibilityCommand,
    sortAlphabeticallyCommand,
    openFontSettingsCommand,
    openIconAppearanceSettingsCommand,
    openAllSettingsCommand,
    testCommand,
    selectFontCommand,
    configChangeDisposable,
    activeEditorChangeDisposable,
    documentChangeDisposable
  );

  // Extension aktif olduğunu göster
  vscode.window.showInformationMessage(
    "TypeScript Outliner Extension loaded successfully!"
  );
}

export function deactivate() {
  console.log("TypeScript Outliner Extension deactivated");
}
