/* ==========================================================================
   CARBON OS SYSTEM APPLICATION: CALCULATOR
   ========================================================================== */

function render_calculator(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div class="p-4 flex flex-col h-full bg-gray-950 text-white select-none">
      
      <!-- Calculator Display -->
      <div class="mb-4 p-3 bg-gray-900 border border-gray-800 rounded-xl text-right flex flex-col justify-end h-20 overflow-hidden shadow-inner">
        <div id="calc-history" class="text-xs text-gray-500 h-4 overflow-hidden tracking-wider mb-1"></div>
        <div id="calc-display" class="text-2xl font-mono font-bold text-indigo-400 truncate">0</div>
      </div>

      <!-- Calculator Buttons Grid -->
      <div class="calc-grid flex-1">
        <button class="calc-btn text-red-400" onclick="CarbonCalc.clear()">C</button>
        <button class="calc-btn text-gray-400" onclick="CarbonCalc.backspace()">⌫</button>
        <button class="calc-btn text-indigo-400" onclick="CarbonCalc.append('%')">%</button>
        <button class="calc-btn accent" onclick="CarbonCalc.append('/')">÷</button>

        <button class="calc-btn" onclick="CarbonCalc.append('7')">7</button>
        <button class="calc-btn" onclick="CarbonCalc.append('8')">8</button>
        <button class="calc-btn" onclick="CarbonCalc.append('9')">9</button>
        <button class="calc-btn accent" onclick="CarbonCalc.append('*')">×</button>

        <button class="calc-btn" onclick="CarbonCalc.append('4')">4</button>
        <button class="calc-btn" onclick="CarbonCalc.append('5')">5</button>
        <button class="calc-btn" onclick="CarbonCalc.append('6')">6</button>
        <button class="calc-btn accent" onclick="CarbonCalc.append('-')">-</button>

        <button class="calc-btn" onclick="CarbonCalc.append('1')">1</button>
        <button class="calc-btn" onclick="CarbonCalc.append('2')">2</button>
        <button class="calc-btn" onclick="CarbonCalc.append('3')">3</button>
        <button class="calc-btn accent" onclick="CarbonCalc.append('+')">+</button>

        <button class="calc-btn col-span-2" onclick="CarbonCalc.append('0')">0</button>
        <button class="calc-btn" onclick="CarbonCalc.append('.')">.</button>
        <button class="calc-btn bg-emerald-600 hover:bg-emerald-500 text-white" onclick="CarbonCalc.calculate()">=</button>
      </div>

    </div>
  `;
}

class CalculatorEngine {
  constructor() {
    this.currentInput = "0";
    this.history = "";
    this.shouldResetInput = false;
  }

  getDisplay() {
    return document.getElementById("calc-display");
  }

  getHistory() {
    return document.getElementById("calc-history");
  }

  updateDisplay() {
    const disp = this.getDisplay();
    const hist = this.getHistory();
    if (disp) disp.textContent = this.currentInput;
    if (hist) hist.textContent = this.history;
  }

  append(val) {
    if (this.currentInput === "0" || this.shouldResetInput) {
      if (val === ".") {
        this.currentInput = "0.";
      } else if (["+", "-", "*", "/", "%"].includes(val)) {
        this.currentInput += val;
      } else {
        this.currentInput = val;
      }
      this.shouldResetInput = false;
    } else {
      const lastChar = this.currentInput.slice(-1);
      if (["+", "-", "*", "/", "%"].includes(lastChar) && ["+", "-", "*", "/", "%"].includes(val)) {
        this.currentInput = this.currentInput.slice(0, -1) + val;
      } else {
        this.currentInput += val;
      }
    }
    this.updateDisplay();
  }

  clear() {
    this.currentInput = "0";
    this.history = "";
    this.updateDisplay();
  }

  backspace() {
    if (this.currentInput.length > 1) {
      this.currentInput = this.currentInput.slice(0, -1);
    } else {
      this.currentInput = "0";
    }
    this.updateDisplay();
  }

  calculate() {
    try {
      this.history = this.currentInput + " =";
      const sanitized = this.currentInput.replace(/%/g, "/100");
      const result = Function(`'use strict'; return (${sanitized})`)();
      
      this.currentInput = String(Number.isInteger(result) ? result : parseFloat(result.toFixed(8)));
      this.shouldResetInput = true;
    } catch (e) {
      this.currentInput = "Error";
      this.shouldResetInput = true;
    }
    this.updateDisplay();
  }
}

// Global Calculator Instance
window.CarbonCalc = new CalculatorEngine();
