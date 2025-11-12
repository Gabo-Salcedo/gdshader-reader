// main.js for gdshader-reader plugin
// Rewritten in plain JavaScript (CommonJS) without TypeScript syntax.

const obsidian = require('obsidian');
const path = require('path');

// Constants for view types and other configuration
const VIEW_TYPE_SHADER = 'gdshader-view';
const VIEW_TYPE_IMAGE = 'gdshader-image-view';
const DEFAULT_ICON_NAME = 'icon.png'; // default icon image file in plugin folder
const ALLOWED_IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'svg', 'webp'];
const ALLOWED_VIDEO_EXTENSIONS = ['mp4', 'webm', 'ogv', 'mov'];
const ALLOWED_MEDIA_EXTENSIONS = [...ALLOWED_IMAGE_EXTENSIONS, ...ALLOWED_VIDEO_EXTENSIONS];

// Default settings
const DEFAULT_SETTINGS = {
  imageFolder: 'ShaderImages',
  autoOpenReferencePanel: true,
  saveLocation: 'global', // 'global' or 'relative'
  relativeFolderName: 'assets',
  associations: {},
  // Color settings inspired by Godot Engine editor
  colorPreset: 'godot', // 'godot', 'dark', 'light'
  backgroundColor: '#2b2b2b',
  textColor: '#e0e0e0',
  keywordColor: '#ff7085',
  directiveColor: '#ffb373',
  functionColor: '#57b3ff',
  numberColor: '#a1ffe0',
  stringColor: '#ffeda1',
  commentColor: '#676767',
  builtInColor: '#8eef97',
  operatorColor: '#babadc',
  imagePanelBackground: '#202020',
  lineNumberColor: '#606366',
  selectionColor: '#4d4d4d'
};

// Color presets
const COLOR_PRESETS = {
  godot: {
    name: 'Godot Theme',
    backgroundColor: '#2b2b2b',
    textColor: '#e0e0e0',
    keywordColor: '#ff7085',
    directiveColor: '#ffb373',
    functionColor: '#57b3ff',
    numberColor: '#a1ffe0',
    stringColor: '#ffeda1',
    commentColor: '#676767',
    builtInColor: '#8eef97',
    operatorColor: '#babadc',
    imagePanelBackground: '#202020',
    lineNumberColor: '#606366',
    selectionColor: '#4d4d4d'
  },
  dark: {
    name: 'Dark Professional',
    backgroundColor: '#1e1e1e',
    textColor: '#d4d4d4',
    keywordColor: '#569cd6',
    directiveColor: '#c586c0',
    functionColor: '#dcdcaa',
    numberColor: '#b5cea8',
    stringColor: '#ce9178',
    commentColor: '#6a9955',
    builtInColor: '#4ec9b0',
    operatorColor: '#d4d4d4',
    imagePanelBackground: '#252526',
    lineNumberColor: '#858585',
    selectionColor: '#264f78'
  },
  light: {
    name: 'Light Professional',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    keywordColor: '#0000ff',
    directiveColor: '#af00db',
    functionColor: '#795e26',
    numberColor: '#098658',
    stringColor: '#a31515',
    commentColor: '#008000',
    builtInColor: '#267f99',
    operatorColor: '#000000',
    imagePanelBackground: '#f3f3f3',
    lineNumberColor: '#237893',
    selectionColor: '#add6ff'
  },
  monokai: {
    name: 'Monokai (Sublime Text)',
    backgroundColor: '#272822',
    textColor: '#f8f8f2',
    keywordColor: '#f92672',
    directiveColor: '#fd971f',
    functionColor: '#a6e22e',
    numberColor: '#ae81ff',
    stringColor: '#e6db74',
    commentColor: '#75715e',
    builtInColor: '#66d9ef',
    operatorColor: '#f92672',
    imagePanelBackground: '#1e1f1c',
    lineNumberColor: '#90908a',
    selectionColor: '#49483e'
  },
  dracula: {
    name: 'Dracula',
    backgroundColor: '#282a36',
    textColor: '#f8f8f2',
    keywordColor: '#ff79c6',
    directiveColor: '#ffb86c',
    functionColor: '#50fa7b',
    numberColor: '#bd93f9',
    stringColor: '#f1fa8c',
    commentColor: '#6272a4',
    builtInColor: '#8be9fd',
    operatorColor: '#ff79c6',
    imagePanelBackground: '#21222c',
    lineNumberColor: '#6272a4',
    selectionColor: '#44475a'
  },
  solarized_dark: {
    name: 'Solarized Dark',
    backgroundColor: '#002b36',
    textColor: '#839496',
    keywordColor: '#268bd2',
    directiveColor: '#cb4b16',
    functionColor: '#b58900',
    numberColor: '#2aa198',
    stringColor: '#859900',
    commentColor: '#586e75',
    builtInColor: '#6c71c4',
    operatorColor: '#93a1a1',
    imagePanelBackground: '#073642',
    lineNumberColor: '#586e75',
    selectionColor: '#073642'
  },
  nord: {
    name: 'Nord',
    backgroundColor: '#2e3440',
    textColor: '#d8dee9',
    keywordColor: '#81a1c1',
    directiveColor: '#d08770',
    functionColor: '#88c0d0',
    numberColor: '#b48ead',
    stringColor: '#a3be8c',
    commentColor: '#616e88',
    builtInColor: '#8fbcbb',
    operatorColor: '#81a1c1',
    imagePanelBackground: '#3b4252',
    lineNumberColor: '#4c566a',
    selectionColor: '#434c5e'
  },
  gruvbox: {
    name: 'Gruvbox Dark',
    backgroundColor: '#282828',
    textColor: '#ebdbb2',
    keywordColor: '#fb4934',
    directiveColor: '#fe8019',
    functionColor: '#b8bb26',
    numberColor: '#d3869b',
    stringColor: '#fabd2f',
    commentColor: '#928374',
    builtInColor: '#8ec07c',
    operatorColor: '#fe8019',
    imagePanelBackground: '#1d2021',
    lineNumberColor: '#7c6f64',
    selectionColor: '#3c3836'
  },
  blender: {
    name: 'Blender',
    backgroundColor: '#383838',
    textColor: '#e6e6e6',
    keywordColor: '#ffa900',
    directiveColor: '#ff6188',
    functionColor: '#78dce8',
    numberColor: '#ab9df2',
    stringColor: '#a9dc76',
    commentColor: '#7f7f7f',
    builtInColor: '#fc9867',
    operatorColor: '#ffa900',
    imagePanelBackground: '#2b2b2b',
    lineNumberColor: '#999999',
    selectionColor: '#5a5a5a'
  },
  gabo_ar: {
    name: 'Argentina',
    backgroundColor: '#1a2332',
    textColor: '#e8f1f5',
    keywordColor: '#74acdf',
    directiveColor: '#f9c846',
    functionColor: '#85d4f5',
    numberColor: '#a8d5e2',
    stringColor: '#ffd966',
    commentColor: '#6b8098',
    builtInColor: '#5eb3e0',
    operatorColor: '#ffd966',
    imagePanelBackground: '#14202d',
    lineNumberColor: '#4a6278',
    selectionColor: '#2d4a66'
  }
};

function normalizeVaultPath(target) {
  if (!target) return target;
  if (typeof target !== 'string') return target;
  if (typeof obsidian.normalizePath === 'function') {
    return obsidian.normalizePath(target);
  }
  return target.replace(/\\/g, '/');
}

function getResourceUrl(app, targetPath) {
  if (!app || !app.vault || !app.vault.adapter || !targetPath) return '';
  const adapter = app.vault.adapter;
  const normalized = normalizeVaultPath(targetPath);
  if (adapter && typeof adapter.getResourcePath === 'function') {
    return adapter.getResourcePath(normalized);
  }
  const basePath = adapter && typeof adapter.getBasePath === 'function' ? adapter.getBasePath() : '';
  // Construct absolute path safely without path.join to avoid Windows issues
  const absolutePath = basePath ? `${basePath}/${normalized}`.replace(/\\/g, '/').replace(/\/+/g, '/') : normalized;
  return 'file://' + encodeURI(absolutePath);
}

