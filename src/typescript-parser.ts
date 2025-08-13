import * as vscode from "vscode";

export interface TreeNode {
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

export class TypeScriptParser {
  /**
   * Ana parsing metodu - aktif TypeScript dosyasını parse eder
   */
  public async parseActiveFile(): Promise<TreeNode[]> {
    const editor = vscode.window.activeTextEditor;
    if (
      !editor ||
      (editor.document.languageId !== "typescript" &&
        editor.document.languageId !== "typescriptreact")
    ) {
      return [];
    }

    try {
      // LSP üzerinden document symbols al
      const symbols = (await vscode.commands.executeCommand<
        vscode.DocumentSymbol[]
      >("vscode.executeDocumentSymbolProvider", editor.document.uri)) as
        | vscode.DocumentSymbol[]
        | undefined;

      if (!symbols || symbols.length === 0) {
        return this.fallbackTextParsing();
      }

      const nodes = await this.convertSymbolsToNodes(symbols);
      return nodes.filter((node): node is TreeNode => node !== null);
    } catch (error) {
      console.error("Error getting symbols from LSP:", error);
      return this.fallbackTextParsing();
    }
  }

  /**
   * VS Code Document Symbol'ları TreeNode'lara dönüştürür
   */
  private async convertSymbolsToNodes(
    symbols: vscode.DocumentSymbol[]
  ): Promise<TreeNode[]> {
    const nodes = await Promise.all(
      symbols.map((symbol) => this.convertSymbolToNode(symbol))
    );
    return nodes.filter((node): node is TreeNode => node !== null);
  }

  /**
   * Tek bir VS Code Document Symbol'ı TreeNode'a dönüştürür
   */
  private async convertSymbolToNode(
    symbol: vscode.DocumentSymbol
  ): Promise<TreeNode | null> {
    const line = symbol.range.start.line;
    const symbolName = symbol.name;

    let nodeType = this.mapSymbolKindToNodeType(symbol.kind);
    if (!nodeType) {
      return null;
    }

    if (nodeType === "method") {
      const detectedType = await this.detectGetterSetterType(symbol);
      nodeType = detectedType;
    }

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

    return node;
  }

