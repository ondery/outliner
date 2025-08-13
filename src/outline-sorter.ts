import { TreeNode } from "./typescript-parser";

export type SortMode = "position" | "name" | "category";

/**
 * TreeNode dizilerini sıralama işlemlerini yöneten modül
 */
export class OutlineSorter {
  /**
   * Ana sıralama fonksiyonu - verilen mode'a göre node'ları sıralar
   */
  public static sortNodes(nodes: TreeNode[], sortMode: SortMode): void {
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
  }

  /**
   * Node'ları dosyadaki pozisyonlarına göre sıralar (line number)
   */
  private static sortByPosition(nodes: TreeNode[]): void {
    nodes.sort((a, b) => a.line - b.line);

    // Alt node'ları da aynı şekilde sırala
    nodes.forEach((node) => {
      if (node.children && node.children.length > 0) {
        this.sortByPosition(node.children);
      }
    });
  }

  /**
   * Node'ları alfabetik olarak isimlerine göre sıralar
   */
  private static sortByName(nodes: TreeNode[]): void {
    nodes.sort((a, b) => a.name.localeCompare(b.name));

    // Alt node'ları da aynı şekilde sırala
    nodes.forEach((node) => {
      if (node.children && node.children.length > 0) {
        this.sortByName(node.children);
      }
    });
  }

  /**
   * Node'ları kategorilerine göre sıralar (type bazında)
   * İlk önce kategoriye göre, aynı kategoridekiler alfabetik
   */
  private static sortByCategory(nodes: TreeNode[]): void {
    const categoryOrder = this.getCategoryOrder();

    nodes.sort((a, b) => {
      const aCategory = categoryOrder[a.type] ?? 999;
      const bCategory = categoryOrder[b.type] ?? 999;

      // Önce kategoriye göre sırala
      if (aCategory !== bCategory) {
        return aCategory - bCategory;
      }

      // Aynı kategoridekiler alfabetik
      return a.name.localeCompare(b.name);
    });

    // Alt node'ları da aynı şekilde sırala
    nodes.forEach((node) => {
      if (node.children && node.children.length > 0) {
        this.sortByCategory(node.children);
      }
    });
  }

  /**
   * Kategori sıralama önceliklerini döndürür
   * Düşük sayı = üstte görünür
   */
  private static getCategoryOrder(): Record<TreeNode["type"], number> {
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

  /**
   * Visibility'e göre sıralama (isteğe bağlı, şu an kullanılmıyor)
   */
  private static getVisibilityOrder(): Record<TreeNode["visibility"], number> {
    return {
      public: 0,
      protected: 1,
      private: 2,
    };
  }

  /**
   * Karma sıralama - önce visibility, sonra category, sonra name
   * Bu fonksiyon gelecekte kullanılabilir
   */
  private static sortByVisibilityAndCategory(nodes: TreeNode[]): void {
    const categoryOrder = this.getCategoryOrder();
    const visibilityOrder = this.getVisibilityOrder();

    nodes.sort((a, b) => {
      // Önce visibility'e göre
      const aVis = visibilityOrder[a.visibility];
      const bVis = visibilityOrder[b.visibility];
      if (aVis !== bVis) {
        return aVis - bVis;
      }

      // Sonra kategoriye göre
      const aCategory = categoryOrder[a.type] ?? 999;
      const bCategory = categoryOrder[b.type] ?? 999;
      if (aCategory !== bCategory) {
        return aCategory - bCategory;
      }

      // Son olarak isme göre
      return a.name.localeCompare(b.name);
    });

    // Alt node'ları da aynı şekilde sırala
    nodes.forEach((node) => {
      if (node.children && node.children.length > 0) {
        this.sortByVisibilityAndCategory(node.children);
      }
    });
  }

  /**
   * Modifier'lara göre sıralama yapabilecek utility fonksiyon
   */
  private static hasModifier(node: TreeNode, modifier: string): boolean {
    return node.modifiers.includes(modifier);
  }

  /**
   * Node'ları static/non-static olarak ayıran utility fonksiyon
   */
  private static separateStaticMembers(nodes: TreeNode[]): {
    staticMembers: TreeNode[];
    instanceMembers: TreeNode[];
  } {
    const staticMembers: TreeNode[] = [];
    const instanceMembers: TreeNode[] = [];

    nodes.forEach((node) => {
      if (this.hasModifier(node, "static")) {
        staticMembers.push(node);
      } else {
        instanceMembers.push(node);
      }
    });

    return { staticMembers, instanceMembers };
  }

  /**
   * Gelişmiş sıralama - static members önce, sonra instance members
   * Bu fonksiyon gelecekte feature olarak eklenebilir
   */
  public static sortAdvanced(nodes: TreeNode[], sortMode: SortMode): void {
    nodes.forEach((node) => {
      if (node.children && node.children.length > 0) {
        const { staticMembers, instanceMembers } = this.separateStaticMembers(
          node.children
        );

        // Her grubu kendi içinde sırala
        this.sortNodes(staticMembers, sortMode);
        this.sortNodes(instanceMembers, sortMode);

        // Önce static, sonra instance members
        node.children = [...staticMembers, ...instanceMembers];
      }
    });

    // Top-level node'ları da sırala
    this.sortNodes(nodes, sortMode);
  }
}
