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
      this.outputChannel.appendLine(
        `Received message: ${JSON.stringify(message)}`
      );
      switch (message.type) {
        case "goToLine":
          this.goToLine(message.line);
          break;
        case "selectBlock":
          this.outputChannel.appendLine(`Processing selectBlock message...`);
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
          this.outputChannel.appendLine(
            `Unknown message type: ${message.type}`
          );
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
    this.outputChannel.appendLine(`setSortMode called with mode: ${mode}`);
    this.sortMode = mode;
    this.applySorting();
    this.updateWebview();
    this.outputChannel.appendLine(
      `setSortMode completed. Current mode: ${this.sortMode}`
    );
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

      this.outputChannel.appendLine(
        `Updating webview with sortMode: ${this.sortMode}, nodes: ${this.nodes.length}`
      );

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
   * Kod bloğunu (fonksiyon, class vb.) seç
   */
  private async selectBlock(
    line: number,
    name: string,
    type: string
  ): Promise<void> {
    this.outputChannel.appendLine(`=== selectBlock called ===`);
    this.outputChannel.appendLine(
      `Line: ${line}, Name: ${name}, Type: ${type}`
    );
    // Output panel'i otomatik açma - focus'u kaçırıyor

    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      this.outputChannel.appendLine("ERROR: No active editor found");
      vscode.window.showErrorMessage("No active editor found");
      return;
    }

    const document = editor.document;
    this.outputChannel.appendLine(`Document URI: ${document.uri.toString()}`);
    this.outputChannel.appendLine(`Document filename: ${document.fileName}`);
    this.outputChannel.appendLine(`Document language: ${document.languageId}`);

    // OUTPUT panel veya log dosyasını ignore et, sadece TypeScript dosyalarını kabul et
    if (
      document.languageId !== "typescript" &&
      document.languageId !== "typescriptreact"
    ) {
      this.outputChannel.appendLine(
        `ERROR: Current editor is not a TypeScript file (language: ${document.languageId})`
      );

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

      this.outputChannel.appendLine(
        `Found TypeScript editor: ${tsEditor.document.fileName}`
      );
      // TypeScript editörü aktif yap
      await vscode.window.showTextDocument(tsEditor.document);
      // Yeni aktif editörle işleme devam et
      return this.selectBlock(line, name, type);
    }

    const startLine = line; // Parser zaten 0-indexed veriyor, çevirme yok
    this.outputChannel.appendLine(
      `Document has ${document.lineCount} lines, input line was ${line}, using startLine: ${startLine}`
    );

    // Başlangıç pozisyonunu bul
    if (startLine < 0 || startLine >= document.lineCount) {
      this.outputChannel.appendLine(
        `ERROR: Invalid line number. startLine: ${startLine}, document.lineCount: ${document.lineCount}`
      );
      vscode.window.showErrorMessage(
        `Invalid line number: ${line} (document has ${document.lineCount} lines)`
      );
      return;
    }

    const startPosition = new vscode.Position(startLine, 0);
    this.outputChannel.appendLine(
      `Line ${startLine + 1} content: "${document.lineAt(startLine).text}"`
    );

    // Blok tipine göre end pozisyonunu hesapla
    let endLine = startLine;
    const totalLines = document.lineCount;

    // Blok sonunu bul
    if (type === "class" || type === "interface" || type === "enum") {
      this.outputChannel.appendLine(`Searching for ${type} block end`);
      // Class/interface/enum için süslü parantezleri say
      let braceCount = 0;
      let foundFirstBrace = false;

      for (let i = startLine; i < totalLines; i++) {
        const lineText = document.lineAt(i).text;
        this.outputChannel.appendLine(`Line ${i + 1}: ${lineText}`);

        for (const char of lineText) {
          if (char === "{") {
            braceCount++;
            foundFirstBrace = true;
            this.outputChannel.appendLine(
              `Found opening brace at line ${i + 1}, count: ${braceCount}`
            );
          } else if (char === "}") {
            braceCount--;
            this.outputChannel.appendLine(
              `Found closing brace at line ${i + 1}, count: ${braceCount}`
            );
            if (foundFirstBrace && braceCount === 0) {
              endLine = i;
              this.outputChannel.appendLine(`Block ends at line ${i + 1}`);
              break;
            }
          }
        }

        if (foundFirstBrace && braceCount === 0) break;
      }
    } else if (type === "method" || type === "function") {
      this.outputChannel.appendLine(`Searching for ${type} block end`);
      // Metod/fonksiyon için süslü parantezleri say
      let braceCount = 0;
      let foundFirstBrace = false;

      for (let i = startLine; i < totalLines; i++) {
        const lineText = document.lineAt(i).text;
        this.outputChannel.appendLine(`Line ${i + 1}: ${lineText}`);

        // Arrow function kontrolü
        if (lineText.includes("=>")) {
          this.outputChannel.appendLine("Detected arrow function");
          // Arrow function için farklı logic
          if (lineText.trim().endsWith(";")) {
            endLine = i;
            this.outputChannel.appendLine(
              `Single-line arrow function ends at line ${i + 1}`
            );
            break;
          } else if (lineText.includes("{")) {
            // Multi-line arrow function
            braceCount = 1;
            foundFirstBrace = true;
            this.outputChannel.appendLine("Multi-line arrow function detected");
            continue;
          }
        }

        for (const char of lineText) {
          if (char === "{") {
            braceCount++;
            foundFirstBrace = true;
            this.outputChannel.appendLine(
              `Found opening brace at line ${i + 1}, count: ${braceCount}`
            );
          } else if (char === "}") {
            braceCount--;
            this.outputChannel.appendLine(
              `Found closing brace at line ${i + 1}, count: ${braceCount}`
            );
            if (foundFirstBrace && braceCount === 0) {
              endLine = i;
              this.outputChannel.appendLine(`Block ends at line ${i + 1}`);
              break;
            }
          }
        }

        if (foundFirstBrace && braceCount === 0) break;
      }
    } else {
      this.outputChannel.appendLine(`Simple selection for type: ${type}`);
      // Diğer tipler için sadece o satırı seç
      endLine = startLine;
    }

    // Selection oluştur
    const startPos = new vscode.Position(startLine, 0);
    const endPos = new vscode.Position(
      endLine,
      document.lineAt(endLine).text.length
    );
    const selection = new vscode.Selection(startPos, endPos);

    this.outputChannel.appendLine(
      `Creating selection from line ${startLine + 1} to ${endLine + 1}`
    );
    this.outputChannel.appendLine(
      `Start pos: ${startPos.line}, ${startPos.character}`
    );
    this.outputChannel.appendLine(
      `End pos: ${endPos.line}, ${endPos.character}`
    );

    // Seçimi uygula ve görünüme getir
    editor.selection = selection;
    editor.revealRange(selection, vscode.TextEditorRevealType.InCenter);

    this.outputChannel.appendLine("Selection applied successfully");
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
    this.outputChannel.appendLine(
      `applySorting: Current sortMode: ${this.sortMode}, nodes count: ${this.nodes.length}`
    );

    // Tüm node'ların detaylı bilgilerini log'la (children dahil)
    this.logNodeStructure(this.nodes, 0);

    // Sıralama öncesi ilk 3 node'un adını log'la
    const beforeSort = this.nodes
      .slice(0, 3)
      .map((n) => `${n.name}(${n.type}, line:${n.line})`);
    this.outputChannel.appendLine(`Before sort: ${beforeSort.join(", ")}`);

    // CRITICAL: Sorted nodes'u yakalayıp this.nodes'a atamamız gerekiyor
    this.nodes = OutlineSorter.sortNodes(this.nodes, this.sortMode);

    // Sıralama sonrası ilk 3 node'un adını log'la
    const afterSort = this.nodes
      .slice(0, 3)
      .map((n) => `${n.name}(${n.type}, line:${n.line})`);
    this.outputChannel.appendLine(`After sort: ${afterSort.join(", ")}`);
  }

  /**
   * Node yapısını recursive olarak log'lar
   */
  private logNodeStructure(nodes: TreeNode[], indent: number): void {
    const spaces = "  ".repeat(indent);
    nodes.forEach((node) => {
      this.outputChannel.appendLine(
        `${spaces}${node.name}(${node.type}, line:${node.line}) - children: ${
          node.children?.length || 0
        }`
      );
      if (node.children && node.children.length > 0) {
        this.logNodeStructure(node.children, indent + 1);
      }
    });
  }
}
