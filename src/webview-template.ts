import * as vscode from "vscode";

/**
 * WebView HTML şablonlarını ve styling'ini yöneten modül
 */
export class WebViewTemplateManager {
  /**
   * Ana HTML içeriğini oluşturur
   */
  public generateHTML(webview: vscode.Webview): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TS Outliner</title>
    <style>
        ${this.getStyles()}
    </style>
</head>
<body>
    <div class="sidebar">
        ${this.getToolbarHTML()}
        ${this.getContentHTML()}
    </div>
    
    <script>
        ${this.getJavaScript()}
    </script>
</body>
</html>`;
  }

  /**
   * CSS stilleri
   */
  private getStyles(): string {
    return `
        /* Reset and Variables */
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        
        :root {
            --spacing-xs: 0.25rem;
            --spacing-sm: 0.5rem;
            --spacing-md: 0.75rem;
            --spacing-lg: 1rem;
            --border-radius: 0.25rem;
            --transition: all 0.15s ease-in-out;
        }
        
        body {
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            color: var(--vscode-foreground);
            background-color: var(--vscode-sideBar-background);
            height: 100vh;
            overflow: hidden;
        }

        /* Layout Components */
        .sidebar {
            display: flex;
            flex-direction: column;
            height: 100vh;
            width: 100%;
        }

        .toolbar {
            padding: var(--spacing-sm);
            border-bottom: 1px solid var(--vscode-panel-border);
            background-color: var(--vscode-sideBar-background);
            display: flex;
            gap: var(--spacing-xs);
            flex-wrap: wrap;
        }

        .content {
            flex: 1;
            overflow-y: auto;
            padding: var(--spacing-xs);
        }

        .outline-section {
            margin-bottom: var(--spacing-md);
        }

        .section-header {
            font-size: 0.7rem;
            font-weight: 600;
            color: var(--vscode-descriptionForeground);
            text-transform: uppercase;
            letter-spacing: 0.025em;
            padding: var(--spacing-xs) var(--spacing-sm);
            margin-bottom: var(--spacing-xs);
            border-bottom: 1px solid var(--vscode-panel-border);
        }

        /* Button Components */
        .btn {
            padding: var(--spacing-xs) var(--spacing-sm);
            border: 1px solid var(--vscode-button-border);
            border-radius: var(--border-radius);
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            cursor: pointer;
            font-size: 0.7rem;
            display: flex;
            align-items: center;
            gap: var(--spacing-xs);
            transition: var(--transition);
            white-space: nowrap;
        }

        .btn:hover {
            background: var(--vscode-button-hoverBackground);
        }

        .btn.active {
            background: var(--vscode-button-hoverBackground);
            border-color: var(--vscode-focusBorder);
        }

        /* Node Components */
        .node {
            display: block;
            margin-bottom: 1px;
        }

        .node-content {
            display: flex;
            align-items: center;
            padding: var(--spacing-xs) var(--spacing-sm);
            border-radius: var(--border-radius);
            cursor: pointer;
            transition: var(--transition);
            min-height: 1.5rem;
            gap: var(--spacing-xs);
            user-select: none;
        }

        .node-content:hover {
            background-color: var(--vscode-list-hoverBackground);
        }

        .node-content.selected {
            background-color: var(--vscode-list-activeSelectionBackground);
            color: var(--vscode-list-activeSelectionForeground);
        }

        .node-children {
            margin-left: var(--spacing-lg);
            border-left: 1px solid var(--vscode-tree-indentGuidesStroke);
            padding-left: var(--spacing-sm);
            overflow: hidden;
            transition: var(--transition);
        }

        .node-children.collapsed {
            display: none;
        }

        /* Icon Components */
        .chevron {
            width: 0.75rem;
            height: 0.75rem;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: transform 0.2s ease-in-out;
            font-size: 0.6rem;
        }

        .chevron.expanded {
            transform: rotate(90deg);
        }

        .chevron:hover {
            background-color: var(--vscode-toolbar-hoverBackground);
            border-radius: var(--border-radius);
        }

        .type-icon {
            font-size: 0.8rem;
            display: flex;
            align-items: center;
        }

        .features {
            display: flex;
            gap: 1px;
            align-items: center;
        }

        .feature-icon {
            font-size: 0.65rem;
            opacity: 0.8;
            display: flex;
            align-items: center;
        }

