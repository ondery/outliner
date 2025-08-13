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

  constructor(private readonly _extensionUri: vscode.Uri) {
    this.parser = new TypeScriptParser();
    this.templateManager = new WebViewTemplateManager();
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
        case "sortBy":
          this.setSortMode(message.mode);
          break;
        case "refresh":
          await this.refresh();
          break;
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
    if (this._view) {
      this._view.webview.postMessage({
        type: "updateOutline",
        nodes: this.nodes,
        sortMode: this.sortMode,
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
   * Mevcut node'ları seçili sıralama moduna göre sıralar
   */
  private applySorting(): void {
    OutlineSorter.sortNodes(this.nodes, this.sortMode);
  }
}
