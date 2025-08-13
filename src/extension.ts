import * as vscode from "vscode";
import { TypeScriptParser } from "./typescript-parser";
import { TypeScriptWebviewProvider } from "./webview-provider";
import { OutlineSorter } from "./outline-sorter";

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

  // Configuration değişikliklerini dinle
  const configChangeDisposable = vscode.workspace.onDidChangeConfiguration(
    (event) => {
      if (event.affectsConfiguration("typescriptOutliner")) {
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
