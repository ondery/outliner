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
  private sortMode: 'position' | 'name' | 'category' = 'position'; // Varsayılan sıralama

  setTreeView(treeView: vscode.TreeView<TreeNode>) {
    this.treeView = treeView;
    
    // Ayarlardan sıralama modunu oku
    const config = vscode.workspace.getConfiguration("tsOutlineEnhancer");
    this.sortMode = config.get<'position' | 'name' | 'category'>('sortMode', 'position');
    
    // Context'i güncelle
    this.updateSortModeContext();
  }

  async refresh(): Promise<void> {
    this.nodes = await this.parseTypeScriptFile();
    this.applySorting();
    console.log(`Refreshed outline: Found ${this.nodes.length} nodes`);
    this._onDidChangeTreeData.fire();
  }

  // Sıralama metodları
  setSortMode(mode: 'position' | 'name' | 'category'): void {
    this.sortMode = mode;
    this.applySorting();
    this.updateSortModeContext();
    this._onDidChangeTreeData.fire();
  }

  getSortMode(): 'position' | 'name' | 'category' {
    return this.sortMode;
  }

  private updateSortModeContext(): void {
    // VS Code context'ini güncelle
    vscode.commands.executeCommand('setContext', 'tsOutlineEnhancer.sortMode', this.sortMode);
    vscode.commands.executeCommand('setContext', 'tsOutlineEnhancer.sortMode.position', this.sortMode === 'position');
    vscode.commands.executeCommand('setContext', 'tsOutlineEnhancer.sortMode.name', this.sortMode === 'name');
    vscode.commands.executeCommand('setContext', 'tsOutlineEnhancer.sortMode.category', this.sortMode === 'category');
  }

  private applySorting(): void {
    switch (this.sortMode) {
      case 'name':
        this.sortByName(this.nodes);
        break;
      case 'category':
        this.sortByCategory(this.nodes);
        break;
      case 'position':
      default:
        this.sortByPosition(this.nodes);
        break;
    }
  }

  private sortByPosition(nodes: TreeNode[]): void {
    nodes.sort((a, b) => a.line - b.line);
    nodes.forEach(node => {
      if (node.children) {
        this.sortByPosition(node.children);
      }
    });
  }

  private sortByName(nodes: TreeNode[]): void {
    nodes.sort((a, b) => a.name.localeCompare(b.name));
    nodes.forEach(node => {
      if (node.children) {
        this.sortByName(node.children);
      }
    });
  }

  private sortByCategory(nodes: TreeNode[]): void {
    const categoryOrder = {
      'class': 0,
      'interface': 1,
      'constructor': 2,
      'property': 3,
      'getter': 4,
      'setter': 5,
      'method': 6,
      'function': 7
    };

    nodes.sort((a, b) => {
      const aCategory = categoryOrder[a.type] ?? 999;
      const bCategory = categoryOrder[b.type] ?? 999;
      
      if (aCategory === bCategory) {
        return a.name.localeCompare(b.name);
      }
      return aCategory - bCategory;
    });

    nodes.forEach(node => {
      if (node.children) {
        this.sortByCategory(node.children);
      }
    });
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

  private async parseTypeScriptFile(): Promise<TreeNode[]> {
    const editor = vscode.window.activeTextEditor;
    if (
      !editor ||
      (editor.document.languageId !== "typescript" &&
        editor.document.languageId !== "typescriptreact")
    ) {
      return [];
    }

    try {
      console.log("Attempting to get symbols via LSP...");

      // LSP üzerinden document symbols al
      const symbols = (await vscode.commands.executeCommand<
        vscode.DocumentSymbol[]
      >("vscode.executeDocumentSymbolProvider", editor.document.uri)) as
        | vscode.DocumentSymbol[]
        | undefined;

      if (!symbols || symbols.length === 0) {
        console.log("No symbols found from LSP, falling back to text parsing");
        return this.fallbackTextParsing();
      }

      console.log(`Found ${symbols.length} symbols from LSP:`);
      symbols.forEach((symbol, index) => {
        console.log(
          `  ${index + 1}. ${symbol.name} (${
            vscode.SymbolKind[symbol.kind]
          }) at line ${symbol.range.start.line}`
        );
        if (symbol.children && symbol.children.length > 0) {
          symbol.children.forEach((child, childIndex) => {
            console.log(
              `    ${index + 1}.${childIndex + 1}. ${child.name} (${
                vscode.SymbolKind[child.kind]
              }) at line ${child.range.start.line}`
            );
          });
        }
      });

      const nodes = await this.convertSymbolsToNodes(symbols);
      console.log(
        `Successfully converted ${nodes.length} LSP symbols to TreeNodes`
      );
      return nodes;
    } catch (error) {
      console.error("Error getting symbols from LSP:", error);
      console.log("Falling back to text parsing due to error");
      return this.fallbackTextParsing();
    }
  }

  private async convertSymbolsToNodes(
    symbols: vscode.DocumentSymbol[]
  ): Promise<TreeNode[]> {
    const nodes = await Promise.all(
      symbols.map((symbol) => this.convertSymbolToNode(symbol))
    );
    return nodes.filter((node): node is TreeNode => node !== null);
  }

  private async convertSymbolToNode(
    symbol: vscode.DocumentSymbol
  ): Promise<TreeNode | null> {
    const line = symbol.range.start.line;
    const symbolName = symbol.name;

    // Symbol tipini TreeNode tipine çevir
    let nodeType = this.mapSymbolKindToNodeType(symbol.kind);
    if (!nodeType) {
      return null; // Desteklenmeyen symbol tipi
    }

    // Eğer method ise, getter/setter olup olmadığını kontrol et
    if (nodeType === "method") {
      const detectedType = await this.detectGetterSetterType(symbol);
      nodeType = detectedType;
    }

    // Modifiers ve visibility'yi symbol detail'den çıkar
    const { visibility, modifiers } = await this.extractVisibilityFromSymbol(
      symbol
    );

    const node: TreeNode = {
      name: symbolName,
      type: nodeType,
      visibility,
      modifiers,
      line,
      children: symbol.children
        ? await this.convertSymbolsToNodes(symbol.children)
        : undefined,
    };

    console.log(
      `Converted symbol: ${symbolName} (${symbol.kind}) -> ${nodeType} [${visibility}] at line ${line}`
    );
    return node;
  }

  private mapSymbolKindToNodeType(
    kind: vscode.SymbolKind
  ): TreeNode["type"] | null {
    switch (kind) {
      case vscode.SymbolKind.Class:
        return "class";
      case vscode.SymbolKind.Interface:
        return "interface";
      case vscode.SymbolKind.Method:
        return "method";
      case vscode.SymbolKind.Property:
        return "property";
      case vscode.SymbolKind.Function:
        return "function";
      case vscode.SymbolKind.Constructor:
        return "constructor";
      // TypeScript-specific getter/setter detection
      // VS Code LSP bunları genellikle Method olarak raporlar,
      // isimden getter/setter olup olmadığını anlamamız gerekir
      default:
        return null;
    }
  }

  // Getter/Setter detection for methods
  private async detectGetterSetterType(
    symbol: vscode.DocumentSymbol
  ): Promise<TreeNode["type"]> {
    const detail = symbol.detail || "";
    const name = symbol.name || "";

    // LSP detail'dan getter/setter tespiti
    if (detail.includes("(get)") || detail.includes("getter")) {
      return "getter";
    }
    if (detail.includes("(set)") || detail.includes("setter")) {
      return "setter";
    }

    // Name pattern'dan tespiti
    if (name.startsWith("get ") || name.startsWith("get_")) {
      return "getter";
    }
    if (name.startsWith("set ") || name.startsWith("set_")) {
      return "setter";
    }

    // Kaynak koddan kontrol et
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      try {
        const line = editor.document.lineAt(symbol.range.start.line);
        const lineText = line.text.trim();

        // get keyword detection
        if (
          lineText.match(
            /^\s*(public\s+|private\s+|protected\s+|static\s+)*get\s+\w+/
          )
        ) {
          return "getter";
        }

        // set keyword detection
        if (
          lineText.match(
            /^\s*(public\s+|private\s+|protected\s+|static\s+)*set\s+\w+/
          )
        ) {
          return "setter";
        }
      } catch (error) {
        console.error("Error detecting getter/setter from source:", error);
      }
    }

    return "method";
  }

  private async extractVisibilityFromSymbol(
    symbol: vscode.DocumentSymbol
  ): Promise<{
    visibility: "public" | "private" | "protected";
    modifiers: string[];
  }> {
    const detail = symbol.detail || "";
    const name = symbol.name || "";

    let visibility: "public" | "private" | "protected" = "public";
    const modifiers: string[] = [];

    // İlk olarak detail'dan kontrol et
    if (detail.includes("private")) {
      visibility = "private";
    } else if (detail.includes("protected")) {
      visibility = "protected";
    } else if (detail.includes("public")) {
      visibility = "public";
    } else {
      // LSP detail'da visibility bilgisi yoksa, kaynak koddan oku
      const sourceVisibility = await this.getVisibilityFromSource(symbol);
      if (sourceVisibility.visibility) {
        visibility = sourceVisibility.visibility;
      }

      // Source'dan elde edilen modifiers'ları ekle
      modifiers.push(...sourceVisibility.modifiers);
    }

    // Modifiers detection from detail
    if (detail.includes("static")) {
      modifiers.push("static");
    }
    if (detail.includes("readonly")) {
      modifiers.push("readonly");
    }
    if (detail.includes("abstract")) {
      modifiers.push("abstract");
    }
    if (detail.includes("async")) {
      modifiers.push("async");
    }

    // Export detection - top-level symbols için
    if (detail.includes("export") || this.isTopLevelExport(symbol)) {
      modifiers.push("export");
    }

    // Constructor özel durumu
    if (symbol.kind === vscode.SymbolKind.Constructor) {
      if (detail.includes("private constructor")) {
        visibility = "private";
      } else if (detail.includes("protected constructor")) {
        visibility = "protected";
      }
    }

    return { visibility, modifiers };
  }

  private async getVisibilityFromSource(
    symbol: vscode.DocumentSymbol
  ): Promise<{
    visibility?: "public" | "private" | "protected";
    modifiers: string[];
  }> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return { modifiers: [] };
    }

    try {
      // Symbol'ün bulunduğu satırı al
      const line = editor.document.lineAt(symbol.range.start.line);
      const lineText = line.text.trim();

      console.log(`Analyzing source line: ${lineText}`);

      let visibility: "public" | "private" | "protected" | undefined;
      const modifiers: string[] = [];

      // Visibility detection
      if (lineText.includes("private ")) {
        visibility = "private";
      } else if (lineText.includes("protected ")) {
        visibility = "protected";
      } else if (lineText.includes("public ")) {
        visibility = "public";
      }

      // Modifier detection
      if (lineText.includes("static ")) {
        modifiers.push("static");
      }
      if (lineText.includes("readonly ")) {
        modifiers.push("readonly");
      }
      if (lineText.includes("abstract ")) {
        modifiers.push("abstract");
      }
      if (lineText.includes("async ")) {
        modifiers.push("async");
      }
      if (lineText.includes("export ")) {
        modifiers.push("export");
      }
      if (lineText.includes("export default ")) {
        modifiers.push("default");
      }

      return { visibility, modifiers };
    } catch (error) {
      console.error("Error reading source for visibility:", error);
      return { modifiers: [] };
    }
  }

  private isTopLevelExport(symbol: vscode.DocumentSymbol): boolean {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return false;
    }

    try {
      const line = editor.document.lineAt(symbol.range.start.line);
      return line.text.trim().startsWith("export");
    } catch {
      return false;
    }
  }

  private fallbackTextParsing(): TreeNode[] {
    // Eski regex tabanlı parsing'i fallback olarak kullan
    console.log("Using fallback text parsing");

    const editor = vscode.window.activeTextEditor;
    if (!editor) {
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
        const member = this.parseMember(trimmed, i);
        if (member) {
          currentClass.children!.push(member);
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
    async () => {
      await provider.refresh();
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

  // MenuItemCheckbox API ile native checkbox behavior
  const menuContributor = vscode.window.registerTreeDataProvider('menu', {
    getChildren: () => [],
    getTreeItem: () => new vscode.TreeItem('dummy')
  });

  // Menu contributions'u dinamik olarak yönet
  function refreshMenus() {
    const currentSort = provider.getSortMode();
    
    // Context'leri güncelle - bu VS Code'un native menu system'i ile çalışır
    vscode.commands.executeCommand('setContext', 'tsOutlineEnhancer.sortMode.position', currentSort === 'position');
    vscode.commands.executeCommand('setContext', 'tsOutlineEnhancer.sortMode.name', currentSort === 'name');
    vscode.commands.executeCommand('setContext', 'tsOutlineEnhancer.sortMode.category', currentSort === 'category');
    
    // Menu'yu refresh et
    vscode.commands.executeCommand('setContext', 'tsOutlineEnhancer.menuRefresh', Date.now());
  }

  // Sıralama komutları - native checkbox effect ile
  const sortByPositionCommand = vscode.commands.registerCommand(
    "tsOutlineEnhancer.sortByPosition",
    () => {
      provider.setSortMode('position');
      refreshMenus();
      vscode.window.showInformationMessage("Sorted by position");
    }
  );

  const sortByNameCommand = vscode.commands.registerCommand(
    "tsOutlineEnhancer.sortByName",
    () => {
      provider.setSortMode('name');
      refreshMenus();
      vscode.window.showInformationMessage("Sorted by name");
    }
  );

  const sortByCategoryCommand = vscode.commands.registerCommand(
    "tsOutlineEnhancer.sortByCategory",
    () => {
      provider.setSortMode('category');
      refreshMenus();
      vscode.window.showInformationMessage("Sorted by category");
    }
  );

  // Checked state command'lar - aynı işlevi yapar ama $(check) icon ile
  const sortByPositionCheckedCommand = vscode.commands.registerCommand(
    "tsOutlineEnhancer.sortByPositionChecked",
    () => {
      provider.setSortMode('position');
      refreshMenus();
      vscode.window.showInformationMessage("Sorted by position");
    }
  );

  const sortByNameCheckedCommand = vscode.commands.registerCommand(
    "tsOutlineEnhancer.sortByNameChecked",
    () => {
      provider.setSortMode('name');
      refreshMenus();
      vscode.window.showInformationMessage("Sorted by name");
    }
  );

  const sortByCategoryCheckedCommand = vscode.commands.registerCommand(
    "tsOutlineEnhancer.sortByCategoryChecked",
    () => {
      provider.setSortMode('category');
      refreshMenus();
      vscode.window.showInformationMessage("Sorted by category");
    }
  );

  // MenuItemCheckbox için state döndüren command'lar
  vscode.commands.registerCommand('tsOutlineEnhancer.sortByPosition.isChecked', () => {
    return provider.getSortMode() === 'position';
  });

  vscode.commands.registerCommand('tsOutlineEnhancer.sortByName.isChecked', () => {
    return provider.getSortMode() === 'name';
  });

  vscode.commands.registerCommand('tsOutlineEnhancer.sortByCategory.isChecked', () => {
    return provider.getSortMode() === 'category';
  });

  // İlk yüklemede default context'i set et
  refreshMenus();

  // Menu item'ları checkbox olarak register et
  vscode.commands.registerCommand('tsOutlineEnhancer.getSortByPositionState', () => {
    return provider.getSortMode() === 'position';
  });

  vscode.commands.registerCommand('tsOutlineEnhancer.getSortByNameState', () => {
    return provider.getSortMode() === 'name';
  });

  vscode.commands.registerCommand('tsOutlineEnhancer.getSortByCategoryState', () => {
    return provider.getSortMode() === 'category';
  });

  // Auto refresh
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
        // Sıralama modu değiştiğinde güncelle
        if (e.affectsConfiguration("tsOutlineEnhancer.sortMode")) {
          const config = vscode.workspace.getConfiguration("tsOutlineEnhancer");
          const newSortMode = config.get<'position' | 'name' | 'category'>('sortMode', 'position');
          provider.setSortMode(newSortMode);
        } else {
          provider.refresh().catch(console.error);
        }
        
        vscode.window.showInformationMessage("TS Outliner settings updated!");
      }
    }
  );

  // İlk yükleme - biraz daha gecikme ekle
  setTimeout(async () => {
    await provider.refresh().catch(console.error);
    console.log("Initial refresh completed");
  }, 500);

  context.subscriptions.push(
    treeView,
    menuContributor,
    refreshCommand,
    goToLineCommand,
    openEmojiSettingsCommand,
    sortByPositionCommand,
    sortByNameCommand,
    sortByCategoryCommand,
    sortByPositionCheckedCommand,
    sortByNameCheckedCommand,
    sortByCategoryCheckedCommand,
    onDidChangeTextDocument,
    onDidChangeActiveTextEditor,
    onDidChangeTextEditorSelection,
    onDidChangeConfiguration
  );
}

export function deactivate() {}
