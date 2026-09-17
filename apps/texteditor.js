/* ==========================================================================
   CARBON OS SYSTEM APPLICATION: TEXT EDITOR (NOTEPAD)
   ========================================================================== */

function render_texteditor(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Load default or saved file content from storage engine
  let initialContent = "";
  if (window.carbonStorage) {
    initialContent = window.carbonStorage.readFile("welcome.txt") || "";
  }

  container.innerHTML = `
    <div class="flex flex-col h-full bg-gray-950 text-white font-sans">
      
      <!-- Top Action Toolbar -->
      <div class="flex items-center justify-between px-3 py-2 bg-gray-900 border-b border-gray-800 text-xs">
        <div class="flex items-center gap-2">
          <input id="notepad-filename" type="text" value="welcome.txt" 
                 class="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 w-36">
          <button onclick="CarbonNotepad.save()" 
                  class="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1 rounded transition">
            <i data-lucide="save" class="w-3.5 h-3.5"></i> Save
          </button>
          <button onclick="CarbonNotepad.load()" 
                  class="flex items-center gap-1 bg-gray-800 hover:bg-gray-700 text-gray-300 px-2.5 py-1 rounded transition">
            <i data-lucide="folder-open" class="w-3.5 h-3.5"></i> Open
          </button>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="CarbonNotepad.clear()" 
                  class="text-gray-400 hover:text-red-400 transition">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
      </div>

      <!-- Main Textarea Editor -->
      <textarea id="notepad-textarea" 
                class="flex-1 w-full p-4 bg-gray-950 text-gray-200 font-mono text-sm resize-none focus:outline-none leading-relaxed border-none"
                placeholder="Type your notes or code here..."
                oninput="CarbonNotepad.updateStats()">${initialContent}</textarea>

      <!-- Bottom Status Bar -->
      <div class="flex items-center justify-between px-4 py-1.5 bg-gray-900 border-t border-gray-800 text-[11px] text-gray-400">
        <span id="notepad-status">Ready</span>
        <div class="flex gap-4">
          <span id="notepad-words">Words: 0</span>
          <span id="notepad-chars">Chars: 0</span>
        </div>
      </div>

    </div>
  `;

  if (window.lucide) lucide.createIcons();
  CarbonNotepad.updateStats();
}

class NotepadEngine {
  save() {
    const filenameEl = document.getElementById("notepad-filename");
    const textEl = document.getElementById("notepad-textarea");
    const statusEl = document.getElementById("notepad-status");

    if (!filenameEl || !textEl) return;

    const filename = filenameEl.value.trim() || "untitled.txt";
    const content = textEl.value;

    if (window.carbonStorage) {
      const success = window.carbonStorage.saveFile(filename, content);
      if (statusEl) {
        statusEl.textContent = success ? `Saved "${filename}"` : "Error saving file";
        statusEl.className = success ? "text-emerald-400" : "text-red-400";
        setTimeout(() => {
          statusEl.textContent = "Ready";
          statusEl.className = "text-gray-400";
        }, 2000);
      }
    }
  }

  load() {
    const filenameEl = document.getElementById("notepad-filename");
    const textEl = document.getElementById("notepad-textarea");
    const statusEl = document.getElementById("notepad-status");

    if (!filenameEl || !textEl) return;

    const filename = filenameEl.value.trim();
    if (window.carbonStorage) {
      const content = window.carbonStorage.readFile(filename);
      if (content !== null) {
        textEl.value = content;
        this.updateStats();
        if (statusEl) {
          statusEl.textContent = `Loaded "${filename}"`;
          statusEl.className = "text-emerald-400";
          setTimeout(() => {
            statusEl.textContent = "Ready";
            statusEl.className = "text-gray-400";
          }, 2000);
        }
      } else {
        if (statusEl) {
          statusEl.textContent = "File not found";
          statusEl.className = "text-red-400";
        }
      }
    }
  }

  clear() {
    const textEl = document.getElementById("notepad-textarea");
    if (textEl) {
      textEl.value = "";
      this.updateStats();
    }
  }

  updateStats() {
    const textEl = document.getElementById("notepad-textarea");
    const wordsEl = document.getElementById("notepad-chars");
    const charsEl = document.getElementById("notepad-words");

    if (!textEl) return;

    const val = textEl.value;
    const chars = val.length;
    const words = val.trim() ? val.trim().split(/\s+/).length : 0;

    if (charsEl) charsEl.textContent = `Words: ${words}`;
    if (wordsEl) wordsEl.textContent = `Chars: ${chars}`;
  }
}

// Global Notepad Instance
window.CarbonNotepad = new NotepadEngine();
