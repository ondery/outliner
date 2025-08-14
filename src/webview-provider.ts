import * as vscode from "vscode";
import { TreeNode, TypeScriptParser } from "./typescript-parser";
import { OutlineSorter, SortMode } from "./outline-sorter";
import { WebViewTemplateManager } from "./webview-template";

/**
 * Ana WebView Provider sınıfı - VS Code extension'ın UI kısmını yönetir
 * Artık sadece koordinasyon görevini üstleniyor, detaylı işleri diğer modüllere devrediyor
 */
export class TypeScriptWebviewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "tsOutlineEnhancer.webview";

  private _view?: vscode.WebviewView;
  private nodes: TreeNode[] = [];
  private sortMode: SortMode = "position";
  private parser: TypeScriptParser;
  private templateManager: WebViewTemplateManager;
  private outputChannel: vscode.OutputChannel;

  constructor(private readonly _extensionUri: vscode.Uri) {
    this.parser = new TypeScriptParser();
    this.templateManager = new WebViewTemplateManager();
    this.outputChannel = vscode.window.createOutputChannel(
      "TypeScript Outliner"
    );

    // Başlangıç sortMode'unu settings'den al
    const config = vscode.workspace.getConfiguration("tsOutlineEnhancer");
    this.sortMode = config.get("sortMode", "position") as SortMode;
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this.templateManager.generateHTML(
      webviewView.webview
    );

    // Message handler - webview'den gelen mesajları işler
    webviewView.webview.onDidReceiveMessage(async (message) => {
      switch (message.type) {
        case "goToLine":
          this.goToLine(message.line);
          break;
        case "selectBlock":
          this.selectBlock(
            message.line,
            message.name,
            message.nodeType || message.type
          );
          break;
        case "sortBy":
          this.setSortMode(message.mode);
          break;
        case "refresh":
          await this.refresh();
          break;
        case "selectFont":
          // Font seçim komutunu çalıştır
          vscode.commands.executeCommand("typescriptOutliner.selectFont");
          break;
        default:
          console.error(`Unknown message type: ${message.type}`);
      }
    });

    // WebView görünürlük değişikliklerini dinle
    webviewView.onDidChangeVisibility(() => {
      if (webviewView.visible) {
        // Panel görünür hale geldiğinde data'yı yenile
        this.refresh();
      }
    });

    // İlk yükleme
    this.refresh();
  }

  /**
   * Aktif dosyayı yeniden parse eder ve UI'ı günceller
   */
  public async refresh(): Promise<void> {
    this.nodes = await this.parser.parseActiveFile();
    this.applySorting();
    this.updateWebview();
  }

  /**
   * Sıralama modunu değiştirir ve UI'ı günceller
   */
  public setSortMode(mode: SortMode): void {
    this.sortMode = mode;
    this.applySorting();
    this.updateWebview();
  }

  /**
   * WebView'e güncellenmiş data gönderir
   */
  private updateWebview(): void {
    if (this._view && this._view.visible) {
      // Settings'den tüm ayarları al
      const config = vscode.workspace.getConfiguration("tsOutlineEnhancer");
      const emojiSettings = config.get("emojiSettings", {});
      const fontAwesomeSettings = config.get("fontAwesomeSettings", {});
      const iconType = config.get("iconType", "emoji");
      const fontFamily = config.get(
        "fontFamily",
        "Consolas, 'Courier New', monospace"
      );
      const fontSize = config.get("fontSize", 13);
      const lineHeight = config.get("lineHeight", 1.2);
      const iconSize = config.get("iconSize", 16);
      const iconSpacing = config.get("iconSpacing", 4);
      const iconToTextSpacing = config.get("iconToTextSpacing", 6);
      const tooltipFontSize = config.get("tooltipFontSize", 11);
      const showTooltipPrefixes = config.get("showTooltipPrefixes", false);
      const showIconsInLabel = config.get("showIconsInLabel", true);
      const showVisibilityInLabel = config.get("showVisibilityInLabel", false);
      const autoSelectCurrentElement = config.get(
        "autoSelectCurrentElement",
        false
      );
      const autoRevealCurrentElement = config.get(
        "autoRevealCurrentElement",
        false
      );

      // Sort butonuna tıklandığında manuel sort yapıldığı için settings'ten sortMode almayalım
      // this.sortMode zaten doğru değerde

      this._view.webview.postMessage({
        type: "updateOutline",
        nodes: this.nodes,
        sortMode: this.sortMode,
        settings: {
          emojiSettings,
          fontAwesomeSettings,
          iconType,
          fontFamily,
          fontSize,
          lineHeight,
          iconSize,
          iconSpacing,
          iconToTextSpacing,
          tooltipFontSize,
          showTooltipPrefixes,
          showIconsInLabel,
          showVisibilityInLabel,
          autoSelectCurrentElement,
          autoRevealCurrentElement,
        },
      });
    }
  }

  /**
   * Editörde belirli bir satıra gider (webview'den tıklanınca çalışır)
   */
  private goToLine(lineNumber: number): void {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const position = new vscode.Position(lineNumber, 0);
      const range = new vscode.Range(position, position);
      editor.selection = new vscode.Selection(position, position);
      editor.revealRange(range, vscode.TextEditorRevealType.InCenter);
    }
  }

  /**
   * Kod bloğunu (fonksiyon, class vb.) seç - LSP range bilgisini kullanır
   */
  private async selectBlock(
    line: number,
    name: string,
    type: string
  ): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage("No active editor found");
      return;
    }

    const document = editor.document;

    // OUTPUT panel veya log dosyasını ignore et, sadece TypeScript dosyalarını kabul et
    if (
      document.languageId !== "typescript" &&
      document.languageId !== "typescriptreact"
    ) {
      // TypeScript editör bul
      const tsEditor = vscode.window.visibleTextEditors.find(
        (e) =>
          e.document.languageId === "typescript" ||
          e.document.languageId === "typescriptreact"
      );

      if (!tsEditor) {
        vscode.window.showErrorMessage("No TypeScript file is currently open");
        return;
      }

      // TypeScript editörü aktif yap
      await vscode.window.showTextDocument(tsEditor.document);
      // Yeni aktif editörle işleme devam et
      return this.selectBlock(line, name, type);
    }

    try {
      // LSP'den Document Symbol'ları al
      const symbols = (await vscode.commands.executeCommand<
        vscode.DocumentSymbol[]
      >("vscode.executeDocumentSymbolProvider", document.uri)) as
        | vscode.DocumentSymbol[]
        | undefined;

      if (!symbols || symbols.length === 0) {
        // Fallback: manuel seçim
        this.fallbackSelection(line, document);
        return;
      }

      // İlgili symbol'ı bul
      const targetSymbol = this.findSymbolByLineAndName(
        symbols,
        line,
        name,
        type
      );

      if (targetSymbol) {
        // LSP'den gelen range bilgisini kullan
        const selection = new vscode.Selection(
          targetSymbol.range.start,
          targetSymbol.range.end
        );

        // Seçimi uygula ve görünüme getir
        editor.selection = selection;
        editor.revealRange(selection, vscode.TextEditorRevealType.InCenter);
      } else {
        // Symbol bulunamazsa fallback kullan
        this.fallbackSelection(line, document);
      }
    } catch (error) {
      console.error("Error using LSP for selection:", error);
      // Hata durumunda fallback kullan
      this.fallbackSelection(line, document);
    }
  }

  /**
   * LSP symbol'larını recursive olarak arar
   */
  private findSymbolByLineAndName(
    symbols: vscode.DocumentSymbol[],
    targetLine: number,
    targetName: string,
    targetType: string
  ): vscode.DocumentSymbol | null {
    for (const symbol of symbols) {
      // Line ve name match kontrolü
      const symbolLine = symbol.range.start.line;
      const symbolName = symbol.name;

      // Constructor özel durumu
      if (
        targetType === "constructor" &&
        symbol.kind === vscode.SymbolKind.Constructor
      ) {
        if (Math.abs(symbolLine - targetLine) <= 1) {
          // 1 satır tolerans
          return symbol;
        }
      }
      // Diğer tipler için normal kontrolü
      else if (
        symbolName === targetName &&
        Math.abs(symbolLine - targetLine) <= 1
      ) {
        return symbol;
      }

      // Child symbol'larda da ara
      if (symbol.children && symbol.children.length > 0) {
        const childResult = this.findSymbolByLineAndName(
          symbol.children,
          targetLine,
          targetName,
          targetType
        );
        if (childResult) {
          return childResult;
        }
      }
    }

    return null;
  }

  /**
   * LSP başarısız olursa fallback selection
   */
  private fallbackSelection(line: number, document: vscode.TextDocument): void {
    const startPos = new vscode.Position(line, 0);
    const endPos = new vscode.Position(line, document.lineAt(line).text.length);
    const selection = new vscode.Selection(startPos, endPos);

    const editor = vscode.window.activeTextEditor;
    if (editor) {
      editor.selection = selection;
      editor.revealRange(selection, vscode.TextEditorRevealType.InCenter);
    }
  }

  /**
   * Belirli bir satırdaki element'i outline'da seç
   */
  public selectElementAtLine(line: number): void {
    if (this._view && this._view.visible) {
      this._view.webview.postMessage({
        type: "selectElementAtLine",
        line: line,
      });
    }
  }

  /**
   * Mevcut node'ları seçili sıralama moduna göre sıralar
   */
  private applySorting(): void {
    // CRITICAL: Sorted nodes'u yakalayıp this.nodes'a atamamız gerekiyor
    this.nodes = OutlineSorter.sortNodes(this.nodes, this.sortMode);
  }
}
