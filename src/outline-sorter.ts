import { TreeNode } from "./typescript-parser";

export type SortMode = "position" | "name" | "category";

/**
 * TreeNode dizilerini sıralama işlemlerini yöneten modül
 * Basit ve güvenilir yaklaşım - deep copy ile recursive sorting
 */
export class OutlineSorter {
  /**
   * Ana sıralama fonksiyonu - nodes array'ini in-place sort eder ve yeni sorted array return eder
   */
  public static sortNodes(nodes: TreeNode[], sortMode: SortMode): TreeNode[] {
    // Deep copy yaparak orijinal node'ları koruyalım
    const sortedNodes = this.deepCopyNodes(nodes);

    // Recursive sorting uygula
    this.applySortRecursive(sortedNodes, sortMode);

    return sortedNodes;
  }

  /**
   * Node'ları deep copy yapar (referans sorunlarını önler)
   */
  private static deepCopyNodes(nodes: TreeNode[]): TreeNode[] {
    return nodes.map((node) => ({
      ...node,
      children: node.children ? this.deepCopyNodes(node.children) : [],
    }));
  }

  /**
   * Recursive olarak tüm seviyedeki node'ları sıralar
   */
  private static applySortRecursive(
    nodes: TreeNode[],
    sortMode: SortMode
  ): void {
    // Mevcut seviyeyi sırala
    switch (sortMode) {
      case "name":
        this.sortByName(nodes);
        break;
      case "category":
        this.sortByCategory(nodes);
        break;
      case "position":
      default:
        this.sortByPosition(nodes);
        break;
    }

    // Her node'un children'ını da sırala
    nodes.forEach((node) => {
      if (node.children && node.children.length > 0) {
        this.applySortRecursive(node.children, sortMode);
      }
    });
  }

  /**
   * Position'a göre sıralar (dosyadaki satır numarası)
   */
  private static sortByPosition(nodes: TreeNode[]): void {
    nodes.sort((a, b) => {
      return a.line - b.line;
    });
  }

  /**
   * İsme göre alfabetik sıralar
   */
  private static sortByName(nodes: TreeNode[]): void {
    nodes.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });
  }

  /**
   * Kategoriye göre sıralar (type ve sonra name)
   */
  private static sortByCategory(nodes: TreeNode[]): void {
    const categoryOrder = this.getCategoryOrder();

    nodes.sort((a, b) => {
      const aCategory = categoryOrder[a.type] ?? 999;
      const bCategory = categoryOrder[b.type] ?? 999;

      // Önce category
      if (aCategory !== bCategory) {
        return aCategory - bCategory;
      }

      // Aynı category ise name'e göre
      return a.name.localeCompare(b.name);
    });
  }

  /**
   * Kategori sıralama öncelikleri
   */
  private static getCategoryOrder(): Record<string, number> {
    return {
      class: 0,
      interface: 1,
      constructor: 2,
      property: 3,
      getter: 4,
      setter: 5,
      method: 6,
      function: 7,
    };
  }
}