function getDefaultIconPath(app) {
  return `${app.vault.configDir}/plugins/gdshader-reader/${DEFAULT_ICON_NAME}`;
}

function getImageFolderPath(shaderPath, settings) {
  // Calculate the folder path where images should be saved based on settings
  if (settings.saveLocation === 'relative' && shaderPath) {
    // Get the directory containing the shader file
    const lastSlashIndex = shaderPath.lastIndexOf('/');
    const shaderDir = lastSlashIndex !== -1 ? shaderPath.substring(0, lastSlashIndex) : '';
    const folderName = settings.relativeFolderName || 'assets';
    return normalizeVaultPath(shaderDir ? `${shaderDir}/${folderName}` : folderName);
  }
  // Default to global folder
  return normalizeVaultPath(settings.imageFolder || 'ShaderImages');
}

// Custom view to display .gdshader files with syntax highlighting and toolbar actions
class GdShaderView extends obsidian.FileView {
  constructor(leaf) {
    super(leaf);
    /** @type {GdshaderReaderPlugin} */
    this.plugin = null;  // will be set by plugin when creating the view
    this.currentFileContent = '';  // store file text content for copy action
  }

  getViewType() {
    return VIEW_TYPE_SHADER;
  }

  getDisplayText() {
    // Display the file name as the view title
    return this.file ? this.file.name : 'Shader View';
  }

  async onOpen() {
    // Add CSS class for styling
    this.containerEl.addClass('gdshader-view');
    // Add toolbar actions: Copy, Reference, Theme Selector, Settings
    this.addAction('copy', 'Copiar código del shader', () => {
      this.copyShaderCode();
    });
    this.addAction('image', 'Abrir/Cerrar imagen de referencia', () => {
      this.toggleReferencePanel();
    });
    this.addAction('palette', 'Cambiar tema de color', () => {
      this.openThemeSelector();
    });
    this.addAction('settings', 'Abrir ajustes del plugin', () => {
      this.plugin.openSettings();
    });
    // If a file is already loaded, display content and open reference panel
    if (this.file) {
      await this.displayShaderContent();
      await this.openReferencePanel(true);
    }
  }

  async onLoadFile(file) {
    // Called when a .gdshader file is opened in this view
    await this.displayShaderContent();
    
    // Always ensure the reference panel is open or updated
    const existingLeaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_IMAGE);
    if (existingLeaves.length > 0) {
      // Update existing panel
      const shaderPath = normalizeVaultPath(this.file.path);
      const view = existingLeaves[0].view;
      if (view instanceof GdShaderImageView) {
        view.plugin = this.plugin;
        const imgPath = this.plugin.data[shaderPath] || null;
        view.displayImage(imgPath, shaderPath);
      }
    } else {
      // No panel exists, open it
      await this.openReferencePanel(true);
    }
  }

  async displayShaderContent() {
    if (!this.file) return;
    try {
      const data = await this.app.vault.read(this.file);
      this.currentFileContent = data;
      // Clear previous content and render code with syntax highlighting
      this.contentEl.empty();
      const codeBlock = '```glsl\n' + data + '\n```';
      await obsidian.MarkdownRenderer.renderMarkdown(codeBlock, this.contentEl, this.file.path, this);
      
      // Apply custom highlighting for built-in constants (all caps words)
      this.highlightBuiltIns();
    } catch (err) {
      console.error('Error loading shader file:', err);
      this.contentEl.setText('Error al cargar el archivo shader.');
    }
  }

  highlightBuiltIns() {
    // Highlight all-caps words as built-in constants, directives, and operators
    if (!this.plugin || !this.contentEl) return;
    
    const codeElements = this.contentEl.querySelectorAll('code');
    const directivePattern = /\b(shader_type|render_mode)\b/g;
    const builtInPattern = /\b([A-Z][A-Z0-9_]{2,})\b/g;
    const operatorPattern = /([=+\-*\/%<>!&|^~]+)/g;
    
    codeElements.forEach(codeEl => {
      const walker = document.createTreeWalker(
        codeEl,
        NodeFilter.SHOW_TEXT,
        null
      );
      
      const nodesToReplace = [];
      let node;
      
      while (node = walker.nextNode()) {
        const text = node.textContent;
        // Match directives, built-ins, or operators
        if (directivePattern.test(text) || builtInPattern.test(text) || operatorPattern.test(text)) {
          nodesToReplace.push(node);
        }
        // Reset regex lastIndex
        directivePattern.lastIndex = 0;
        builtInPattern.lastIndex = 0;
        operatorPattern.lastIndex = 0;
      }
      
      nodesToReplace.forEach(textNode => {
        const text = textNode.textContent;
        const fragment = document.createDocumentFragment();
        let lastIndex = 0;
        
        // Create a combined pattern to process directives, built-ins, and operators
        const combinedPattern = /\b(shader_type|render_mode)\b|\b([A-Z][A-Z0-9_]{2,})\b|([=+\-*\/%<>!&|^~]+)/g;
        let match;
        
        while ((match = combinedPattern.exec(text)) !== null) {
          // Add text before the match
          if (match.index > lastIndex) {
            fragment.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
          }
          
          const span = document.createElement('span');
          
          // Check if it's a directive (shader_type or render_mode)
          if (match[1]) {
            span.className = 'token directive';
            span.textContent = match[1];
            span.style.color = this.plugin.settings.directiveColor;
          }
          // Check if it's a built-in constant (all caps)
          else if (match[2]) {
            span.className = 'token builtin';
            span.textContent = match[2];
            span.style.color = this.plugin.settings.builtInColor;
          }
          // Check if it's an operator
          else if (match[3]) {
            span.className = 'token operator';
            span.textContent = match[3];
            span.style.color = this.plugin.settings.operatorColor;
          }
          
          fragment.appendChild(span);
          lastIndex = combinedPattern.lastIndex;
        }
        
        // Add remaining text
        if (lastIndex < text.length) {
          fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
        }
        
        textNode.parentNode.replaceChild(fragment, textNode);
      });
    });
  }

  copyShaderCode() {
    if (!this.currentFileContent) {
      new obsidian.Notice('No hay contenido del shader para copiar');
      return;
    }
    const clipboard = typeof navigator !== 'undefined' ? navigator.clipboard : null;
    if (!clipboard || typeof clipboard.writeText !== 'function') {
      new obsidian.Notice('No se pudo acceder al portapapeles');
      return;
    }
    clipboard.writeText(this.currentFileContent).then(() => {
      new obsidian.Notice('Código del shader copiado al portapapeles');
    }).catch(err => {
      console.error('Error al copiar:', err);
      new obsidian.Notice('No se pudo copiar el código');
    });
  }

  openThemeSelector() {
    // Create a menu with all available themes
    const menu = new obsidian.Menu();
    
    // Get all theme presets
    const presets = Object.keys(COLOR_PRESETS);
    const currentPreset = this.plugin.settings.colorPreset || 'godot';
    
    presets.forEach(presetKey => {
      const preset = COLOR_PRESETS[presetKey];
      menu.addItem((item) => {
        item
          .setTitle(preset.name)
          .setIcon(currentPreset === presetKey ? 'check' : 'palette')
          .onClick(async () => {
            // Apply the selected preset
            this.plugin.applyColorPreset(presetKey);
            await this.plugin.saveSettings();
            // Apply styles to reflect changes immediately
            this.plugin.applyStyles();
            // Refresh the shader view
            await this.displayShaderContent();
            new obsidian.Notice(`Tema cambiado: ${preset.name}`);
          });
      });
    });
    
    // Show the menu at the mouse position
    menu.showAtMouseEvent(event);
  }

  async toggleReferencePanel() {
    // Toggle (open/close) the reference panel
    if (!this.file) return;
    const existingLeaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_IMAGE);
    
    // If any image panel exists, close it
    if (existingLeaves.length > 0) {
      existingLeaves.forEach(leaf => leaf.detach());
      return;
    }
    
    // No panel exists, open it
    await this.openReferencePanel(false);
  }

  async openReferencePanel(auto = false) {
    if (!this.file) return;
    const shaderPath = normalizeVaultPath(this.file.path);
    
    // Check if a reference image view already exists (reuse it)
    const existingLeaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_IMAGE);
    
    if (existingLeaves.length > 0) {
      // Reuse existing panel and update its content
      const leaf = existingLeaves[0];
      const view = leaf.view;
      if (view instanceof GdShaderImageView) {
        view.plugin = this.plugin;
        const imgPath = this.plugin.data[shaderPath] || null;
        view.displayImage(imgPath, shaderPath);
        // Ensure the right sidebar is expanded
        this.app.workspace.rightSplit.expand();
        // Always reveal the leaf to ensure sidebar is open
        this.app.workspace.revealLeaf(leaf);
      }
      return;
    }
    
    // No panel exists, create a new one in the right sidebar
    const rightLeaf = this.app.workspace.getRightLeaf(false);
    if (!rightLeaf) {
      console.error('No se pudo obtener el panel derecho');
      return;
    }
    
    await rightLeaf.setViewState({ 
      type: VIEW_TYPE_IMAGE, 
      active: true 
    });
    
    const view = rightLeaf.view;
    if (view instanceof GdShaderImageView) {
      view.plugin = this.plugin;
      const imgPath = this.plugin.data[shaderPath] || null;
      view.displayImage(imgPath, shaderPath);
      // Ensure the right sidebar is expanded
      this.app.workspace.rightSplit.expand();
      // Always reveal the leaf to ensure sidebar is open
      this.app.workspace.revealLeaf(rightLeaf);
    }
  }

  async onClose() {
    // Don't automatically close the image panel when shader view is closed
    // Users can close it manually if needed
  }
}

