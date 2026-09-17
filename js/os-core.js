/* ==========================================================================
   CARBON OS CORE SYSTEM ENGINE & WINDOW MANAGER
   ========================================================================== */

class CarbonCore {
  constructor() {
    this.windows = {};
    this.activeWindowId = null;
    this.highestZIndex = 100;
    this.dragTarget = null;
    this.dragOffset = { x: 0, y: 0 };

    this.init();
  }

  init() {
    document.addEventListener("DOMContentLoaded", () => {
      this.initClock();
      this.setupGlobalDragListeners();
      this.applySavedSettings();
      this.runBootSequence();
    });
  }

  /* ------------------------------------------------------------------------
     1. SYSTEM BOOT SEQUENCE
     ------------------------------------------------------------------------ */
  runBootSequence() {
    // Create boot screen overlay dynamically
    const bootOverlay = document.createElement("div");
    bootOverlay.id = "boot-screen";
    bootOverlay.className =
      "fixed inset-0 bg-black z-[9999] flex flex-col items-center justify-center transition-opacity duration-1000";
    bootOverlay.innerHTML = `
      <div class="flex flex-col items-center animate__animated animate__fadeIn">
        <div class="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-3xl font-extrabold text-white mb-4 shadow-2xl shadow-indigo-500/50">
          C
        </div>
        <h1 class="text-xl font-bold tracking-widest text-white mb-2">CARBON OS</h1>
        <div class="w-48 h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div id="boot-progress" class="h-full bg-indigo-500 w-0 transition-all duration-[2000ms] ease-out"></div>
        </div>
        <p class="text-xs text-gray-500 mt-4 tracking-wider">INITIALIZING SYSTEM ARCHITECTURE...</p>
      </div>
    `;
    document.body.appendChild(bootOverlay);

    // Trigger boot progress animation
    setTimeout(() => {
      const progressBar = document.getElementById("boot-progress");
      if (progressBar) progressBar.style.width = "100%";
    }, 100);

    // Fade out and remove boot screen after initialization
    setTimeout(() => {
      bootOverlay.style.opacity = "0";
      setTimeout(() => {
        bootOverlay.remove();
      }, 1000);
    }, 2200);
  }