        .node-name {
            flex: 1;
            font-size: 0.8rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .line-number {
            font-size: 0.65rem;
            color: var(--vscode-descriptionForeground);
            opacity: 0.7;
            margin-left: auto;
        }

        /* Visibility Styling */
        .visibility-public { border-left: 2px solid #10b981; }
        .visibility-private { border-left: 2px solid #ef4444; }
        .visibility-protected { border-left: 2px solid #f59e0b; }

        /* Modifier Styling */
        .modifier-static .node-name { font-weight: 600; }
        .modifier-readonly .node-name { font-style: italic; }
        .modifier-abstract .node-name { opacity: 0.8; }

        /* Empty State */
        .empty-state {
            padding: var(--spacing-lg);
            text-align: center;
            color: var(--vscode-descriptionForeground);
            font-style: italic;
            font-size: 0.8rem;
        }

        /* Tooltip */
        .tooltip {
            position: relative;
        }

        .tooltip::after {
            content: attr(data-tooltip);
            position: absolute;
            bottom: 125%;
            left: 0;
            background-color: var(--vscode-editorHoverWidget-background);
            color: var(--vscode-editorHoverWidget-foreground);
            padding: var(--spacing-xs) var(--spacing-sm);
            border-radius: var(--border-radius);
            font-size: 0.65rem;
            white-space: nowrap;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.2s;
            z-index: 1000;
            border: 1px solid var(--vscode-editorHoverWidget-border);
            min-width: max-content;
        }

        .tooltip:hover::after {
            opacity: 1;
        }

        /* Scrollbar */
        .content::-webkit-scrollbar {
            width: 6px;
        }

        .content::-webkit-scrollbar-track {
            background: transparent;
        }

        .content::-webkit-scrollbar-thumb {
            background: var(--vscode-scrollbarSlider-background);
            border-radius: 3px;
        }

        .content::-webkit-scrollbar-thumb:hover {
            background: var(--vscode-scrollbarSlider-hoverBackground);
        }
    `;
  }

  /**
   * Toolbar HTML'ini oluşturur
   */
  private getToolbarHTML(): string {
    return `
        <div class="toolbar">
            <button class="btn" id="refresh-btn" title="Refresh outline">
                <span>🔄</span>
                <span>Refresh</span>
            </button>
            <button class="btn" id="collapse-all-btn" title="Collapse all nodes">
                <span>📁</span>
                <span>Collapse All</span>
            </button>
            <div style="width: 1px; height: 1rem; background: var(--vscode-panel-border); margin: 0 var(--spacing-xs);"></div>
            <button class="btn" id="sort-position" title="Sort by position in file">
                <span>📍</span>
            </button>
            <button class="btn" id="sort-name" title="Sort alphabetically by name">
                <span>🔤</span>
            </button>
            <button class="btn" id="sort-category" title="Sort by element category">
                <span>📚</span>
            </button>
        </div>
    `;
  }

  /**
   * İçerik HTML'ini oluşturur
   */
  private getContentHTML(): string {
    return `
        <div class="content">
            <div class="outline-section">
                <div class="section-header">TS OUTLINER</div>
                <div id="outline-container">
                    <div class="empty-state">Loading...</div>
                </div>
            </div>
        </div>
    `;
  }

  /**
   * Client-side JavaScript kodunu oluşturur
   */
  private getJavaScript(): string {
    return `
        // State Management
        class OutlineState {
            constructor() {
                this.nodes = [];
                this.sortMode = 'position';
                this.selectedNode = null;
                this.collapsedStateKey = 'ts-outliner-collapsed-state';
                this.settings = this.getDefaultSettings();
            }

            getDefaultSettings() {
                return {
                    emojiSettings: {
                        "public": "🌐",
                        "private": "🔒",
                        "protected": "🛡️",
                        "static": "📌",
                        "readonly": "📖",
                        "abstract": "🎭",
                        "async": "⚡",
                        "export": "📤",
                        "default": "🌟",
                        "constructor": "🏗️",
                        "property": "📝",
                        "method": "⚙️",
                        "function": "🔧",
                        "getter": "📤",
                        "setter": "📥",
                        "class": "📦",
                        "interface": "📋"
                    },
                    showIconsInLabel: true,
                    showVisibilityInLabel: false,
                    autoSelectCurrentElement: false,
                    autoRevealCurrentElement: false
                };
            }

            setNodes(nodes) {
                this.nodes = nodes;
                this.render();
            }

            setSortMode(mode) {
                this.sortMode = mode;
                this.updateToolbar();
            }

            setSettings(newSettings) {
                this.settings = { ...this.getDefaultSettings(), ...newSettings };
                // Ayarlar değiştiğinde yeniden render et
                this.render();
            }

            selectElementAtLine(line) {
                // Belirli bir satırdaki element'i bul ve seç
                const nodeElement = this.findNodeElementByLine(line);
                if (nodeElement) {
                    const content = nodeElement.querySelector('.node-content');
                    if (content) {
                        this.selectNode(content);
                        
                        // Element'i görünür yap (parent'ları expand et)
                        let parent = nodeElement.parentElement;
                        while (parent && parent.classList) {
                            if (parent.classList.contains('node-children') && parent.classList.contains('collapsed')) {
                                const parentNode = parent.previousElementSibling;
                                if (parentNode && parentNode.classList.contains('node-content')) {
                                    const chevron = parentNode.querySelector('.chevron');
                                    if (chevron) {
                                        chevron.click();
                                    }
                                }
                            }
                            parent = parent.parentElement;
                        }
                        
                        // Element'i scroll ile görünür hale getir
                        content.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }
                }
            }

            findNodeElementByLine(targetLine) {
                // En yakın line'daki node'u bul
                let bestMatch = null;
                let bestDistance = Infinity;
                
                const allNodes = document.querySelectorAll('.node-content');
                allNodes.forEach(nodeContent => {
                    const lineNumberElement = nodeContent.querySelector('.line-number');
                    if (lineNumberElement) {
                        const nodeLineText = lineNumberElement.textContent.replace(':', '');
                        const nodeLine = parseInt(nodeLineText, 10) - 1; // 0-indexed'e çevir
                        
                        // Cursor'dan önceki veya tam eşleşen en yakın node'u bul
                        if (nodeLine <= targetLine) {
                            const distance = targetLine - nodeLine;
                            if (distance < bestDistance) {
                                bestDistance = distance;
                                bestMatch = nodeContent.closest('.node');
                            }
                        }
                    }
                });
                
                return bestMatch;
            }

            selectNode(element) {
                if (this.selectedNode) {
                    this.selectedNode.classList.remove('selected');
                }
                this.selectedNode = element;
                element.classList.add('selected');
            }

            updateToolbar() {
                document.querySelectorAll('.toolbar .btn[id^="sort-"]').forEach(btn => {
                    btn.classList.remove('active');
                });
                
                const activeBtn = document.getElementById(\`sort-\${this.sortMode}\`);
                if (activeBtn) {
                    activeBtn.classList.add('active');
                }
            }

            // Collapsed state'leri localStorage'dan al
            getCollapsedStates() {
                try {
                    const saved = localStorage.getItem(this.collapsedStateKey);
                    return saved ? JSON.parse(saved) : {};
                } catch (error) {
                    console.error('Error loading collapsed states:', error);
                    return {};
                }
            }

            // Collapsed state'leri localStorage'a kaydet
            saveCollapsedStates(states) {
                try {
                    localStorage.setItem(this.collapsedStateKey, JSON.stringify(states));
                } catch (error) {
                    console.error('Error saving collapsed states:', error);
                }
            }

            // Node'un unique key'ini oluştur (path + name + type)
            getNodeKey(node, parentPath = '') {
                const currentPath = parentPath ? \`\${parentPath}.\${node.name}\` : node.name;
                return \`\${currentPath}[\${node.type}]\`;
            }

            render() {
                const container = document.getElementById('outline-container');
                
                if (!this.nodes || this.nodes.length === 0) {
                    container.innerHTML = '<div class="empty-state">No TypeScript symbols found</div>';
                    return;
                }

                // Mevcut collapsed state'leri al
                const collapsedStates = this.getCollapsedStates();
                
                container.innerHTML = '';
                this.nodes.forEach(node => {
                    container.appendChild(NodeRenderer.render(node, 0, '', collapsedStates));
                });
            }
        }

        // Node Rendering
        class NodeRenderer {
            static render(node, level = 0, parentPath = '', collapsedStates = {}) {
                const nodeElement = document.createElement('div');
                nodeElement.className = 'node';
                
                const nodeKey = state.getNodeKey(node, parentPath);
                const currentPath = parentPath ? \`\${parentPath}.\${node.name}\` : node.name;

                const hasChildren = node.children && node.children.length > 0;
                
                // Create node content
                const content = document.createElement('div');
                content.className = \`node-content visibility-\${node.visibility}\`;
                
                // Add modifier classes
                if (node.modifiers) {
                    node.modifiers.forEach(mod => {
                        content.classList.add(\`modifier-\${mod}\`);
                    });
                }

                // Build content HTML
                content.innerHTML = \`
                    \${hasChildren ? '<span class="chevron">▶</span>' : '<span style="width: 0.75rem;"></span>'}
                    \${state.settings.showIconsInLabel ? \`<span class="type-icon tooltip" data-tooltip="\${NodeRenderer.getTypeTooltip(node)}">\${IconManager.getTypeIcon(node.type)}</span>\` : ''}
                    <div class="features">
                        \${NodeRenderer.getFeatureIcons(node)}
                    </div>
                    <span class="node-name">\${NodeRenderer.getNodeDisplayName(node)}</span>
                    <span class="line-number">:\${node.line + 1}</span>
                \`;

                // Event listeners
                content.addEventListener('click', (e) => {
                    console.log('Click event triggered on:', node.name);
                    if (e.target.classList.contains('chevron')) {
                        e.stopPropagation();
                        NodeRenderer.toggleNode(nodeElement, nodeKey);
                    } else {
                        // Click event için stop propagation kullanmıyoruz ki dblclick çalışabilsin
                        state.selectNode(content);
                        vscode.postMessage({ type: 'goToLine', line: node.line });
                    }
                });

                // Çift tıklama event listener'ı - bloğu seç
                content.addEventListener('dblclick', (event) => {
                    console.log('=== DOUBLE CLICK EVENT TRIGGERED ===');
                    console.log('Event target:', event.target);
                    console.log('Node data:', { line: node.line, name: node.name, type: node.type });
                    
                    // Chevron'a double-click yapılmadığından emin ol
                    if (!event.target || !event.target.classList.contains('chevron')) {
                        console.log('Processing double-click...');
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation(); // Diğer event listener'ları engelle
                        
                        state.selectNode(content);
                        
                        // Timeout ile message gönder - event loop'tan sonra
                        setTimeout(() => {
                            const message = { 
                                type: 'selectBlock', 
                                line: node.line,
                                name: node.name,
                                nodeType: node.type
                            };
                            console.log('Sending message to backend:', JSON.stringify(message));
                            vscode.postMessage(message);
                        }, 10);
                    } else {
                        console.log('Double-click on chevron ignored');
                    }
                });

                nodeElement.appendChild(content);

                // Add children
                if (hasChildren) {
                    const childrenContainer = document.createElement('div');
                    
                    // Saved state'e göre collapsed durumunu ayarla
                    // Default olarak collapsed, eğer açık olarak kaydedildiyse expanded yap
                    const isExpanded = collapsedStates[nodeKey] === false; // false = expanded, true/undefined = collapsed
                    childrenContainer.className = isExpanded ? 'node-children' : 'node-children collapsed';
                    
                    // Chevron'u da duruma göre ayarla
                    const chevron = content.querySelector('.chevron');
                    if (isExpanded) {
                        chevron.classList.add('expanded');
                    }
                    
                    node.children.forEach(child => {
                        childrenContainer.appendChild(NodeRenderer.render(child, level + 1, currentPath, collapsedStates));
                    });
                    
                    nodeElement.appendChild(childrenContainer);
                }

                return nodeElement;
            }

            static toggleNode(nodeElement, nodeKey) {
                const chevron = nodeElement.querySelector('.chevron');
                const children = nodeElement.querySelector('.node-children');
                
                if (!children) return;

                const isCollapsed = children.classList.contains('collapsed');
                
                if (isCollapsed) {
                    // Expand
                    children.classList.remove('collapsed');
                    chevron.classList.add('expanded');
                } else {
                    // Collapse
                    children.classList.add('collapsed');
                    chevron.classList.remove('expanded');
                }
                
                // State'i kaydet (collapsed = true, expanded = false)
                const collapsedStates = state.getCollapsedStates();
                collapsedStates[nodeKey] = !isCollapsed; // toggle: collapsed ise false (expanded), değilse true (collapsed)
                state.saveCollapsedStates(collapsedStates);
            }

            static getFeatureIcons(node) {
                const features = [];
                
                // showIconsInLabel ayarı false ise hiç ikon gösterme
                if (!state.settings.showIconsInLabel) {
                    return '';
                }
                
                // Visibility ikonları her zaman göster (showIconsInLabel true ise)
                const visIcon = IconManager.getVisibilityIcon(node.visibility);
                if (visIcon) {
                    features.push(\`<span class="feature-icon tooltip" data-tooltip="Visibility: \${node.visibility}">\${visIcon}</span>\`);
                }
                
                // Modifiers - duplicate kontrolü ile
                if (node.modifiers) {
                    const modifiers = [...node.modifiers];
                    const addedModifiers = new Set(); // Duplicate kontrolü için
                    
                    // Export default'u tek ikon olarak göster
                    if (modifiers.includes('export') && modifiers.includes('default')) {
                        const defaultIcon = IconManager.getModifierIcon('default');
                        if (defaultIcon) {
                            features.push(\`<span class="feature-icon tooltip" data-tooltip="Export Default">\${defaultIcon}</span>\`);
                        }
                        addedModifiers.add('export');
                        addedModifiers.add('default');
                    }
                    
                    // Diğer modifier'ları tek tek göster (duplicate olmayacak şekilde)
                    modifiers.forEach(mod => {
                        if (!addedModifiers.has(mod)) {
                            const icon = IconManager.getModifierIcon(mod);
                            if (icon) {
                                features.push(\`<span class="feature-icon tooltip" data-tooltip="Modifier: \${mod}">\${icon}</span>\`);
                                addedModifiers.add(mod);
                            }
                        }
                    });
                }
                
                return features.join('');
            }

            static getNodeDisplayName(node) {
                let displayName = node.name;
                
                // showVisibilityInLabel true ise visibility'yi [brackets] içinde ekle
                if (state.settings.showVisibilityInLabel) {
                    displayName += \` [\${node.visibility}]\`;
                }
                
                return displayName;
            }

            static getTypeTooltip(node) {
                const type = node.type.charAt(0).toUpperCase() + node.type.slice(1);
                return \`\${type}: \${node.name}\`;
            }
        }

        // Icon Management
        class IconManager {
            static getTypeIcon(type) {
                return state.settings.emojiSettings[type] || '❓';
            }

            static getVisibilityIcon(visibility) {
                return state.settings.emojiSettings[visibility] || '';
            }

            static getModifierIcon(modifier) {
                return state.settings.emojiSettings[modifier] || '';
            }
        }

        // Utility Functions
        class Utils {
            static collapseAll() {
                // Tüm node'ları collapse yap
                document.querySelectorAll('.node-children').forEach(children => {
                    children.classList.add('collapsed');
                });
                
                document.querySelectorAll('.chevron').forEach(chevron => {
                    chevron.classList.remove('expanded');
                });
                
                // LocalStorage'ı da güncelle - tüm node'ları collapsed olarak işaretle
                const allNodes = document.querySelectorAll('.node');
                const collapsedStates = {};
                
                allNodes.forEach(nodeElement => {
                    const hasChildren = nodeElement.querySelector('.node-children');
                    if (hasChildren) {
                        // Node key'ini bulmak için node'un path'ini oluşturmaya çalışalım
                        // Bu biraz karmaşık olacak, basit çözüm olarak tüm state'i temizleyip
                        // default collapsed duruma getirelim
                    }
                });
                
                // Basit çözüm: collapsed state'leri temizle, default'a döner (collapsed)
                state.saveCollapsedStates({});
            }
        }

        // Initialize
        const vscode = acquireVsCodeApi();
        const state = new OutlineState();

        // Event Listeners
        document.getElementById('refresh-btn').addEventListener('click', () => {
            vscode.postMessage({ type: 'refresh' });
        });

        document.getElementById('collapse-all-btn').addEventListener('click', () => {
            Utils.collapseAll();
        });

        document.getElementById('sort-position').addEventListener('click', () => {
            vscode.postMessage({ type: 'sortBy', mode: 'position' });
        });

        document.getElementById('sort-name').addEventListener('click', () => {
            vscode.postMessage({ type: 'sortBy', mode: 'name' });
        });

        document.getElementById('sort-category').addEventListener('click', () => {
            vscode.postMessage({ type: 'sortBy', mode: 'category' });
        });

        // Message Handler
        window.addEventListener('message', event => {
            const message = event.data;
            switch (message.type) {
                case 'updateOutline':
                    if (message.settings) {
                        state.setSettings(message.settings);
                    }
                    state.setNodes(message.nodes);
                    state.setSortMode(message.sortMode);
                    break;
                case 'selectElementAtLine':
                    state.selectElementAtLine(message.line);
                    break;
            }
        });
    `;
  }
}