// Custom view to display an associated image with Update and Delete actions
class GdShaderImageView extends obsidian.ItemView {
  constructor(leaf) {
    super(leaf);
    /** @type {GdshaderReaderPlugin} */
    this.plugin = null;  // set by plugin when view is created
    this.shaderPath = null;   // shader file path associated with this image
    this.imagePath = null;    // vault path of the current image
    this.mediaEl = null;      // <img> or <video> element for displaying media
    this.mediaContainer = null; // container for the media element
  }

  getViewType() {
    return VIEW_TYPE_IMAGE;
  }

  getDisplayText() {
    return 'Imagen de referencia';
  }

  async onOpen() {
    // Add toolbar actions for updating and deleting the image
    this.addAction('image-plus', 'Actualizar/Seleccionar imagen', () => {
      this.openFileSelector();
    });
    this.addAction('trash', 'Eliminar imagen asociada', () => {
      this.removeImage();
    });
    // Set up the content area with media element and buttons
    this.contentEl.empty();
    this.contentEl.addClass('gdshader-image-view');
    
    // Create container for media (image or video)
    this.mediaContainer = this.contentEl.createDiv('gdshader-image-container');
    
    // Create button container directly below media
    this.buttonContainer = this.mediaContainer.createDiv('gdshader-button-container');
    
    // Upload/Update button
    const uploadBtn = this.buttonContainer.createEl('button', {
      cls: 'gdshader-btn',
      attr: { 'aria-label': 'Cargar imagen/video' }
    });
    obsidian.setIcon(uploadBtn, 'image-plus');
    uploadBtn.addEventListener('click', () => {
      this.openFileSelector();
    });
    
    // Delete button
    const deleteBtn = this.buttonContainer.createEl('button', {
      cls: 'gdshader-btn',
      attr: { 'aria-label': 'Eliminar imagen/video' }
    });
    obsidian.setIcon(deleteBtn, 'trash');
    deleteBtn.addEventListener('click', () => {
      this.removeImage();
    });
    
    // Play/Pause button (initially hidden)
    this.playPauseBtn = this.buttonContainer.createEl('button', {
      cls: 'gdshader-btn gdshader-video-btn',
      attr: { 'aria-label': 'Pausar/Reproducir' }
    });
    obsidian.setIcon(this.playPauseBtn, 'pause');
    this.playPauseBtn.style.setProperty('display', 'none', 'important');
    
    // Loop button (initially hidden)
    this.loopBtn = this.buttonContainer.createEl('button', {
      cls: 'gdshader-btn gdshader-video-btn gdshader-loop-active',
      attr: { 'aria-label': 'Loop On/Off' }
    });
    obsidian.setIcon(this.loopBtn, 'repeat');
    this.loopBtn.style.setProperty('display', 'none', 'important');
    
    // Audio toggle button (initially hidden)
    this.audioBtn = this.buttonContainer.createEl('button', {
      cls: 'gdshader-btn gdshader-video-btn',
      attr: { 'aria-label': 'Audio On/Off' }
    });
    obsidian.setIcon(this.audioBtn, 'volume-x');
    this.audioBtn.style.setProperty('display', 'none', 'important');
    
    // Speed control button (initially hidden)
    this.speedBtn = this.buttonContainer.createEl('button', {
      cls: 'gdshader-btn gdshader-video-btn',
      attr: { 'aria-label': 'Velocidad' }
    });
    this.speedBtn.textContent = '1x';
    this.speedBtn.style.setProperty('display', 'none', 'important');
    
    // Handle drag-and-drop of image files
    this.registerDomEvent(this.contentEl, 'dragover', (ev) => ev.preventDefault());
    this.registerDomEvent(this.contentEl, 'drop', (ev) => {
      ev.preventDefault();
      this.handleDrop(ev);
    });
  }