  /* ------------------------------------------------------------------------
     2. SYSTEM CLOCK & SETTINGS APPLIER
     ------------------------------------------------------------------------ */
  initClock() {
    const updateTime = () => {
      const clockEl = document.getElementById("system-clock");
      if (clockEl) {
        const now = new Date();
        clockEl.textContent = now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit"
        });
      }
    };
    updateTime();
    setInterval(updateTime, 1000);
  }

  applySavedSettings() {
    if (window.carbonStorage) {
      const settings = window.carbonStorage.getSettings();
      const desktop = document.getElementById("desktop");
      if (desktop && settings.wallpaper) {
        desktop.style.background = settings.wallpaper;
      }
    }
  }

  /* ------------------------------------------------------------------------
     3. START MENU CONTROLS
     ------------------------------------------------------------------------ */
  toggleStartMenu() {
    const startMenu = document.getElementById("start-menu");
    if (startMenu) {
      startMenu.classList.toggle("hidden");
    }
  }

  closeStartMenu() {
    const startMenu = document.getElementById("start-menu");
    if (startMenu && !startMenu.classList.contains("hidden")) {
      startMenu.classList.add("hidden");
    }
  }

  /* ------------------------------------------------------------------------
     4. DYNAMIC APPLICATION WINDOW MANAGER
     ------------------------------------------------------------------------ */
  openApp(appId) {
    this.closeStartMenu();

    // If window already exists, restore and focus it
    if (this.windows[appId]) {
      this.restoreWindow(appId);
      this.focusWindow(appId);
      return;
    }

    // App configurations
    const appConfigs = {
      filemanager: { title: "Files", icon: "folder", width: 600, height: 400 },
      texteditor: { title: "Notepad", icon: "file-text", width: 550, height: 420 },
      calculator: { title: "Calculator", icon: "calculator", width: 320, height: 440 },
      terminal: { title: "Terminal", icon: "terminal", width: 580, height: 380 },
      settings: { title: "Settings", icon: "settings", width: 500, height: 380 }
    };

    const config = appConfigs[appId] || { title: appId, icon: "app", width: 480, height: 350 };

    // Create Window Element
    const win = document.createElement("div");
    win.id = `win-${appId}`;
    win.className = "carbon-window active animate__animated animate__zoomIn animate__faster";
    win.style.width = `${config.width}px`;
    win.style.height = `${config.height}px`;
    win.style.left = `${Math.max(40, Math.random() * (window.innerWidth - config.width - 100))}px`;
    win.style.top = `${Math.max(40, Math.random() * (window.innerHeight - config.height - 100))}px`;
    win.style.zIndex = ++this.highestZIndex;

    win.innerHTML = `
      <div class="window-header" onmousedown="CarbonOS.startDrag(event, '${appId}')">
        <div class="window-title">
          <i data-lucide="${config.icon}" class="w-4 h-4"></i>
          <span>${config.title}</span>
        </div>
        <div class="window-controls">
          <button class="window-control-btn btn-minimize" onclick="CarbonOS.minimizeWindow('${appId}')"></button>
          <button class="window-control-btn btn-maximize" onclick="CarbonOS.maximizeWindow('${appId}')"></button>
          <button class="window-control-btn btn-close" onclick="CarbonOS.closeWindow('${appId}')"></button>
        </div>
      </div>
      <div class="window-body" id="body-${appId}">
        <!-- App content injected by app module -->
      </div>
    `;

    win.addEventListener("mousedown", () => this.focusWindow(appId));

    const container = document.getElementById("window-container");
    if (container) container.appendChild(win);

    this.windows[appId] = { element: win, isMaximized: false, isMinimized: false };
    this.focusWindow(appId);
    this.addTaskbarIcon(appId, config);

    // Render icons inside the new window
    if (window.lucide) lucide.createIcons();

    // Trigger app rendering logic if app script is loaded
    if (window[`render_${appId}`]) {
      window[`render_${appId}`](`body-${appId}`);
    }
  }

  focusWindow(appId) {
    if (!this.windows[appId]) return;

    Object.keys(this.windows).forEach((id) => {
      if (this.windows[id] && this.windows[id].element) {
        this.windows[id].element.classList.remove("active");
      }
    });

    const targetWin = this.windows[appId].element;
    targetWin.classList.add("active");
    targetWin.style.zIndex = ++this.highestZIndex;
    this.activeWindowId = appId;

    this.updateTaskbarState();
  }

  minimizeWindow(appId) {
    if (!this.windows[appId]) return;
    const win = this.windows[appId];
    win.element.classList.add("minimized");
    win.isMinimized = true;
    this.updateTaskbarState();
  }

  restoreWindow(appId) {
    if (!this.windows[appId]) return;
    const win = this.windows[appId];
    win.element.classList.remove("minimized");
    win.isMinimized = false;
  }

  maximizeWindow(appId) {
    if (!this.windows[appId]) return;
    const win = this.windows[appId];
    if (win.isMaximized) {
      win.element.style.top = win.oldTop;
      win.element.style.left = win.oldLeft;
      win.element.style.width = win.oldWidth;
      win.element.style.height = win.oldHeight;
      win.isMaximized = false;
    } else {
      win.oldTop = win.element.style.top;
      win.oldLeft = win.element.style.left;
      win.oldWidth = win.element.style.width;
      win.oldHeight = win.element.style.height;

      win.element.style.top = "0px";
      win.element.style.left = "0px";
      win.element.style.width = "100vw";
      win.element.style.height = "calc(100vh - 48px)";
      win.isMaximized = true;
    }
  }

  closeWindow(appId) {
    if (!this.windows[appId]) return;
    this.windows[appId].element.remove();
    delete this.windows[appId];
    this.removeTaskbarIcon(appId);
  }

  /* ------------------------------------------------------------------------
     5. WINDOW DRAGGING LOGIC
     ------------------------------------------------------------------------ */
  startDrag(e, appId) {
    if (this.windows[appId].isMaximized) return;
    this.dragTarget = this.windows[appId].element;
    this.dragOffset.x = e.clientX - this.dragTarget.offsetLeft;
    this.dragOffset.y = e.clientY - this.dragTarget.offsetTop;
    this.focusWindow(appId);
  }

  setupGlobalDragListeners() {
    document.addEventListener("mousemove", (e) => {
      if (this.dragTarget) {
        this.dragTarget.style.left = `${e.clientX - this.dragOffset.x}px`;
        this.dragTarget.style.top = `${e.clientY - this.dragOffset.y}px`;
      }
    });

    document.addEventListener("mouseup", () => {
      this.dragTarget = null;
    });
  }

  /* ------------------------------------------------------------------------
     6. TASKBAR APP INDICATORS
     ------------------------------------------------------------------------ */
  addTaskbarIcon(appId, config) {
    const runningContainer = document.getElementById("running-apps");
    if (!runningContainer || document.getElementById(`task-${appId}`)) return;

    const taskBtn = document.createElement("button");
    taskBtn.id = `task-${appId}`;
    taskBtn.className =
      "taskbar-app-icon p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition flex items-center justify-center";
    taskBtn.innerHTML = `<i data-lucide="${config.icon}" class="w-4 h-4"></i>`;
    taskBtn.onclick = () => {
      if (this.windows[appId].isMinimized) {
        this.restoreWindow(appId);
        this.focusWindow(appId);
      } else if (this.activeWindowId === appId) {
        this.minimizeWindow(appId);
      } else {
        this.focusWindow(appId);
      }
    };

    runningContainer.appendChild(taskBtn);
    if (window.lucide) lucide.createIcons();
  }

  removeTaskbarIcon(appId) {
    const taskBtn = document.getElementById(`task-${appId}`);
    if (taskBtn) taskBtn.remove();
  }

  updateTaskbarState() {
    Object.keys(this.windows).forEach((id) => {
      const taskBtn = document.getElementById(`task-${id}`);
      if (taskBtn) {
        if (this.activeWindowId === id && !this.windows[id].isMinimized) {
          taskBtn.classList.add("active", "bg-white/15");
        } else {
          taskBtn.classList.remove("active", "bg-white/15");
        }
      }
    });
  }
}

// Instantiate System Global
window.CarbonOS = new CarbonCore();
