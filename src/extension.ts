// The module 'vscode' contains the VS Code extensibility API
import * as vscode from "vscode";

interface TreeNode {
  name: string;
  type:
    | "class"
    | "interface"
    | "method"
    | "property"
    | "function"
    | "constructor"
    | "getter"
    | "setter";
  visibility: "public" | "private" | "protected";
  modifiers: string[];
  line: number;
  children?: TreeNode[];
}

class TypeScriptOutlineProvider implements vscode.TreeDataProvider<TreeNode> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    TreeNode | undefined | null | void
  > = new vscode.EventEmitter<TreeNode | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<
    TreeNode | undefined | null | void
  > = this._onDidChangeTreeData.event;

  private nodes: TreeNode[] = [];
  private treeView?: vscode.TreeView<TreeNode>;
  public isOutlinerClick = false; // Outliner tıklaması flag'i - public yap

  setTreeView(treeView: vscode.TreeView<TreeNode>) {
    this.treeView = treeView;
  }

  refresh(): void {
    this.nodes = this.parseTypeScriptFile();
    console.log(`Refreshed outline: Found ${this.nodes.length} nodes`);
    this._onDidChangeTreeData.fire();
  }

  selectCurrentElement(lineNumber: number): void {
    const config = vscode.workspace.getConfiguration("tsOutlineEnhancer");
    const autoSelect = config.get<boolean>("autoSelectCurrentElement", false);
    const autoReveal = config.get<boolean>("autoRevealCurrentElement", true);

    console.log(
      `selectCurrentElement called: line=${lineNumber}, autoSelect=${autoSelect}, autoReveal=${autoReveal}, hasTreeView=${!!this
        .treeView}, isOutlinerClick=${this.isOutlinerClick}`
    );

    // Eğer outliner tıklaması ise auto-select yapma
    if (this.isOutlinerClick) {
      console.log("Ignoring selection change - outliner click detected");
      this.isOutlinerClick = false; // Flag'i reset et
      return;
    }

    if (!autoSelect || !this.treeView) {
      console.log(
        `Auto-select disabled or no tree view: autoSelect=${autoSelect}, treeView=${!!this
          .treeView}`
      );
      return;
    }

    // TreeView kapalıysa ve autoReveal kapalıysa reveal yapma
    if (!this.treeView!.visible && !autoReveal) {
      console.log(
        "TreeView not visible and autoReveal disabled, skipping reveal"
      );
      return;
    }

    const element = this.findElementByLine(lineNumber);
    console.log(
      `Found element for line ${lineNumber}:`,
      element?.name || "none"
    );

    if (element) {
      console.log(`Revealing element: ${element.name} at line ${element.line}`);
      console.log(
        `TreeView visible: ${this.treeView!.visible}, selection: ${
          this.treeView!.selection?.length || 0
        }`
      );

      // Eğer TreeView visible değilse, reveal çalışmayabilir
      if (!this.treeView!.visible) {
        console.log(
          "TreeView not visible, skipping reveal to prevent focus stealing"
        );
        return; // TreeView kapalıysa reveal yapma
      }
      try {
        // Center positioning için alternatif yaklaşım
        if (element.type !== "class" && element.type !== "interface") {
          const parentClass = this.nodes.find(
            (node) =>
              node.children && node.children.some((child) => child === element)
          );

          if (parentClass) {
            console.log(
              `Center positioning for: ${element.name} in ${parentClass.name}`
            );

            // 1. Önce parent class'ı reveal et ve expand et
            Promise.resolve(
              this.treeView!.reveal(parentClass, {
                select: false,
                focus: false,
                expand: 1,
              })
            )
              .then(() => {
                // 2. Parent'tan sonra bir üst elementi reveal et (context için)
                const elementIndex = parentClass.children!.indexOf(element);
                const contextElements: TreeNode[] = [];

                // Element'ten önceki 2-3 elementi al (varsa)
                for (
                  let i = Math.max(0, elementIndex - 2);
                  i < elementIndex;
                  i++
                ) {
                  contextElements.push(parentClass.children![i]);
                }

                // Element'ten sonraki 2-3 elementi al (varsa)
                for (
                  let i = elementIndex + 1;
                  i < Math.min(parentClass.children!.length, elementIndex + 3);
                  i++
                ) {
                  contextElements.push(parentClass.children![i]);
                }

                // Context elementlerini sırayla reveal et
                let contextIndex = 0;
                const revealContext = () => {
                  if (contextIndex < contextElements.length) {
                    Promise.resolve(
                      this.treeView!.reveal(contextElements[contextIndex], {
                        select: false,
                        focus: false,
                        expand: false,
                      })
                    ).then(() => {
                      contextIndex++;
                      setTimeout(revealContext, 50); // Her context element için 50ms
                    });
                  } else {
                    // Son olarak target elementi reveal et
                    setTimeout(() => {
                      console.log(`Final reveal for: ${element.name}`);
                      Promise.resolve(
                        this.treeView!.reveal(element, {
                          select: true,
                          focus: false,
                          expand: false,
                        })
                      )
                        .then(() =>
                          console.log(`Successfully centered: ${element.name}`)
                        )
                        .catch((err: any) =>
                          console.error(`Error centering: ${err}`)
                        );
                    }, 100);
                  }
                };

                // Context reveal'ı başlat
                setTimeout(revealContext, 100);
              })
              .catch((err: any) =>
                console.error(`Error expanding parent: ${err}`)
              );
            return;
          }
        }

        // Normal reveal
        console.log(`Direct reveal for: ${element.name}`);
        Promise.resolve(
          this.treeView.reveal(element, {
            select: true,
            focus: false,
            expand: false,
          })
        )
          .then(() => {
            console.log(`Successfully revealed: ${element.name}`);
          })
          .catch((err: any) => console.error(`Error revealing: ${err}`));
      } catch (error) {
        console.error(`Error revealing element: ${error}`);
      }
    }
  }
  private findElementByLine(lineNumber: number): TreeNode | undefined {
    console.log(
      `Finding element for line ${lineNumber}, total nodes: ${this.nodes.length}`
    );

    // İlk olarak exact match ara
    for (const node of this.nodes) {
      if (node.line === lineNumber) {
        console.log(`Found exact match: ${node.name} at line ${node.line}`);
        return node;
      }
      if (node.children) {
        for (const child of node.children) {
          if (child.line === lineNumber) {
            console.log(
              `Found exact child match: ${child.name} at line ${child.line}`
            );
            return child;
          }
        }
      }
    }

    // Exact match bulunamazsa, en yakın elementi bul
    let closest: TreeNode | undefined;
    let minDistance = Infinity;

    for (const node of this.nodes) {
      // Class node'u kontrol et
      const distance = Math.abs(node.line - lineNumber);
      if (distance < minDistance && node.line <= lineNumber) {
        minDistance = distance;
        closest = node;
      }

      // Class içindeki elementleri kontrol et
      if (node.children) {
        for (const child of node.children) {
          const childDistance = Math.abs(child.line - lineNumber);
          if (childDistance < minDistance && child.line <= lineNumber) {
            minDistance = childDistance;
            closest = child;
          }
        }
      }
    }

    if (closest) {
      console.log(
        `Found closest element: ${closest.name} at line ${closest.line} (distance: ${minDistance})`
      );
    }

    return closest;
  }

  private findClosestElement(
    elements: TreeNode[],
    lineNumber: number
  ): TreeNode | undefined {
    let closest: TreeNode | undefined;
    let minDistance = Infinity;

    for (const element of elements) {
      const distance = Math.abs(element.line - lineNumber);
      if (distance < minDistance && element.line <= lineNumber) {
        minDistance = distance;
        closest = element;
      }
    }

    return closest;
  }

  getTreeItem(element: TreeNode): vscode.TreeItem {
    const config = vscode.workspace.getConfiguration("tsOutlineEnhancer");
    const showVisibilityInLabel = config.get<boolean>(
      "showVisibilityInLabel",
      false
    );
    const showIconsInLabel = config.get<boolean>("showIconsInLabel", true);

    // İkon sembolleri oluştur
    let iconPrefix = "";
    if (showIconsInLabel) {
      iconPrefix = this.getIconPrefix(element);
    }

    let itemName = element.name;

    // Visibility label ekle
    if (showVisibilityInLabel) {
      itemName = `${itemName} [${element.visibility}]`;
    }

    // İkon prefix ekle
    if (iconPrefix) {
      itemName = `${iconPrefix} ${itemName}`;
    }

    const item = new vscode.TreeItem(itemName);

    // Unique ID ekle (tree view için önemli)
    item.id = `${element.type}-${element.name}-${element.line}`;

    // Ana ikon ayarlama (öncelikli modifier'a göre)
    item.iconPath = this.getIconForElement(element);

    // Detaylı tooltip
    item.tooltip = this.createDetailedTooltip(element);

    // Debug için console'a yazdıralım
    console.log(
      `TreeItem: ${element.name}, visibility: ${element.visibility}, type: ${
        element.type
      }, modifiers: ${element.modifiers?.join(", ")}, id: ${item.id}`
    );

    // Ağaç yapısı
    if (element.children && element.children.length > 0) {
      item.collapsibleState = vscode.TreeItemCollapsibleState.Expanded;
    } else {
      item.collapsibleState = vscode.TreeItemCollapsibleState.None;
    }

    // Tıklama komutu - özel command kullan
    item.command = {
      command: "tsOutlineEnhancer.goToLine",
      title: "Go to line",
      arguments: [element.line],
    };

    return item;
  }

  getChildren(element?: TreeNode): Thenable<TreeNode[]> {
    if (!element) {
      // Root level - return cached nodes
      return Promise.resolve(this.nodes);
    } else {
      return Promise.resolve(element.children || []);
    }
  }

  getParent(element: TreeNode): vscode.ProviderResult<TreeNode> {
    // Element'in parent'ını bul
    for (const node of this.nodes) {
      if (node.children && node.children.includes(element)) {
        return node;
      }
    }
    return null; // Root level element
  }

  private parseTypeScriptFile(): TreeNode[] {
    const editor = vscode.window.activeTextEditor;
    if (
      !editor ||
      (editor.document.languageId !== "typescript" &&
        editor.document.languageId !== "typescriptreact")
    ) {
      return [];
    }

    const document = editor.document;
    const text = document.getText();
    const lines = text.split("\n");
    const nodes: TreeNode[] = [];

    let currentClass: TreeNode | null = null;
    let braceCount = 0;
    let inClass = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("/*")) {
        continue;
      }

      // Brace sayımı
      const openBraces = (line.match(/{/g) || []).length;
      const closeBraces = (line.match(/}/g) || []).length;
      braceCount += openBraces - closeBraces;

      // Class/Interface detection
      if (this.isClassOrInterface(trimmed)) {
        const classInfo = this.parseClassOrInterface(trimmed);
        if (classInfo) {
          currentClass = {
            name: classInfo.name,
            type: classInfo.type,
            visibility: classInfo.visibility,
            modifiers: classInfo.modifiers,
            line: i,
            children: [],
          };
          nodes.push(currentClass);
          inClass = true;
          continue;
        }
      }

      // Class içindeki üyeler
      if (currentClass && inClass && braceCount > 0) {
        // Multi-line method desteği için birden fazla satırı birleştir
        let fullLine = trimmed;
        let nextLineIndex = i + 1;

        // Eğer satır açık parantez içeriyorsa ve kapalı parantez yoksa, sonraki satırları da ekle
        if (
          fullLine.includes("(") &&
          !fullLine.includes("){") &&
          !fullLine.includes("): ") &&
          !fullLine.includes(");")
        ) {
          while (nextLineIndex < lines.length) {
            const nextLine = lines[nextLineIndex].trim();
            fullLine += " " + nextLine;
            nextLineIndex++;

            // Eğer method signature tamamlandıysa dur
            if (
              nextLine.includes("){") ||
              nextLine.includes("): ") ||
              nextLine.includes(");") ||
              nextLine.includes("}): ")
            ) {
              break;
            }
          }
        }

        const member = this.parseMember(fullLine, i);
        if (member) {
          currentClass.children!.push(member);
          // Eğer multi-line parse yaptıysak, i'yi ilerlet
          if (nextLineIndex > i + 1) {
            i = nextLineIndex - 1; // for loop i++'ı halledecek
          }
          continue;
        }
      }

      // Class dışına çıktık
      if (braceCount === 0 && inClass) {
        inClass = false;
        currentClass = null;
      }

      // Top-level functions
      if (!inClass) {
        const func = this.parseTopLevelFunction(trimmed, i);
        if (func) {
          nodes.push(func);
        }
      }
    }

    return nodes;
  }

  private isClassOrInterface(line: string): boolean {
    return /^(export\s+)?(abstract\s+)?(class|interface)\s+\w+/.test(line);
  }

  private parseClassOrInterface(line: string): {
    name: string;
    type: "class" | "interface";
    visibility: "public" | "private" | "protected";
    modifiers: string[];
  } | null {
    const match = line.match(
      /^(export\s+)?(abstract\s+)?(class|interface)\s+(\w+)/
    );
    if (match) {
      const modifiers: string[] = [];
      if (match[1]) {
        // export
        modifiers.push("export");
      }
      if (match[2]) {
        // abstract
        modifiers.push("abstract");
      }

      return {
        name: match[4],
        type: match[3] as "class" | "interface",
        visibility: "public", // Classes are always public by default
        modifiers: modifiers,
      };
    }
    return null;
  }

  private parseMember(line: string, lineNumber: number): TreeNode | null {
    // Skip comments and empty lines
    if (
      !line.trim() ||
      line.trim().startsWith("//") ||
      line.trim().startsWith("/*")
    ) {
      return null;
    }

    // Skip control structures and keywords
    const skipKeywords = [
      "if",
      "else",
      "for",
      "while",
      "switch",
      "case",
      "default",
      "try",
      "catch",
      "finally",
      "return",
      "throw",
      "break",
      "continue",
      "const",
      "let",
      "var",
      "import",
      "export",
      "from",
      "where",
      "select",
      "in",
    ];
    const firstWord = line.trim().split(/\s+/)[0];
    if (skipKeywords.includes(firstWord)) {
      return null;
    }

    // Constructor - daha spesifik
    if (
      line.match(/^\s*(public\s+|private\s+|protected\s+)?constructor\s*\(/)
    ) {
      const visAndMod = this.extractVisibilityAndModifiers(line);
      return {
        name: "constructor",
        type: "constructor",
        visibility: visAndMod.visibility,
        modifiers: visAndMod.modifiers,
        line: lineNumber,
      };
    }

    // Abstract methods - daha önce kontrol et
    const abstractMatch = line.match(
      /^\s*(public\s+|private\s+|protected\s+)?abstract\s+(\w+)\s*\(/
    );
    if (abstractMatch) {
      const visAndMod = this.extractVisibilityAndModifiers(line);
      return {
        name: abstractMatch[2],
        type: "method",
        visibility: visAndMod.visibility,
        modifiers: [...visAndMod.modifiers, "abstract"],
        line: lineNumber,
      };
    }

    // Getter - daha spesifik regex
    const getterMatch = line.match(
      /^\s*(public\s+|private\s+|protected\s+|static\s+)*get\s+(\w+)\s*\(\s*\)\s*[:{\s]/
    );
    if (getterMatch) {
      const visAndMod = this.extractVisibilityAndModifiers(line);
      return {
        name: `get ${getterMatch[2]}`,
        type: "getter",
        visibility: visAndMod.visibility,
        modifiers: visAndMod.modifiers,
        line: lineNumber,
      };
    }

    // Setter - daha spesifik regex
    const setterMatch = line.match(
      /^\s*(public\s+|private\s+|protected\s+|static\s+)*set\s+(\w+)\s*\([^)]+\)\s*[:{\s]/
    );
    if (setterMatch) {
      const visAndMod = this.extractVisibilityAndModifiers(line);
      return {
        name: `set ${setterMatch[2]}`,
        type: "setter",
        visibility: visAndMod.visibility,
        modifiers: visAndMod.modifiers,
        line: lineNumber,
      };
    }

    // Methods - destructuring parameters desteği ile
    const methodPatterns = [
      // async method(): returnType {
      /^\s*(public\s+|private\s+|protected\s+|static\s+|async\s+)*(async\s+)?(\w+)\s*\([^{]*\{[^}]*\}[^)]*\)\s*:\s*[^=\{]*\s*\{/,
      // method({ ... }): returnType {
      /^\s*(public\s+|private\s+|protected\s+|static\s+|async\s+)*(async\s+)?(\w+)\s*\([^)]*\)\s*:\s*[^=\{]*\s*\{/,
      // method() {
      /^\s*(public\s+|private\s+|protected\s+|static\s+|async\s+)*(async\s+)?(\w+)\s*\([^)]*\)\s*\{/,
      // method(): returnType;
      /^\s*(public\s+|private\s+|protected\s+|static\s+|async\s+)*(async\s+)?(\w+)\s*\([^)]*\)\s*:\s*[^;]+;/,
      // method();
      /^\s*(public\s+|private\s+|protected\s+|static\s+|async\s+)*(async\s+)?(\w+)\s*\([^)]*\)\s*;/,
    ];

    for (const pattern of methodPatterns) {
      const match = line.match(pattern);
      if (match) {
        const methodName = match[3] || match[2];
        // Sadece valid identifier'lar ve destructuring parameter kontrolü
        if (
          methodName &&
          /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(methodName) &&
          !this.isDestructuringParameter(line, methodName)
        ) {
          const visAndMod = this.extractVisibilityAndModifiers(line);
          return {
            name: methodName,
            type: "method",
            visibility: visAndMod.visibility,
            modifiers: visAndMod.modifiers,
            line: lineNumber,
          };
        }
      }
    }

    // Properties - çok daha katı regex
    const propertyPatterns = [
      // public prop: Type = value;
      /^\s*(public\s+|private\s+|protected\s+|static\s+|readonly\s+)*(\w+)\s*:\s*[^=;]+\s*=\s*[^;]+;/,
      // public prop: Type;
      /^\s*(public\s+|private\s+|protected\s+|static\s+|readonly\s+)*(\w+)\s*:\s*[^;]+;/,
      // public prop = value;
      /^\s*(public\s+|private\s+|protected\s+|static\s+|readonly\s+)*(\w+)\s*=\s*[^;]+;/,
    ];

    for (const pattern of propertyPatterns) {
      const match = line.match(pattern);
      if (match) {
        const propName = match[2];
        // Sadece valid identifier'lar ve fonksiyon değil
        if (
          propName &&
          /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(propName) &&
          !line.includes("(")
        ) {
          const visAndMod = this.extractVisibilityAndModifiers(line);
          return {
            name: propName,
            type: "property",
            visibility: visAndMod.visibility,
            modifiers: visAndMod.modifiers,
            line: lineNumber,
          };
        }
      }
    }

    return null;
  }

  private parseTopLevelFunction(
    line: string,
    lineNumber: number
  ): TreeNode | null {
    // Export default async function (özel durum - önce kontrol et)
    const exportDefaultAsyncMatch = line.match(
      /^export\s+default\s+async\s+function\s+(\w+)/
    );
    if (exportDefaultAsyncMatch) {
      return {
        name: exportDefaultAsyncMatch[1],
        type: "function",
        visibility: "public",
        modifiers: ["export", "default", "async"],
        line: lineNumber,
      };
    }

    // Export default function (async olmayan)
    const exportDefaultMatch = line.match(
      /^export\s+default\s+function\s+(\w+)/
    );
    if (exportDefaultMatch) {
      return {
        name: exportDefaultMatch[1],
        type: "function",
        visibility: "public",
        modifiers: ["export", "default"],
        line: lineNumber,
      };
    }

    // Regular function declarations (export ve async kombinasyonları)
    const funcMatch = line.match(/^(export\s+)?(async\s+)?function\s+(\w+)/);
    if (funcMatch) {
      const modifiers: string[] = [];
      if (funcMatch[2]) modifiers.push("async"); // async modifier
      if (funcMatch[1]) modifiers.push("export"); // export modifier

      return {
        name: funcMatch[3],
        type: "function",
        visibility: funcMatch[1] ? "public" : "private",
        modifiers: modifiers,
        line: lineNumber,
      };
    }

    // Arrow functions - const export
    const arrowMatch = line.match(
      /^(export\s+)?const\s+(\w+)\s*=\s*(\([^)]*\)\s*=>|[^=]*=>)/
    );
    if (arrowMatch) {
      const modifiers: string[] = [];
      if (arrowMatch[1]) modifiers.push("export"); // export modifier

      return {
        name: arrowMatch[2],
        type: "function",
        visibility: arrowMatch[1] ? "public" : "private",
        modifiers: modifiers,
        line: lineNumber,
      };
    }

    // Arrow functions - export default (const ile)
    const exportDefaultArrowMatch = line.match(
      /^export\s+default\s+(\w+)\s*=\s*(\([^)]*\)\s*=>|[^=]*=>)/
    );
    if (exportDefaultArrowMatch) {
      return {
        name: exportDefaultArrowMatch[1],
        type: "function",
        visibility: "public",
        modifiers: ["export", "default"],
        line: lineNumber,
      };
    }

    return null;
  }

  private extractVisibilityAndModifiers(line: string): {
    visibility: "public" | "private" | "protected";
    modifiers: (
      | "static"
      | "readonly"
      | "abstract"
      | "async"
      | "export"
      | "default"
    )[];
  } {
    const trimmed = line.trim();
    const modifiers: (
      | "static"
      | "readonly"
      | "abstract"
      | "async"
      | "export"
      | "default"
    )[] = [];
    let visibility: "public" | "private" | "protected" = "public";

    // Visibility tespiti
    if (trimmed.includes("private ")) visibility = "private";
    else if (trimmed.includes("protected ")) visibility = "protected";
    else visibility = "public";

    // Modifier tespiti
    if (trimmed.includes("static ")) modifiers.push("static");
    if (trimmed.includes("readonly ")) modifiers.push("readonly");
    if (trimmed.includes("abstract ")) modifiers.push("abstract");
    if (trimmed.includes("async ")) modifiers.push("async");
    if (trimmed.includes("export ")) modifiers.push("export");
    if (trimmed.includes("export default ")) modifiers.push("default");

    // Debug için
    console.log(
      `Extracting from: "${line}" -> visibility: ${visibility}, modifiers: [${modifiers.join(
        ", "
      )}]`
    );
    return { visibility, modifiers };
  }

  private getIconPrefix(element: TreeNode): string {
    const config = vscode.workspace.getConfiguration("tsOutlineEnhancer");

    // Emoji ayarlarını object olarak al
    const emojiSettings = config.get("emojiSettings", {
      public: "🌐",
      private: "🔒",
      protected: "🛡️",
      static: "📌",
      readonly: "📖",
      abstract: "🎭",
      async: "⚡",
      export: "📤",
      default: "🌟",
      constructor: "🏗️",
      property: "📝",
      method: "⚙️",
      function: "🔧",
      getter: "📤",
      setter: "📥",
      class: "📦",
      interface: "📋",
    });

    let prefix = "";

    // Type-based emoji'leri ekle
    switch (element.type) {
      case "constructor":
        prefix += emojiSettings.constructor || "🏗️";
        break;
      case "property":
        prefix += emojiSettings.property || "📝";
        break;
      case "getter":
        prefix += emojiSettings.getter || "📤";
        break;
      case "setter":
        prefix += emojiSettings.setter || "📥";
        break;
      case "method":
        prefix += emojiSettings.method || "⚙️";
        break;
      case "function":
        prefix += emojiSettings.function || "🔧";
        break;
      case "class":
        prefix += emojiSettings.class || "📦";
        break;
      case "interface":
        prefix += emojiSettings.interface || "📋";
        break;
    }

    // Visibility emoji'leri
    switch (element.visibility) {
      case "private":
        prefix += emojiSettings.private || "🔒";
        break;
      case "protected":
        prefix += emojiSettings.protected || "🛡️";
        break;
      case "public":
        prefix += emojiSettings.public || "🌐";
        break;
    }

    // Modifier emoji'leri
    if (element.modifiers && element.modifiers.length > 0) {
      if (element.modifiers.includes("static")) {
        prefix += emojiSettings.static || "📌";
      }
      if (element.modifiers.includes("readonly")) {
        prefix += emojiSettings.readonly || "📖";
      }
      if (element.modifiers.includes("abstract")) {
        prefix += emojiSettings.abstract || "🎭";
      }
      if (element.modifiers.includes("async")) {
        prefix += emojiSettings.async || "⚡";
      }
      if (element.modifiers.includes("export")) {
        prefix += emojiSettings.export || "📤";
      }
      if (element.modifiers.includes("default")) {
        prefix += emojiSettings.default || "🌟";
      }
    }

    return prefix;
  }

  private isDestructuringParameter(
    line: string,
    potentialMethodName: string
  ): boolean {
    // Eğer line'da destructuring pattern varsa ve potentialMethodName bunun bir parçasıysa
    // bu bir method değil parameter'dır

    // Destructuring pattern kontrolü: { paramName, otherParam }: Type
    const destructuringPattern = /\{\s*([^}]+)\s*\}\s*:\s*/;
    const match = line.match(destructuringPattern);

    if (match) {
      const destructuredParams = match[1]
        .split(",")
        .map((param) => param.trim());
      // Her parametreyi kontrol et
      for (const param of destructuredParams) {
        const paramName = param.split(":")[0].trim(); // "paymentSystem: PaymentSystem" -> "paymentSystem"
        if (paramName === potentialMethodName) {
          return true; // Bu bir destructuring parameter
        }
      }
    }

    return false;
  }

  private createDetailedTooltip(element: TreeNode): string {
    let tooltip = `${element.type}: ${element.name}`;

    // Visibility
    tooltip += `\n• Visibility: ${element.visibility}`;

    // Modifiers
    if (element.modifiers && element.modifiers.length > 0) {
      tooltip += `\n• Modifiers: ${element.modifiers.join(", ")}`;
    }

    // Line number
    tooltip += `\n• Line: ${element.line + 1}`;

    return tooltip;
  }

  private getIconForElement(element: TreeNode): vscode.ThemeIcon | undefined {
    // Artık VS Code ikonlarına gerek yok, sadece emoji prefix kullanıyoruz
    // Bu fonksiyon artık undefined döndürebilir - VS Code default ikonları kullanacak
    return undefined;
  }
}