  displayImage(imgPath, shaderPath) {
    // Set the media to display (image or video, or default icon if imgPath is null)
    this.shaderPath = normalizeVaultPath(shaderPath);
    try {
      const normalizedImagePath = imgPath ? normalizeVaultPath(imgPath) : null;
      this.imagePath = normalizedImagePath;
      
      // Remove existing media element
      if (this.mediaEl) {
        this.mediaEl.remove();
        this.mediaEl = null;
      }
      
      // Determine if it's a video or image
      const isVideo = normalizedImagePath && ALLOWED_VIDEO_EXTENSIONS.some(ext => 
        normalizedImagePath.toLowerCase().endsWith('.' + ext)
      );
      
      // Get resource path
      const fallbackPath = getDefaultIconPath(this.app);
      const resourcePath = normalizedImagePath ? getResourceUrl(this.app, normalizedImagePath) : getResourceUrl(this.app, fallbackPath);
      
      if (!resourcePath) {
        // Hide video control buttons if no resource
        this.playPauseBtn.style.setProperty('display', 'none', 'important');
        this.loopBtn.style.setProperty('display', 'none', 'important');
        this.audioBtn.style.setProperty('display', 'none', 'important');
        this.speedBtn.style.setProperty('display', 'none', 'important');
        return;
      }
      
      const cacheBustedSrc = resourcePath.includes('?') ? `${resourcePath}&v=${Date.now()}` : `${resourcePath}?v=${Date.now()}`;
      
      if (isVideo) {
        // Create video element
        this.mediaEl = this.mediaContainer.createEl('video', {
          attr: {
            autoplay: 'true',
            loop: 'true',
            playsinline: 'true'
          }
        });
        this.mediaEl.style.maxWidth = '100%';
        this.mediaEl.style.maxHeight = '100%';
        this.mediaEl.style.display = 'block';
        this.mediaEl.style.objectFit = 'contain';
        this.mediaEl.setAttr('src', cacheBustedSrc);
        
        // Set video to muted by default
        this.mediaEl.muted = true;
        
        // Play/Pause functionality
        this.playPauseBtn.onclick = () => {
          if (this.mediaEl.paused) {
            this.mediaEl.play();
            obsidian.setIcon(this.playPauseBtn, 'pause');
          } else {
            this.mediaEl.pause();
            obsidian.setIcon(this.playPauseBtn, 'play');
          }
        };
        
        // Loop button handler
        this.loopBtn.onclick = () => {
          this.mediaEl.loop = !this.mediaEl.loop;
          if (this.mediaEl.loop) {
            this.loopBtn.classList.add('gdshader-loop-active');
          } else {
            this.loopBtn.classList.remove('gdshader-loop-active');
          }
        };
        
        // Audio toggle handler
        this.audioBtn.onclick = () => {
          this.mediaEl.muted = !this.mediaEl.muted;
          if (this.mediaEl.muted) {
            obsidian.setIcon(this.audioBtn, 'volume-x');
          } else {
            obsidian.setIcon(this.audioBtn, 'volume-2');
          }
        };
        
        // Reset audio icon to muted state (since video is muted by default)
        obsidian.setIcon(this.audioBtn, 'volume-x');
        
        // Speed control functionality
        const speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];
        let currentSpeedIndex = 3; // Start at 1x
        this.speedBtn.onclick = () => {
          currentSpeedIndex = (currentSpeedIndex + 1) % speeds.length;
          const speed = speeds[currentSpeedIndex];
          this.mediaEl.playbackRate = speed;
          this.speedBtn.textContent = speed + 'x';
        };
        
        // Reset speed display to 1x
        this.speedBtn.textContent = '1x';
        
        // Show video control buttons
        this.playPauseBtn.style.setProperty('display', 'flex', 'important');
        this.loopBtn.style.setProperty('display', 'flex', 'important');
        this.audioBtn.style.setProperty('display', 'flex', 'important');
        this.speedBtn.style.setProperty('display', 'flex', 'important');
        
      } else {
        // Create image element
        this.mediaEl = this.mediaContainer.createEl('img');
        this.mediaEl.style.maxWidth = '100%';
        this.mediaEl.style.maxHeight = '100%';
        this.mediaEl.style.display = 'block';
        this.mediaEl.style.objectFit = 'contain';
        this.mediaEl.setAttr('src', cacheBustedSrc);
        
        // Hide video control buttons for images and default icon
        this.playPauseBtn.style.setProperty('display', 'none', 'important');
        this.loopBtn.style.setProperty('display', 'none', 'important');
        this.audioBtn.style.setProperty('display', 'none', 'important');
        this.speedBtn.style.setProperty('display', 'none', 'important');
      }
      
      // Move buttons to the end if they exist
      const buttonContainer = this.mediaContainer.querySelector('.gdshader-button-container');
      if (buttonContainer) {
        this.mediaContainer.appendChild(buttonContainer);
      }
      
    } catch (err) {
      console.error('Error al mostrar la imagen/video asociado:', err);
      if (this.mediaEl) {
        this.mediaEl.removeAttribute('src');
      }
    }
  }

  async openFileSelector() {
    // Open a file dialog to select an image or video
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,video/*';
    input.click();
    input.onchange = async () => {
      if (input.files && input.files.length > 0) {
        const file = input.files[0];
        await this.importAndSetImage(file);
      }
    };
  }

  async handleDrop(event) {
    const dt = event.dataTransfer;
    if (!dt) return;
    if (dt.files && dt.files.length > 0) {
      // External file dropped
      const file = dt.files[0];
      await this.importAndSetImage(file);
    } else {
      // Possibly an internal vault file link dropped
      const textData = dt.getData('text') || dt.getData('text/plain');
      if (textData) {
        const linkMatch = textData.match(/\[\[([^|\]]+)\]\]/);
        if (linkMatch) {
          let filePath = linkMatch[1];
          // Remove leading '!' for embeds
          if (filePath.startsWith('!')) {
            filePath = filePath.substring(1);
          }
          // Handle relative paths (starting with "./")
          if (this.shaderPath && filePath.startsWith('./')) {
            const lastSlashIndex = this.shaderPath.lastIndexOf('/');
            if (lastSlashIndex !== -1) {
              const shaderFolder = this.shaderPath.substring(0, lastSlashIndex);
              filePath = `${shaderFolder}/${filePath.substring(2)}`;
            } else {
              // No folder structure, keep relative path as is
              filePath = filePath.substring(2);
            }
          }
          filePath = normalizeVaultPath(filePath);
          const tfile = this.app.vault.getAbstractFileByPath(filePath);
          if (tfile instanceof obsidian.TFile && ALLOWED_MEDIA_EXTENSIONS.includes(tfile.extension.toLowerCase())) {
            await this.setAssociatedImage(tfile);
            return;
          }
        }
      }
      new obsidian.Notice('Archivo no reconocido para asociar');
    }
  }

  async importAndSetImage(file) {
    // Import an external image file into the vault and associate it
    if (!this.shaderPath || !file) return;
    try {
      // Calculate folder path based on settings
      const imageFolderPath = getImageFolderPath(this.shaderPath, this.plugin.settings);
      // Ensure the image folder exists in the vault
      if (!this.app.vault.getAbstractFileByPath(imageFolderPath)) {
        await this.app.vault.createFolder(imageFolderPath);
      }
      const shaderBase = this.shaderPath.substring(this.shaderPath.lastIndexOf('/') + 1, this.shaderPath.lastIndexOf('.'));
      const shaderFile = this.app.vault.getAbstractFileByPath(this.shaderPath);
      const shaderName = shaderBase || (shaderFile instanceof obsidian.TFile ? shaderFile.basename : 'shader-image');
      const ext = (file.name.split('.').pop() || '').toLowerCase();
      if (!ALLOWED_MEDIA_EXTENSIONS.includes(ext)) {
        new obsidian.Notice('Formato de imagen/video no soportado');
        return;
      }
      const targetPath = normalizeVaultPath(`${imageFolderPath}/${shaderName}.${ext}`);
      // Delete existing file if it exists (to replace)
      const existingFile = this.app.vault.getAbstractFileByPath(targetPath);
      if (existingFile instanceof obsidian.TFile) {
        await this.app.vault.delete(existingFile);
      }
      // Read file data and create new file in vault
      const arrayBuffer = await file.arrayBuffer();
      const newFile = await this.app.vault.createBinary(targetPath, arrayBuffer);
      // Update association data and save
      const shaderKey = normalizeVaultPath(this.shaderPath);
      const oldAssoc = this.plugin.data[shaderKey];
      const newAssoc = normalizeVaultPath(newFile.path);
      this.plugin.data[shaderKey] = newAssoc;
      this.plugin.settings.associations = this.plugin.data;
      await this.plugin.saveSettings();
      // Remove old image file if it was in a managed folder and has a different name
      if (oldAssoc && oldAssoc !== newAssoc) {
        const globalFolder = normalizeVaultPath(this.plugin.settings.imageFolder);
        const relativeFolder = getImageFolderPath(this.shaderPath, this.plugin.settings);
        const isOldInManagedFolder = oldAssoc.startsWith(`${globalFolder}/`) || 
                                      oldAssoc.startsWith(`${relativeFolder}/`);
        
        if (isOldInManagedFolder) {
          const oldFile = this.app.vault.getAbstractFileByPath(oldAssoc);
          if (oldFile instanceof obsidian.TFile) {
            try {
              await this.app.vault.delete(oldFile);
            } catch (e) {
              console.error('Error al eliminar imagen antigua:', e);
            }
          }
        }
      }
      // Show the new image
      this.displayImage(newFile.path, shaderKey);
      new obsidian.Notice('Imagen de referencia actualizada');
    } catch (err) {
      console.error('Error importing image:', err);
      new obsidian.Notice('No se pudo actualizar la imagen');
    }
  }

  async setAssociatedImage(tfile) {
    // Associate an existing vault image file
    if (!this.shaderPath || !(tfile instanceof obsidian.TFile)) return;
    const shaderKey = normalizeVaultPath(this.shaderPath);
    this.plugin.data[shaderKey] = normalizeVaultPath(tfile.path);
    this.plugin.settings.associations = this.plugin.data;
    await this.plugin.saveSettings();
    this.displayImage(tfile.path, shaderKey);
    new obsidian.Notice('Imagen de referencia asociada');
  }

  async removeImage() {
    // Remove the image association for this shader
    if (!this.shaderPath) return;
    const shaderKey = normalizeVaultPath(this.shaderPath);
    const assocPath = this.plugin.data[shaderKey];
    if (!assocPath) {
      new obsidian.Notice('No hay imagen asociada para eliminar');
      return;
    }
    delete this.plugin.data[shaderKey];
    this.plugin.settings.associations = this.plugin.data;
    await this.plugin.saveSettings();
    // If the image file is in a managed folder, delete it from vault
    // Check both global and relative folder possibilities
    const globalFolder = normalizeVaultPath(this.plugin.settings.imageFolder);
    const relativeFolder = getImageFolderPath(this.shaderPath, this.plugin.settings);
    const isInManagedFolder = assocPath.startsWith(`${globalFolder}/`) || 
                              assocPath.startsWith(`${relativeFolder}/`);
    
    if (isInManagedFolder) {
      const file = this.app.vault.getAbstractFileByPath(assocPath);
      if (file instanceof obsidian.TFile) {
        try { 
          await this.app.vault.delete(file); 
        } catch(e) { 
          console.error('Error al eliminar archivo de imagen:', e);
        }
      }
    }
    // Show default image now
    this.displayImage(null, shaderKey);
    new obsidian.Notice('Imagen de referencia eliminada');
  }
}

// Settings tab for plugin configuration
class GdshaderReaderSettingTab extends obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl('h2', { text: 'Configuración de GdShader Reader' });

    // Save location setting
    new obsidian.Setting(containerEl)
      .setName('Ubicación de guardado')
      .setDesc('Elige dónde guardar las imágenes de referencia')
      .addDropdown(dropdown => dropdown
        .addOption('global', 'Carpeta global en el vault')
        .addOption('relative', 'Carpeta relativa junto al shader')
        .setValue(this.plugin.settings.saveLocation)
        .onChange(async (value) => {
          this.plugin.settings.saveLocation = value;
          await this.plugin.saveSettings();
          this.display(); // Refresh to show/hide relevant settings
        }));

    // Image folder setting (only for global mode)
    if (this.plugin.settings.saveLocation === 'global') {
      new obsidian.Setting(containerEl)
        .setName('Carpeta de imágenes')
        .setDesc('Carpeta donde se guardarán las imágenes de referencia de los shaders')
        .addText(text => text
          .setPlaceholder('ShaderImages')
          .setValue(this.plugin.settings.imageFolder)
          .onChange(async (value) => {
            this.plugin.settings.imageFolder = value || 'ShaderImages';
            await this.plugin.saveSettings();
          }));
    }

    // Relative folder name setting (only for relative mode)
    if (this.plugin.settings.saveLocation === 'relative') {
      new obsidian.Setting(containerEl)
        .setName('Nombre de carpeta relativa')
        .setDesc('Nombre de la carpeta que se creará junto al archivo shader')
        .addText(text => text
          .setPlaceholder('assets')
          .setValue(this.plugin.settings.relativeFolderName)
          .onChange(async (value) => {
            this.plugin.settings.relativeFolderName = value || 'assets';
            await this.plugin.saveSettings();
          }));
    }

    // Auto-open reference panel setting
    new obsidian.Setting(containerEl)
      .setName('Abrir panel de referencia automáticamente')
      .setDesc('Abre automáticamente el panel de imagen de referencia al abrir un archivo .gdshader')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.autoOpenReferencePanel)
        .onChange(async (value) => {
          this.plugin.settings.autoOpenReferencePanel = value;
          await this.plugin.saveSettings();
        }));

    // Color settings section
    containerEl.createEl('h3', { text: 'Personalización de colores (estilo Godot)' });
    
    containerEl.createEl('p', { 
      text: 'Personaliza los colores del visor de shaders inspirados en el editor de Godot Engine',
      cls: 'setting-item-description'
    });

    // Color preset selector
    new obsidian.Setting(containerEl)
      .setName('Tema de colores')
      .setDesc('Elige un preset de colores predefinido')
      .addDropdown(dropdown => {
        dropdown
          .addOption('gabo_ar', 'Argentina ⭐⭐⭐')
          .addOption('godot', 'Godot Theme')
          .addOption('blender', 'Blender')
          .addOption('dark', 'Dark Professional')
          .addOption('light', 'Light Professional')
          .addOption('monokai', 'Monokai (Sublime Text)')
          .addOption('dracula', 'Dracula')
          .addOption('solarized_dark', 'Solarized Dark')
          .addOption('nord', 'Nord')
          .addOption('gruvbox', 'Gruvbox Dark')
          .setValue(this.plugin.settings.colorPreset || 'godot')
          .onChange(async (value) => {
            this.plugin.settings.colorPreset = value;
            // Apply preset colors
            this.plugin.applyColorPreset(value);
            await this.plugin.saveSettings();
            this.plugin.applyStyles();
            this.display(); // Refresh to show updated colors
          });
      })
      .addExtraButton(button => button
        .setIcon('paint-bucket')
        .setTooltip('Vista previa de temas')
        .onClick(() => {
          new obsidian.Notice('Usa el dropdown para cambiar entre temas');
        }));

    containerEl.createEl('hr', { cls: 'setting-item-separator' });
    containerEl.createEl('h4', { text: 'Colores personalizados' });

    // Background color
    new obsidian.Setting(containerEl)
      .setName('Color de fondo')
      .setDesc('Color de fondo principal del visor de shader')
      .addColorPicker(color => color
        .setValue(this.plugin.settings.backgroundColor)
        .onChange(async (value) => {
          this.plugin.settings.backgroundColor = value;
          await this.plugin.saveSettings();
          this.plugin.applyStyles();
        }))
      .addText(text => text
        .setPlaceholder('#2b2b2b')
        .setValue(this.plugin.settings.backgroundColor)
        .onChange(async (value) => {
          if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
            this.plugin.settings.backgroundColor = value;
            await this.plugin.saveSettings();
            this.plugin.applyStyles();
          }
        }))
      .addExtraButton(button => button
        .setIcon('reset')
        .setTooltip('Restaurar valor por defecto')
        .onClick(async () => {
          this.plugin.settings.backgroundColor = '#2b2b2b';
          await this.plugin.saveSettings();
          this.plugin.applyStyles();
          this.display();
        }));

    // Text color
    new obsidian.Setting(containerEl)
      .setName('Color del texto')
      .setDesc('Color del texto general y variables')
      .addColorPicker(color => color
        .setValue(this.plugin.settings.textColor)
        .onChange(async (value) => {
          this.plugin.settings.textColor = value;
          await this.plugin.saveSettings();
          this.plugin.applyStyles();
        }))
      .addText(text => text
        .setPlaceholder('#e0e0e0')
        .setValue(this.plugin.settings.textColor)
        .onChange(async (value) => {
          if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
            this.plugin.settings.textColor = value;
            await this.plugin.saveSettings();
            this.plugin.applyStyles();
          }
        }))
      .addExtraButton(button => button
        .setIcon('reset')
        .setTooltip('Restaurar valor por defecto')
        .onClick(async () => {
          this.plugin.settings.textColor = '#e0e0e0';
          await this.plugin.saveSettings();
          this.plugin.applyStyles();
          this.display();
        }));

    // Keyword color
    new obsidian.Setting(containerEl)
      .setName('Color de palabras clave')
      .setDesc('Color para palabras clave (varying, uniform, void, if, for, etc.)')
      .addColorPicker(color => color
        .setValue(this.plugin.settings.keywordColor)
        .onChange(async (value) => {
          this.plugin.settings.keywordColor = value;
          await this.plugin.saveSettings();
          this.plugin.applyStyles();
        }))
      .addText(text => text
        .setPlaceholder('#ff7085')
        .setValue(this.plugin.settings.keywordColor)
        .onChange(async (value) => {
          if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
            this.plugin.settings.keywordColor = value;
            await this.plugin.saveSettings();
            this.plugin.applyStyles();
          }
        }))
      .addExtraButton(button => button
        .setIcon('reset')
        .setTooltip('Restaurar valor por defecto')
        .onClick(async () => {
          this.plugin.settings.keywordColor = '#ff7085';
          await this.plugin.saveSettings();
          this.plugin.applyStyles();
          this.display();
        }));

    // Directive color (shader_type, render_mode)
    new obsidian.Setting(containerEl)
      .setName('Color de directivas')
      .setDesc('Color para directivas especiales (shader_type, render_mode)')
      .addColorPicker(color => color
        .setValue(this.plugin.settings.directiveColor)
        .onChange(async (value) => {
          this.plugin.settings.directiveColor = value;
          await this.plugin.saveSettings();
          this.plugin.applyStyles();
        }))
      .addText(text => text
        .setPlaceholder('#ffb373')
        .setValue(this.plugin.settings.directiveColor)
        .onChange(async (value) => {
          if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
            this.plugin.settings.directiveColor = value;
            await this.plugin.saveSettings();
            this.plugin.applyStyles();
          }
        }))
      .addExtraButton(button => button
        .setIcon('reset')
        .setTooltip('Restaurar valor por defecto')
        .onClick(async () => {
          this.plugin.settings.directiveColor = '#ffb373';
          await this.plugin.saveSettings();
          this.plugin.applyStyles();
          this.display();
        }));

    // Function color
    new obsidian.Setting(containerEl)
      .setName('Color de funciones')
      .setDesc('Color para nombres de funciones y métodos')
      .addColorPicker(color => color
        .setValue(this.plugin.settings.functionColor)
        .onChange(async (value) => {
          this.plugin.settings.functionColor = value;
          await this.plugin.saveSettings();
          this.plugin.applyStyles();
        }))
      .addText(text => text
        .setPlaceholder('#57b3ff')
        .setValue(this.plugin.settings.functionColor)
        .onChange(async (value) => {
          if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
            this.plugin.settings.functionColor = value;
            await this.plugin.saveSettings();
            this.plugin.applyStyles();
          }
        }))
      .addExtraButton(button => button
        .setIcon('reset')
        .setTooltip('Restaurar valor por defecto')
        .onClick(async () => {
          this.plugin.settings.functionColor = '#57b3ff';
          await this.plugin.saveSettings();
          this.plugin.applyStyles();
          this.display();
        }));

    // Built-in constants color
    new obsidian.Setting(containerEl)
      .setName('Color de built-ins')
      .setDesc('Color para constantes built-in en MAYÚSCULAS (COLOR, TEXTURE, UV, VERTEX, etc.)')
      .addColorPicker(color => color
        .setValue(this.plugin.settings.builtInColor)
        .onChange(async (value) => {
          this.plugin.settings.builtInColor = value;
          await this.plugin.saveSettings();
          this.plugin.applyStyles();
        }))
      .addText(text => text
        .setPlaceholder('#8eef97')
        .setValue(this.plugin.settings.builtInColor)
        .onChange(async (value) => {
          if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
            this.plugin.settings.builtInColor = value;
            await this.plugin.saveSettings();
            this.plugin.applyStyles();
          }
        }))
      .addExtraButton(button => button
        .setIcon('reset')
        .setTooltip('Restaurar valor por defecto')
        .onClick(async () => {
          this.plugin.settings.builtInColor = '#8eef97';
          await this.plugin.saveSettings();
          this.plugin.applyStyles();
          this.display();
        }));

    // Operator color
    new obsidian.Setting(containerEl)
      .setName('Color de operadores')
      .setDesc('Color para operadores matemáticos y lógicos (=, +, -, *, /, %, <, >, !, etc.)')
      .addColorPicker(color => color
        .setValue(this.plugin.settings.operatorColor)
        .onChange(async (value) => {
          this.plugin.settings.operatorColor = value;
          await this.plugin.saveSettings();
          this.plugin.applyStyles();
        }))
      .addText(text => text
        .setPlaceholder('#babadc')
        .setValue(this.plugin.settings.operatorColor)
        .onChange(async (value) => {
          if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
            this.plugin.settings.operatorColor = value;
            await this.plugin.saveSettings();
            this.plugin.applyStyles();
          }
        }))
      .addExtraButton(button => button
        .setIcon('reset')
        .setTooltip('Restaurar valor por defecto')
        .onClick(async () => {
          this.plugin.settings.operatorColor = '#babadc';
          await this.plugin.saveSettings();
          this.plugin.applyStyles();
          this.display();
        }));

    // Number color
    new obsidian.Setting(containerEl)
      .setName('Color de números')
      .setDesc('Color para valores numéricos')
      .addColorPicker(color => color
        .setValue(this.plugin.settings.numberColor)
        .onChange(async (value) => {
          this.plugin.settings.numberColor = value;
          await this.plugin.saveSettings();
          this.plugin.applyStyles();
        }))
      .addText(text => text
        .setPlaceholder('#a1ffe0')
        .setValue(this.plugin.settings.numberColor)
        .onChange(async (value) => {
          if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
            this.plugin.settings.numberColor = value;
            await this.plugin.saveSettings();
            this.plugin.applyStyles();
          }
        }))
      .addExtraButton(button => button
        .setIcon('reset')
        .setTooltip('Restaurar valor por defecto')
        .onClick(async () => {
          this.plugin.settings.numberColor = '#a1ffe0';
          await this.plugin.saveSettings();
          this.plugin.applyStyles();
          this.display();
        }));

    // String color
    new obsidian.Setting(containerEl)
      .setName('Color de cadenas de texto')
      .setDesc('Color para strings entre comillas')
      .addColorPicker(color => color
        .setValue(this.plugin.settings.stringColor)
        .onChange(async (value) => {
          this.plugin.settings.stringColor = value;
          await this.plugin.saveSettings();
          this.plugin.applyStyles();
        }))
      .addText(text => text
        .setPlaceholder('#ffeda1')
        .setValue(this.plugin.settings.stringColor)
        .onChange(async (value) => {
          if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
            this.plugin.settings.stringColor = value;
            await this.plugin.saveSettings();
            this.plugin.applyStyles();
          }
        }))
      .addExtraButton(button => button
        .setIcon('reset')
        .setTooltip('Restaurar valor por defecto')
        .onClick(async () => {
          this.plugin.settings.stringColor = '#ffeda1';
          await this.plugin.saveSettings();
          this.plugin.applyStyles();
          this.display();
        }));

    // Comment color
    new obsidian.Setting(containerEl)
      .setName('Color de comentarios')
      .setDesc('Color para comentarios en el código')
      .addColorPicker(color => color
        .setValue(this.plugin.settings.commentColor)
        .onChange(async (value) => {
          this.plugin.settings.commentColor = value;
          await this.plugin.saveSettings();
          this.plugin.applyStyles();
        }))
      .addText(text => text
        .setPlaceholder('#676767')
        .setValue(this.plugin.settings.commentColor)
        .onChange(async (value) => {
          if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
            this.plugin.settings.commentColor = value;
            await this.plugin.saveSettings();
            this.plugin.applyStyles();
          }
        }))
      .addExtraButton(button => button
        .setIcon('reset')
        .setTooltip('Restaurar valor por defecto')
        .onClick(async () => {
          this.plugin.settings.commentColor = '#676767';
          await this.plugin.saveSettings();
          this.plugin.applyStyles();
          this.display();
        }));

    // Line number color
    new obsidian.Setting(containerEl)
      .setName('Color de números de línea')
      .setDesc('Color para los números de línea (si se muestran)')
      .addColorPicker(color => color
        .setValue(this.plugin.settings.lineNumberColor)
        .onChange(async (value) => {
          this.plugin.settings.lineNumberColor = value;
          await this.plugin.saveSettings();
          this.plugin.applyStyles();
        }))
      .addText(text => text
        .setPlaceholder('#606366')
        .setValue(this.plugin.settings.lineNumberColor)
        .onChange(async (value) => {
          if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
            this.plugin.settings.lineNumberColor = value;
            await this.plugin.saveSettings();
            this.plugin.applyStyles();
          }
        }))
      .addExtraButton(button => button
        .setIcon('reset')
        .setTooltip('Restaurar valor por defecto')
        .onClick(async () => {
          this.plugin.settings.lineNumberColor = '#606366';
          await this.plugin.saveSettings();
          this.plugin.applyStyles();
          this.display();
        }));

    // Selection color
    new obsidian.Setting(containerEl)
      .setName('Color de selección')
      .setDesc('Color de fondo al seleccionar texto')
      .addColorPicker(color => color
        .setValue(this.plugin.settings.selectionColor)
        .onChange(async (value) => {
          this.plugin.settings.selectionColor = value;
          await this.plugin.saveSettings();
          this.plugin.applyStyles();
        }))
      .addText(text => text
        .setPlaceholder('#4d4d4d')
        .setValue(this.plugin.settings.selectionColor)
        .onChange(async (value) => {
          if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
            this.plugin.settings.selectionColor = value;
            await this.plugin.saveSettings();
            this.plugin.applyStyles();
          }
        }))
      .addExtraButton(button => button
        .setIcon('reset')
        .setTooltip('Restaurar valor por defecto')
        .onClick(async () => {
          this.plugin.settings.selectionColor = '#4d4d4d';
          await this.plugin.saveSettings();
          this.plugin.applyStyles();
          this.display();
        }));

    // Image panel background
    new obsidian.Setting(containerEl)
      .setName('Color de fondo del panel de imagen')
      .setDesc('Color de fondo para el panel de imagen de referencia')
      .addColorPicker(color => color
        .setValue(this.plugin.settings.imagePanelBackground)
        .onChange(async (value) => {
          this.plugin.settings.imagePanelBackground = value;
          await this.plugin.saveSettings();
          this.plugin.applyStyles();
        }))
      .addText(text => text
        .setPlaceholder('#202020')
        .setValue(this.plugin.settings.imagePanelBackground)
        .onChange(async (value) => {
          if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
            this.plugin.settings.imagePanelBackground = value;
            await this.plugin.saveSettings();
            this.plugin.applyStyles();
          }
        }))
      .addExtraButton(button => button
        .setIcon('reset')
        .setTooltip('Restaurar valor por defecto')
        .onClick(async () => {
          this.plugin.settings.imagePanelBackground = '#202020';
          await this.plugin.saveSettings();
          this.plugin.applyStyles();
          this.display();
        }));

    // Reset all colors button
    new obsidian.Setting(containerEl)
      .setName('Restaurar tema seleccionado')
      .setDesc('Restaura los colores al preset actualmente seleccionado')
      .addButton(button => button
        .setButtonText('Restaurar preset')
        .setCta()
        .onClick(async () => {
          const currentPreset = this.plugin.settings.colorPreset || 'godot';
          this.plugin.applyColorPreset(currentPreset);
          await this.plugin.saveSettings();
          this.plugin.applyStyles();
          this.display();
          new obsidian.Notice(`Tema "${COLOR_PRESETS[currentPreset].name}" restaurado`);
        }));
  }
}

// Main plugin class (CommonJS export)
module.exports = class GdshaderReaderPlugin extends obsidian.Plugin {
  async onload() {
    console.log('Plugin gdshader-reader cargado');
    // Load settings and associations
    await this.loadSettings();
    // Normalize existing associations
    let migrated = false;
    const normalizedData = {};
    for (const [shaderPath, assoc] of Object.entries(this.settings.associations || {})) {
      const normalizedKey = normalizeVaultPath(shaderPath);
      const normalizedValue = typeof assoc === 'string' ? normalizeVaultPath(assoc) : assoc;
      normalizedData[normalizedKey] = normalizedValue;
      if (normalizedKey !== shaderPath || normalizedValue !== assoc) {
        migrated = true;
      }
    }
    this.settings.associations = normalizedData;
    if (migrated) {
      await this.saveSettings();
    }
    // Keep backward compatibility with old data property
    this.data = this.settings.associations;
    // Register custom views
    this.registerView(VIEW_TYPE_SHADER, leaf => {
      const view = new GdShaderView(leaf);
      view.plugin = this;
      return view;
    });
    this.registerView(VIEW_TYPE_IMAGE, leaf => {
      const view = new GdShaderImageView(leaf);
      view.plugin = this;
      return view;
    });
    // Register .gdshader extension to use the shader view
    this.registerExtensions(['gdshader'], VIEW_TYPE_SHADER);
    // Add settings tab
    this.addSettingTab(new GdshaderReaderSettingTab(this.app, this));
    // Apply custom styles
    this.applyStyles();
    // Watch for file rename events to update associations
    this.registerEvent(this.app.vault.on('rename', async (file, oldPath) => {
      if (!(file instanceof obsidian.TFile)) return;
      const newPath = normalizeVaultPath(file.path);
      const oldNormalizedPath = normalizeVaultPath(oldPath);
      let updated = false;
      if (this.data[oldNormalizedPath]) {
        this.data[newPath] = this.data[oldNormalizedPath];
        delete this.data[oldNormalizedPath];
        updated = true;
      }
      for (const shaderPath of Object.keys(this.data)) {
        const assocPath = this.data[shaderPath];
        if (assocPath === oldPath || assocPath === oldNormalizedPath) {
          this.data[shaderPath] = newPath;
          updated = true;
        }
      }
      if (updated) {
        this.settings.associations = this.data;
        await this.saveSettings();
      }
    }));
    
    // Watch for file open events to manage reference panel
    this.registerEvent(this.app.workspace.on('file-open', async (file) => {
      if (!file) {
        return;
      }
      
      // If a non-shader file is opened, close the image panel
      if (file.extension !== 'gdshader') {
        const imageLeaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_IMAGE);
        if (imageLeaves.length > 0) {
          imageLeaves.forEach(imageLeaf => imageLeaf.detach());
        }
      }
    }));
  }

  onunload() {
    console.log('Plugin gdshader-reader descargado');
    // Remove custom styles
    this.removeStyles();
    // Detach all custom view leaves
    for (let leaf of this.app.workspace.getLeavesOfType(VIEW_TYPE_SHADER)) {
      leaf.detach();
    }
    for (let leaf of this.app.workspace.getLeavesOfType(VIEW_TYPE_IMAGE)) {
      leaf.detach();
    }
  }

  applyStyles() {
    // Remove existing styles if any
    this.removeStyles();
    
    // Create style element
    this.styleEl = document.createElement('style');
    this.styleEl.id = 'gdshader-reader-styles';
    
    const styles = `
      /* GdShader Reader Custom Styles - Godot Engine Inspired */
      .gdshader-view .view-content {
        background-color: ${this.settings.backgroundColor} !important;
        color: ${this.settings.textColor} !important;
      }
      
      
      .gdshader-view .view-content code {
        color: ${this.settings.textColor} !important;
        font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      }
      
      /* GLSL Syntax Highlighting - Godot Style */
      .gdshader-view .token.keyword,
      .gdshader-view .token.control,
      .gdshader-view .token.type-keyword {
        color: ${this.settings.keywordColor} !important;
      }
      
      /* Directives (shader_type, render_mode) */
      .gdshader-view .token.directive {
        color: ${this.settings.directiveColor} !important;
      }
      
      .gdshader-view .token.function,
      .gdshader-view .token.function-name {
        color: ${this.settings.functionColor} !important;
      }
      
      /* Built-in constants (all caps) */
      .gdshader-view .token.constant,
      .gdshader-view .token.builtin {
        color: ${this.settings.builtInColor} !important;
      }
      
      /* Operators */
      .gdshader-view .token.operator {
        color: ${this.settings.operatorColor} !important;
      }
      
      /* Match all-caps words as built-ins */
      .gdshader-view .view-content code span:not(.token) {
        /* This will be handled by a regex pattern */
      }
      
      .gdshader-view .token.number,
      .gdshader-view .token.boolean {
        color: ${this.settings.numberColor} !important;
      }
      
      .gdshader-view .token.string {
        color: ${this.settings.stringColor} !important;
      }
      
      .gdshader-view .token.comment {
        color: ${this.settings.commentColor} !important;
        font-style: italic;
      }
      
      .gdshader-view .token.punctuation {
        color: ${this.settings.textColor} !important;
        opacity: 0.8;
      }
      
      /* Line numbers */
      .gdshader-view .view-content .line-numbers-rows {
        border-right: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      .gdshader-view .view-content .line-numbers-rows > span {
        color: ${this.settings.lineNumberColor} !important;
      }
      
      /* Selection */
      .gdshader-view .view-content ::selection {
        background-color: ${this.settings.selectionColor} !important;
      }
      
      .gdshader-view .view-content ::-moz-selection {
        background-color: ${this.settings.selectionColor} !important;
      }
      
      /* Image panel */
      .gdshader-image-view {
        background-color: ${this.settings.imagePanelBackground} !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: flex-start !important;
        justify-content: flex-start !important;
        padding: 1rem !important;
        gap: 1rem !important;
      }
      
      .gdshader-image-container {
        flex: 1 !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: flex-start !important;
        justify-content: flex-start !important;
        width: 100% !important;
        gap: 8px !important;
      }
      
      .gdshader-image-view img,
      .gdshader-image-view video {
        border-radius: 4px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
        max-width: 100%;
        object-fit: contain;
        align-self: center !important;
      }
      
      /* Button container below image */
      .gdshader-button-container {
        display: flex !important;
        gap: 8px !important;
        padding: 0 !important;
        justify-content: flex-start !important;
        align-items: center !important;
      }
      
      /* Button styles */
      .gdshader-btn {
        padding: 6px !important;
        border: 1px solid rgba(255, 255, 255, 0.2) !important;
        border-radius: 4px !important;
        background-color: rgba(255, 255, 255, 0.05) !important;
        color: ${this.settings.textColor} !important;
        cursor: pointer !important;
        transition: all 0.2s ease !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        width: 32px !important;
        height: 32px !important;
        font-size: 11px !important;
        font-weight: 500 !important;
      }
      
      .gdshader-btn svg {
        width: 18px !important;
        height: 18px !important;
        color: ${this.settings.textColor} !important;
      }
      
      .gdshader-btn:hover {
        background-color: rgba(255, 255, 255, 0.1) !important;
        border-color: rgba(255, 255, 255, 0.3) !important;
      }
      
      /* Loop button active state */
      .gdshader-loop-active {
        background-color: rgba(76, 175, 80, 0.2) !important;
        border-color: rgba(76, 175, 80, 0.5) !important;
      }
      
      .gdshader-loop-active:hover {
        background-color: rgba(76, 175, 80, 0.3) !important;
        border-color: rgba(76, 175, 80, 0.6) !important;
      }
      
      /* Shader view toolbar - Godot style */
      .gdshader-view .view-header {
        background-color: ${this.settings.backgroundColor} !important;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      /* Image panel toolbar */
      .gdshader-image-view .view-header {
        background-color: ${this.settings.imagePanelBackground} !important;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      /* Make toolbar action buttons visible in image panel */
      .gdshader-image-view .view-header .view-actions {
        display: flex !important;
      }
      
      .gdshader-image-view .view-header .view-action,
      .gdshader-image-view .clickable-icon {
        color: #ffffff !important;
        opacity: 1 !important;
      }
      
      .gdshader-image-view .view-header .view-action:hover,
      .gdshader-image-view .clickable-icon:hover {
        background-color: rgba(255, 255, 255, 0.2) !important;
      }
      
      .gdshader-image-view .view-header .view-action svg,
      .gdshader-image-view .clickable-icon svg {
        color: #ffffff !important;
        fill: #ffffff !important;
      }
      
      .gdshader-image-view .view-header .view-action svg path,
      .gdshader-image-view .clickable-icon svg path {
        fill: #ffffff !important;
        stroke: none !important;
      }
      
      /* Make shader view toolbar buttons visible */
      .gdshader-view .view-header .view-actions .view-action {
        color: #e0e0e0 !important;
        opacity: 0.8;
      }
      
      .gdshader-view .view-header .view-actions .view-action:hover {
        opacity: 1;
        background-color: rgba(255, 255, 255, 0.1);
      }
      
      /* Scrollbar styling to match Godot */
      .gdshader-view .view-content::-webkit-scrollbar {
        width: 10px;
        height: 10px;
      }
      
      .gdshader-view .view-content::-webkit-scrollbar-track {
        background: ${this.settings.backgroundColor};
      }
      
      .gdshader-view .view-content::-webkit-scrollbar-thumb {
        background: #505050;
        border-radius: 5px;
      }
      
      .gdshader-view .view-content::-webkit-scrollbar-thumb:hover {
        background: #606060;
      }
    `;
    
    this.styleEl.textContent = styles;
    document.head.appendChild(this.styleEl);
  }

  removeStyles() {
    if (this.styleEl) {
      this.styleEl.remove();
      this.styleEl = null;
    }
    // Also remove by ID in case of orphaned elements
    const existingStyle = document.getElementById('gdshader-reader-styles');
    if (existingStyle) {
      existingStyle.remove();
    }
  }

  openSettings() {
    // Open the plugin's settings tab in Obsidian preferences
    const setting = this.app.setting;
    if (setting && setting.openTabById) {
      setting.open();
      setting.openTabById(this.manifest.id);
    } else {
      new obsidian.Notice('Abra los ajustes de Obsidian para ver las opciones del plugin');
    }
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  applyColorPreset(presetName) {
    // Apply a color preset to current settings
    const preset = COLOR_PRESETS[presetName];
    if (!preset) {
      console.error(`Color preset "${presetName}" not found`);
      return;
    }
    
    this.settings.colorPreset = presetName;
    this.settings.backgroundColor = preset.backgroundColor;
    this.settings.textColor = preset.textColor;
    this.settings.keywordColor = preset.keywordColor;
    this.settings.directiveColor = preset.directiveColor;
    this.settings.functionColor = preset.functionColor;
    this.settings.numberColor = preset.numberColor;
    this.settings.stringColor = preset.stringColor;
    this.settings.commentColor = preset.commentColor;
    this.settings.builtInColor = preset.builtInColor;
    this.settings.operatorColor = preset.operatorColor;
    this.settings.imagePanelBackground = preset.imagePanelBackground;
    this.settings.lineNumberColor = preset.lineNumberColor;
    this.settings.selectionColor = preset.selectionColor;
  }
};