  /**
   * VS Code SymbolKind'ı TreeNode type'ına maplar
   */
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
      default:
        return null;
    }
  }

  /**
   * Method'un getter/setter olup olmadığını algılar
   */
  private async detectGetterSetterType(
    symbol: vscode.DocumentSymbol
  ): Promise<TreeNode["type"]> {
    const detail = symbol.detail || "";
    const name = symbol.name || "";

    if (detail.includes("(get)") || detail.includes("getter")) {
      return "getter";
    }
    if (detail.includes("(set)") || detail.includes("setter")) {
      return "setter";
    }

    if (name.startsWith("get ") || name.startsWith("get_")) {
      return "getter";
    }
    if (name.startsWith("set ") || name.startsWith("set_")) {
      return "setter";
    }

    const editor = vscode.window.activeTextEditor;
    if (editor) {
      try {
        const line = editor.document.lineAt(symbol.range.start.line);
        const lineText = line.text.trim();

        if (
          lineText.match(
            /^\s*(public\s+|private\s+|protected\s+|static\s+)*get\s+\w+/
          )
        ) {
          return "getter";
        }

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

  /**
   * Symbol'dan visibility ve modifier bilgilerini çıkarır
   */
  private async extractVisibilityFromSymbol(
    symbol: vscode.DocumentSymbol
  ): Promise<{
    visibility: "public" | "private" | "protected";
    modifiers: string[];
  }> {
    const detail = symbol.detail || "";
    let visibility: "public" | "private" | "protected" = "public";
    const modifiers: string[] = [];

    if (detail.includes("private")) {
      visibility = "private";
    } else if (detail.includes("protected")) {
      visibility = "protected";
    } else if (detail.includes("public")) {
      visibility = "public";
    } else {
      const sourceVisibility = await this.getVisibilityFromSource(symbol);
      if (sourceVisibility.visibility) {
        visibility = sourceVisibility.visibility;
      }
      modifiers.push(...sourceVisibility.modifiers);
    }

    if (detail.includes("static")) modifiers.push("static");
    if (detail.includes("readonly")) modifiers.push("readonly");
    if (detail.includes("abstract")) modifiers.push("abstract");
    if (detail.includes("async")) modifiers.push("async");

    if (detail.includes("export") || this.isTopLevelExport(symbol)) {
      modifiers.push("export");
    }

    if (symbol.kind === vscode.SymbolKind.Constructor) {
      if (detail.includes("private constructor")) {
        visibility = "private";
      } else if (detail.includes("protected constructor")) {
        visibility = "protected";
      }
    }

    return { visibility, modifiers };
  }

  /**
   * Kaynak koddan visibility bilgisi alır
   */
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
      const line = editor.document.lineAt(symbol.range.start.line);
      const lineText = line.text.trim();

      let visibility: "public" | "private" | "protected" | undefined;
      const modifiers: string[] = [];

      if (lineText.includes("private ")) visibility = "private";
      else if (lineText.includes("protected ")) visibility = "protected";
      else if (lineText.includes("public ")) visibility = "public";

      if (lineText.includes("static ")) modifiers.push("static");
      if (lineText.includes("readonly ")) modifiers.push("readonly");
      if (lineText.includes("abstract ")) modifiers.push("abstract");
      if (lineText.includes("async ")) modifiers.push("async");
      if (lineText.includes("export ")) modifiers.push("export");
      if (lineText.includes("export default ")) modifiers.push("default");

      return { visibility, modifiers };
    } catch (error) {
      console.error("Error reading source for visibility:", error);
      return { modifiers: [] };
    }
  }

  /**
   * Top-level export mu kontrol eder
   */
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

  /**
   * LSP başarısız olursa fallback text parsing kullanır
   */
  private fallbackTextParsing(): TreeNode[] {
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

      // Brace counting
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

      // Class members
      if (currentClass && inClass && braceCount > 0) {
        const member = this.parseMember(trimmed, i);
        if (member) {
          currentClass.children!.push(member);
          continue;
        }
      }

      // Out of class
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
      if (match[1]) modifiers.push("export");
      if (match[2]) modifiers.push("abstract");

      return {
        name: match[4],
        type: match[3] as "class" | "interface",
        visibility: "public",
        modifiers: modifiers,
      };
    }
    return null;
  }

  private parseMember(line: string, lineNumber: number): TreeNode | null {
    if (
      !line.trim() ||
      line.trim().startsWith("//") ||
      line.trim().startsWith("/*")
    ) {
      return null;
    }

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
    ];
    const firstWord = line.trim().split(/\s+/)[0];
    if (skipKeywords.includes(firstWord)) {
      return null;
    }

    // Constructor
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

    // Getter
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

    // Setter
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

    // Methods
    const methodPatterns = [
      /^\s*(public\s+|private\s+|protected\s+|static\s+|async\s+)*(async\s+)?(\w+)\s*\([^)]*\)\s*:\s*[^=\{]*\s*\{/,
      /^\s*(public\s+|private\s+|protected\s+|static\s+|async\s+)*(async\s+)?(\w+)\s*\([^)]*\)\s*\{/,
      /^\s*(public\s+|private\s+|protected\s+|static\s+|async\s+)*(async\s+)?(\w+)\s*\([^)]*\)\s*:\s*[^;]+;/,
    ];

    for (const pattern of methodPatterns) {
      const match = line.match(pattern);
      if (match) {
        const methodName = match[3] || match[2];
        if (methodName && /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(methodName)) {
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

    // Properties
    const propertyPatterns = [
      /^\s*(public\s+|private\s+|protected\s+|static\s+|readonly\s+)*(\w+)\s*:\s*[^=;]+\s*=\s*[^;]+;/,
      /^\s*(public\s+|private\s+|protected\s+|static\s+|readonly\s+)*(\w+)\s*:\s*[^;]+;/,
      /^\s*(public\s+|private\s+|protected\s+|static\s+|readonly\s+)*(\w+)\s*=\s*[^;]+;/,
    ];

    for (const pattern of propertyPatterns) {
      const match = line.match(pattern);
      if (match) {
        const propName = match[2];
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
    // Export default async function
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

    // Export default function
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

    // Regular function declarations
    const funcMatch = line.match(/^(export\s+)?(async\s+)?function\s+(\w+)/);
    if (funcMatch) {
      const modifiers: string[] = [];
      if (funcMatch[2]) modifiers.push("async");
      if (funcMatch[1]) modifiers.push("export");

      return {
        name: funcMatch[3],
        type: "function",
        visibility: funcMatch[1] ? "public" : "private",
        modifiers: modifiers,
        line: lineNumber,
      };
    }

    // Arrow functions
    const arrowMatch = line.match(
      /^(export\s+)?const\s+(\w+)\s*=\s*(\([^)]*\)\s*=>|[^=]*=>)/
    );
    if (arrowMatch) {
      const modifiers: string[] = [];
      if (arrowMatch[1]) modifiers.push("export");

      return {
        name: arrowMatch[2],
        type: "function",
        visibility: arrowMatch[1] ? "public" : "private",
        modifiers: modifiers,
        line: lineNumber,
      };
    }

    return null;
  }

  private extractVisibilityAndModifiers(line: string): {
    visibility: "public" | "private" | "protected";
    modifiers: string[];
  } {
    const trimmed = line.trim();
    const modifiers: string[] = [];
    let visibility: "public" | "private" | "protected" = "public";

    if (trimmed.includes("private ")) visibility = "private";
    else if (trimmed.includes("protected ")) visibility = "protected";
    else visibility = "public";

    if (trimmed.includes("static ")) modifiers.push("static");
    if (trimmed.includes("readonly ")) modifiers.push("readonly");
    if (trimmed.includes("abstract ")) modifiers.push("abstract");
    if (trimmed.includes("async ")) modifiers.push("async");
    if (trimmed.includes("export ")) modifiers.push("export");
    if (trimmed.includes("export default ")) modifiers.push("default");

    return { visibility, modifiers };
  }
}
