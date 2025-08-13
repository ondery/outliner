// The module 'vscode' contains the VS Code extensibility API
import * as vscode from "vscode";
import { TypeScriptWebviewProvider } from "./webview-provider";

export function activate(context: vscode.ExtensionContext) {
  console.log("TS OUTLINER is now active!");

  // Webview provider oluştur
  const provider = new TypeScriptWebviewProvider(context.extensionUri);

  // Webview view'ını kaydet
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      TypeScriptWebviewProvider.viewType,
      provider
    )
  );

  // Refresh command
  const refreshCommand = vscode.commands.registerCommand(
    "typescript-outline-enhancer.refresh",
    async () => {
      await provider.refresh();
      vscode.window.showInformationMessage("TS Outliner refreshed!");
    }
  );

  // Emoji ayarları komutu
  const openEmojiSettingsCommand = vscode.commands.registerCommand(
    "tsOutlineEnhancer.openEmojiSettings",
    () => {
      vscode.commands.executeCommand(
        "workbench.action.openSettings",
        "tsOutlineEnhancer.emojiSettings"
      );
      vscode.window.showInformationMessage(
        "Emoji ayarlarını değiştirmek için tsOutlineEnhancer.emojiSettings seçeneğini düzenleyin.\n" +
          'Örnek: "public": "🟢", "private": "🔴", "method": "⚙️"'
      );
    }
  );

  // Sıralama komutları
  const sortByPositionCommand = vscode.commands.registerCommand(
    "tsOutlineEnhancer.sortByPosition",
    () => {
      provider.setSortMode("position");
      vscode.window.showInformationMessage("Sorted by position");
    }
  );

  const sortByNameCommand = vscode.commands.registerCommand(
    "tsOutlineEnhancer.sortByName",
    () => {
      provider.setSortMode("name");
      vscode.window.showInformationMessage("Sorted by name");
    }
  );

  const sortByCategoryCommand = vscode.commands.registerCommand(
    "tsOutlineEnhancer.sortByCategory",
    () => {
      provider.setSortMode("category");
      vscode.window.showInformationMessage("Sorted by category");
    }
  );

  // Auto refresh - dosya değiştiğinde
  const onDidChangeTextDocument = vscode.workspace.onDidChangeTextDocument(
    (e) => {
      if (
        e.document === vscode.window.activeTextEditor?.document &&
        (e.document.languageId === "typescript" ||
          e.document.languageId === "typescriptreact")
      ) {
        setTimeout(() => provider.refresh().catch(console.error), 300);
      }
    }
  );

  // Auto refresh - aktif editor değiştiğinde
  const onDidChangeActiveTextEditor = vscode.window.onDidChangeActiveTextEditor(
    (editor) => {
      if (
        editor &&
        (editor.document.languageId === "typescript" ||
          editor.document.languageId === "typescriptreact")
      ) {
        provider.refresh().catch(console.error);
      }
    }
  );

  // Cursor pozisyonu değiştiğinde auto-select
  const onDidChangeTextEditorSelection =
    vscode.window.onDidChangeTextEditorSelection((e) => {
      const config = vscode.workspace.getConfiguration("tsOutlineEnhancer");
      const autoSelectCurrentElement = config.get(
        "autoSelectCurrentElement",
        false
      );

      if (
        autoSelectCurrentElement &&
        e.textEditor === vscode.window.activeTextEditor &&
        (e.textEditor.document.languageId === "typescript" ||
          e.textEditor.document.languageId === "typescriptreact")
      ) {
        const cursorLine = e.selections[0].active.line;
        provider.selectElementAtLine(cursorLine);
      }
    });

  // Ayarlar değiştiğinde yenile
  const onDidChangeConfiguration = vscode.workspace.onDidChangeConfiguration(
    (e) => {
      if (e.affectsConfiguration("tsOutlineEnhancer")) {
        provider.refresh().catch(console.error);
        vscode.window.showInformationMessage("TS Outliner settings updated!");
      }
    }
  );

  // İlk yükleme
  setTimeout(async () => {
    await provider.refresh().catch(console.error);
    console.log("Initial refresh completed");
  }, 500);

  context.subscriptions.push(
    refreshCommand,
    openEmojiSettingsCommand,
    sortByPositionCommand,
    sortByNameCommand,
    sortByCategoryCommand,
    onDidChangeTextDocument,
    onDidChangeActiveTextEditor,
    onDidChangeTextEditorSelection,
    onDidChangeConfiguration
  );
}

export function deactivate() {}