export function activate(context: vscode.ExtensionContext) {
  console.log("TS OUTLINER is now active!");

  const provider = new TypeScriptOutlineProvider();

  const treeView = vscode.window.createTreeView("tsOutlineEnhancer", {
    treeDataProvider: provider,
    showCollapseAll: true,
  });

  // TreeView'ı provider'a bağla
  provider.setTreeView(treeView);

  const refreshCommand = vscode.commands.registerCommand(
    "typescript-outline-enhancer.refresh",
    () => {
      provider.refresh();
      vscode.window.showInformationMessage("TS Outliner refreshed!");
    }
  );

  // Go to line command - outliner tıklaması için
  const goToLineCommand = vscode.commands.registerCommand(
    "tsOutlineEnhancer.goToLine",
    (lineNumber: number) => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        // Flag'i set et - bu bir outliner tıklaması
        provider.isOutlinerClick = true;

        // Editor'da satıra git
        const position = new vscode.Position(lineNumber, 0);
        const range = new vscode.Range(position, position);
        editor.selection = new vscode.Selection(position, position);
        editor.revealRange(range, vscode.TextEditorRevealType.InCenter);

        console.log(`Navigated to line ${lineNumber} via outliner click`);
      }
    }
  );

  // Emoji ayarları komutunu ekle
  const openEmojiSettingsCommand = vscode.commands.registerCommand(
    "tsOutlineEnhancer.openEmojiSettings",
    () => {
      // Ayarları aç - tsOutlineEnhancer.emojiSettings kısmına odakla
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

  // Auto refresh
  const onDidChangeTextDocument = vscode.workspace.onDidChangeTextDocument(
    (e) => {
      if (
        e.document === vscode.window.activeTextEditor?.document &&
        (e.document.languageId === "typescript" ||
          e.document.languageId === "typescriptreact")
      ) {
        setTimeout(() => provider.refresh(), 300);
      }
    }
  );

  const onDidChangeActiveTextEditor = vscode.window.onDidChangeActiveTextEditor(
    (editor) => {
      if (
        editor &&
        (editor.document.languageId === "typescript" ||
          editor.document.languageId === "typescriptreact")
      ) {
        provider.refresh();
      }
    }
  );

  // Cursor pozisyonu değiştiğinde auto-select (throttled)
  let selectionTimeout: NodeJS.Timeout | undefined;
  const onDidChangeTextEditorSelection =
    vscode.window.onDidChangeTextEditorSelection((e) => {
      const editor = e.textEditor;
      if (
        editor &&
        (editor.document.languageId === "typescript" ||
          editor.document.languageId === "typescriptreact")
      ) {
        const currentLine = editor.selection.active.line;
        console.log(`Cursor moved to line: ${currentLine}`);

        // Throttle: Clear previous timeout and set new one
        if (selectionTimeout) {
          clearTimeout(selectionTimeout);
        }

        selectionTimeout = setTimeout(() => {
          provider.selectCurrentElement(currentLine);
        }, 150); // 150ms delay
      }
    });

  // Ayarlar değiştiğinde yenile
  const onDidChangeConfiguration = vscode.workspace.onDidChangeConfiguration(
    (e) => {
      if (e.affectsConfiguration("tsOutlineEnhancer")) {
        provider.refresh();
        vscode.window.showInformationMessage("TS Outliner settings updated!");
      }
    }
  );

  // İlk yükleme - biraz daha gecikme ekle
  setTimeout(() => {
    provider.refresh();
    console.log("Initial refresh completed");
  }, 500);

  context.subscriptions.push(
    treeView,
    refreshCommand,
    goToLineCommand,
    openEmojiSettingsCommand,
    onDidChangeTextDocument,
    onDidChangeActiveTextEditor,
    onDidChangeTextEditorSelection,
    onDidChangeConfiguration
  );
}

export function deactivate() {}
