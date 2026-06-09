const arrayContainer = document.getElementById('array-container');
const generateBtn = document.getElementById('generate-btn');
const sizeSlider = document.getElementById('size-slider');
const speedSlider = document.getElementById('speed-slider');
const bubbleSortBtn = document.getElementById('bubble-sort-btn');
const selectionSortBtn = document.getElementById('selection-sort-btn');
const algoInfoCard = document.getElementById('algorithm-info');
const algoNameEl = document.getElementById('algo-name');
const algoTimeEl = document.getElementById('algo-time');
const algoSpaceEl = document.getElementById('algo-space');

let array = [];
let bars = [];
let isSorting = false;
let delayMs = 500;
let arraySize = 50;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function init() {
  arraySize = parseInt(sizeSlider.value);
  delayMs = parseInt(speedSlider.value);
  generateArray();
  
  sizeSlider.addEventListener('input', () => {
    arraySize = parseInt(sizeSlider.value);
    generateArray();
  });
  
  speedSlider.addEventListener('input', () => {
    delayMs = parseInt(speedSlider.value);
  });
  
  generateBtn.addEventListener('click', generateArray);
  bubbleSortBtn.addEventListener('click', bubbleSort);
  selectionSortBtn.addEventListener('click', selectionSort);
}

function setControlsDisabled(disabled) {
  isSorting = disabled;
  generateBtn.disabled = disabled;
  sizeSlider.disabled = disabled;
  bubbleSortBtn.disabled = disabled;
  selectionSortBtn.disabled = disabled;
}

function generateArray() {
  if (isSorting) return;
  
  arrayContainer.innerHTML = '';
  array = [];
  bars = [];
  
  for (let i = 0; i < arraySize; i++) {
    // Generate value between 10 and 100 for height percentage
    const value = Math.floor(Math.random() * 90) + 10;
    array.push(value);
    
    const bar = document.createElement('div');
    bar.classList.add('bar');
    bar.style.height = `${value}%`;
    bar.style.flex = '1';
    bar.style.backgroundColor = 'var(--color-default)';
    
    arrayContainer.appendChild(bar);
    bars.push(bar);
  }
  
  algoInfoCard.classList.add('hidden');
}

function showAlgorithmInfo(name, time, space) {
  algoNameEl.textContent = name;
  algoTimeEl.textContent = time;
  algoSpaceEl.textContent = space;
  algoInfoCard.classList.remove('hidden');
}

async function bubbleSort() {
  if (isSorting) return;
  setControlsDisabled(true);
  showAlgorithmInfo('Bubble Sort', 'O(n²)', 'O(1)');
  
  const n = array.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      // Highlight compared bars
      bars[j].style.backgroundColor = 'var(--color-comparing)';
      bars[j+1].style.backgroundColor = 'var(--color-comparing)';
      
      await sleep(delayMs);
      
      if (array[j] > array[j+1]) {
        // Highlight swapping
        bars[j].style.backgroundColor = 'var(--color-swapping)';
        bars[j+1].style.backgroundColor = 'var(--color-swapping)';
        
        await sleep(delayMs);
        
        // Swap values
        let temp = array[j];
        array[j] = array[j+1];
        array[j+1] = temp;
        
        // Swap heights
        bars[j].style.height = `${array[j]}%`;
        bars[j+1].style.height = `${array[j+1]}%`;
      }
      
      // Revert colors
      bars[j].style.backgroundColor = 'var(--color-default)';
      bars[j+1].style.backgroundColor = 'var(--color-default)';
    }
    // Mark sorted element
    bars[n - i - 1].style.backgroundColor = 'var(--color-sorted)';
  }
  // Mark the first element as sorted
  bars[0].style.backgroundColor = 'var(--color-sorted)';
  
  setControlsDisabled(false);
}

async function selectionSort() {
  if (isSorting) return;
  setControlsDisabled(true);
  showAlgorithmInfo('Selection Sort', 'O(n²)', 'O(1)');
  
  const n = array.length;
  for (let i = 0; i < n; i++) {
    let minIndex = i;
    bars[minIndex].style.backgroundColor = 'var(--color-minimum)';
    
    for (let j = i + 1; j < n; j++) {
      // Highlight current scanning element
      bars[j].style.backgroundColor = 'var(--color-comparing)';
      
      await sleep(delayMs);
      
      if (array[j] < array[minIndex]) {
        if (minIndex !== i) {
          bars[minIndex].style.backgroundColor = 'var(--color-default)';
        }
        minIndex = j;
        bars[minIndex].style.backgroundColor = 'var(--color-minimum)';
      } else {
        bars[j].style.backgroundColor = 'var(--color-default)';
      }
    }
    
    if (minIndex !== i) {
      bars[i].style.backgroundColor = 'var(--color-swapping)';
      bars[minIndex].style.backgroundColor = 'var(--color-swapping)';
      
      await sleep(delayMs);
      
      let temp = array[i];
      array[i] = array[minIndex];
      array[minIndex] = temp;
      
      bars[i].style.height = `${array[i]}%`;
      bars[minIndex].style.height = `${array[minIndex]}%`;
    }
    
    if (minIndex !== i) {
      bars[minIndex].style.backgroundColor = 'var(--color-default)';
    }
    bars[i].style.backgroundColor = 'var(--color-sorted)';
  }
  
  setControlsDisabled(false);
}

// Initialize on page load
window.onload = init;
