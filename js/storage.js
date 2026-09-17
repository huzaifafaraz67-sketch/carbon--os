/* ==========================================================================
   CARBON OS VIRTUAL FILE SYSTEM & STORAGE ENGINE
   ========================================================================== */

class CarbonStorage {
  constructor() {
    this.STORAGE_KEY = 'CARBON_OS_VFS_V1';
    this.SETTINGS_KEY = 'CARBON_OS_SETTINGS_V1';
    this.init();
  }

  // Initialize storage structures if not present
  init() {
    if (!localStorage.getItem(this.STORAGE_KEY)) {
      const defaultFileSystem = {
        'root': {
          type: 'directory',
          name: 'root',
          children: {
            'Documents': {
              type: 'directory',
              name: 'Documents',
              children: {
                'welcome.txt': {
                  type: 'file',
                  name: 'welcome.txt',
                  content: 'Welcome to Carbon OS!\nThis is your personal virtual text editor.'
                }
              }
            },
            'Pictures': {
              type: 'directory',
              name: 'Pictures',
              children: {}
            },
            'Desktop': {
              type: 'directory',
              name: 'Desktop',
              children: {}
            }
          }
        }
      };
      this.saveVFS(defaultFileSystem);
    }

    if (!localStorage.getItem(this.SETTINGS_KEY)) {
      const defaultSettings = {
        theme: 'dark',
        wallpaper: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #090d16 100%)',
        accentColor: '#6366f1'
      };
      this.saveSettings(defaultSettings);
    }
  }

  // Fetch Virtual File System Object
  getVFS() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY));
    } catch (e) {
      console.error('Error reading VFS:', e);
      return null;
    }
  }

  // Save Virtual File System Object
  saveVFS(vfsData) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(vfsData));
      return true;
    } catch (e) {
      console.error('Error saving VFS:', e);
      return false;
    }
  }

  // Fetch Settings Object
  getSettings() {
    try {
      return JSON.parse(localStorage.getItem(this.SETTINGS_KEY));
    } catch (e) {
      return {};
    }
  }

  // Save Settings Object
  saveSettings(settingsData) {
    try {
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settingsData));
      return true;
    } catch (e) {
      return false;
    }
  }

  // Write or update a file in a given directory path
  saveFile(fileName, content, dirPath = ['root', 'Documents']) {
    const vfs = this.getVFS();
    let current = vfs;

    for (const folder of dirPath) {
      if (current[folder] && current[folder].children) {
        current = current[folder].children;
      } else {
        return false;
      }
    }

    current[fileName] = {
      type: 'file',
      name: fileName,
      content: content,
      updatedAt: new Date().toISOString()
    };

    return this.saveVFS(vfs);
  }

  // Read file content
  readFile(fileName, dirPath = ['root', 'Documents']) {
    const vfs = this.getVFS();
    let current = vfs;

    for (const folder of dirPath) {
      if (current[folder] && current[folder].children) {
        current = current[folder].children;
      } else {
        return null;
      }
    }

    return current[fileName] ? current[fileName].content : null;
  }
}

// Global Storage Instance
window.carbonStorage = new CarbonStorage();
