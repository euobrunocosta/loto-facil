function generateLotofacilGroups() {
    const allNumbers = Array.from({ length: 25 }, (_, i) => 
        (i + 1).toString().padStart(2, '0')
    );

    const shuffle = (array) => {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    };

    const shuffledFullPool = shuffle(allNumbers);

    // 1. Pick 10 base numbers
    const baseNumbers = shuffledFullPool.slice(0, 10);
    const baseSet = new Set(baseNumbers);
    
    // 2. Remaining 15 numbers
    const remainingPool = shuffledFullPool.slice(10);

    // 3. Create the 3 groups
    const group1Extra = remainingPool.slice(0, 5);
    const group2Extra = remainingPool.slice(5, 10);
    const group3Extra = remainingPool.slice(10, 15);

    const createGroup = (extra) => {
        return [...baseNumbers, ...extra].sort((a, b) => parseInt(a) - parseInt(b));
    };

    return {
        baseSet,
        groups: [
            createGroup(group1Extra),
            createGroup(group2Extra),
            createGroup(group3Extra)
        ]
    };
}

let lastGeneratedGroups = null;
let currentDrawnNumbers = new Set();
let drawWarningTimeout;

function renderResults(data = null) {
    const resultsContainer = document.getElementById('results');
    
    // If no data provided, generate new ones
    const state = data || generateLotofacilGroups();
    const { baseSet, groups } = state;
    
    // Store for saving/matching
    lastGeneratedGroups = state;

    resultsContainer.innerHTML = '';

    groups.forEach((group, index) => {
        const hitsCount = group.filter(n => currentDrawnNumbers.has(n)).length;
        const card = document.createElement('div');
        const statusClass = hitsCount >= 11 ? ` status-${hitsCount}` : '';
        card.className = `group-card${statusClass}`;

        const header = document.createElement('div');
        header.className = 'group-header';
        header.innerHTML = `
            <span>Group ${index + 1}</span> 
            <span class="group-score-badge">${hitsCount} Hits</span>
        `;
        
        const grid = document.createElement('div');
        grid.className = 'number-grid';

        group.forEach((num, i) => {
            const isHit = currentDrawnNumbers.has(num);
            const ball = document.createElement('div');
            ball.className = `number-ball ${baseSet.has(num) ? 'is-base' : ''} ${isHit ? 'is-hit' : ''}`;
            ball.textContent = num;
            ball.style.animationDelay = `${i * 0.05}s`;
            grid.appendChild(ball);
        });

        card.appendChild(header);
        card.appendChild(grid);
        resultsContainer.appendChild(card);
    });

    updateGlobalBadge();
}

function updateGlobalBadge() {
    const count = currentDrawnNumbers.size;
    document.getElementById('matchCounter').textContent = `${count} / 15 Hits Selected`;
}

function showDrawWarning(msg) {
    const statusEl = document.getElementById('drawStatus');
    statusEl.innerHTML = `⚠️ ${msg}`;
    statusEl.classList.remove('hidden');
    
    clearTimeout(drawWarningTimeout);
    drawWarningTimeout = setTimeout(() => {
        statusEl.classList.add('hidden');
    }, 3000);
}

// Result Checker Logic with Smart Mask
function formatInputMask(e) {
    const input = e.target;
    let rawValue = input.value;
    
    // Check if the user just typed a space
    const endsWithSpace = rawValue.endsWith(' ');
    
    // Extract digit-only groups
    let parts = rawValue.match(/\d+/g) || [];
    let processedNumbers = [];
    let uniqueSeen = new Set();
    let warningMsg = null;

    for (let i = 0; i < parts.length; i++) {
        let part = parts[i];
        let subChunks = [];

        // If part is long, break it up
        if (part.length > 2) {
            for (let j = 0; j < part.length; j += 2) {
                subChunks.push(part.substring(j, j + 2));
            }
        } else {
            subChunks.push(part);
        }

        for (let num of subChunks) {
            if (processedNumbers.length >= 15) break;

            const isLastPart = (i === parts.length - 1) && (num === subChunks[subChunks.length - 1]);
            
            // Should we format/pad this number?
            // Yes IF: it's 2 digits OR it's a middle part OR user typed space after it
            if (num.length === 2 || !isLastPart || endsWithSpace) {
                num = num.padStart(2, '0');
                const val = parseInt(num);

                // Range Check
                if (val < 1 || val > 25) {
                    warningMsg = `"${num}" removed (must be 01-25).`;
                    continue;
                }

                // Duplicate Check
                if (uniqueSeen.has(num)) {
                    warningMsg = `"${num}" is a duplicate and was removed.`;
                    continue;
                }

                uniqueSeen.add(num);
                processedNumbers.push(num);
            } else {
                // User is still typing this 1st digit, keep it as is
                processedNumbers.push(num);
            }
        }
        if (processedNumbers.length >= 15) break;
    }

    if (warningMsg) showDrawWarning(warningMsg);
    
    // Join with spaces
    let resultValue = processedNumbers.join(' ');
    
    // If the user typed a space at the very end after a valid pair, keep a trailing space
    // to allow typing the next number immediately.
    if (endsWithSpace && processedNumbers.length > 0 && processedNumbers[processedNumbers.length - 1].length === 2) {
        resultValue += ' ';
    }
    
    input.value = resultValue;
    
    // Update highlighted hits (only complete 2-digit numbers)
    currentDrawnNumbers = new Set(
        processedNumbers.filter(n => n.length === 2)
    );

    if (lastGeneratedGroups) {
        renderResults(lastGeneratedGroups);
    }
}

function clearDraw() {
    document.getElementById('drawInput').value = '';
    currentDrawnNumbers = new Set();
    if (lastGeneratedGroups) {
        renderResults(lastGeneratedGroups);
    }
}

// History Management
function saveCurrentGroups() {
    if (!lastGeneratedGroups) return alert("Generate some numbers first!");

    const history = JSON.parse(localStorage.getItem('lotoHistory') || '[]');
    const now = new Date();
    
    const entry = {
        id: Date.now(),
        timestamp: now.toLocaleString(),
        dateLabel: now.toLocaleDateString(),
        timeLabel: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        data: {
            baseSet: Array.from(lastGeneratedGroups.baseSet),
            groups: lastGeneratedGroups.groups
        }
    };

    history.unshift(entry);
    localStorage.setItem('lotoHistory', JSON.stringify(history.slice(0, 20)));
    renderHistory();
}

function loadHistoryItem(id) {
    const history = JSON.parse(localStorage.getItem('lotoHistory') || '[]');
    const entry = history.find(e => e.id === id);
    if (entry) {
        const data = {
            baseSet: new Set(entry.data.baseSet),
            groups: entry.data.groups
        };
        renderResults(data);
        
        const statusEl = document.getElementById('validationStatus');
        statusEl.innerHTML = `📅 Restored from ${entry.timestamp}`;
        statusEl.className = 'validation-status info';
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function renderHistory() {
    const list = document.getElementById('historyList');
    const history = JSON.parse(localStorage.getItem('lotoHistory') || '[]');
    
    if (history.length === 0) {
        list.innerHTML = '<p class="empty-state">No saved combinations yet.</p>';
        return;
    }

    list.innerHTML = '';
    history.forEach(entry => {
        const item = document.createElement('div');
        item.className = 'history-item';
        item.onclick = () => loadHistoryItem(entry.id);
        
        item.innerHTML = `
            <span class="date">${entry.dateLabel}</span>
            <span class="time">${entry.timeLabel}</span>
        `;
        list.appendChild(item);
    });
}

function clearHistory() {
    if (confirm("Clear all saved history?")) {
        localStorage.removeItem('lotoHistory');
        renderHistory();
    }
}

// Manual Entry Logic
function toggleManualForm() {
    const form = document.getElementById('manualForm');
    form.classList.toggle('hidden');
}

function parseInputLine(text) {
    return text.split(/[,\s;]+/)
        .filter(n => n.length > 0)
        .map(n => n.padStart(2, '0'))
        .filter(n => parseInt(n) >= 1 && parseInt(n) <= 25)
        .sort((a, b) => parseInt(a) - parseInt(b));
}

function handleManualSubmit() {
    const g1 = parseInputLine(document.getElementById('manualG1').value);
    const g2 = parseInputLine(document.getElementById('manualG2').value);
    const g3 = parseInputLine(document.getElementById('manualG3').value);

    const errorEl = document.getElementById('validationStatus');

    if (g1.length !== 15 || g2.length !== 15 || g3.length !== 15) {
        errorEl.textContent = "Error: Each group must contain exactly 15 numbers.";
        errorEl.className = "validation-status warning";
        return;
    }

    const baseNumbers = g1.filter(num => g2.includes(num) && g3.includes(num));

    const manualData = {
        baseSet: new Set(baseNumbers),
        groups: [g1, g2, g3]
    };

    renderResults(manualData);
    errorEl.innerHTML = "✨ Imported manually.";
    errorEl.className = "validation-status success";
    toggleManualForm();
}

// Event Listeners
document.getElementById('generateBtn').addEventListener('click', () => {
    const statusEl = document.getElementById('validationStatus');
    statusEl.textContent = '';
    statusEl.className = 'validation-status';
    renderResults();
});

document.getElementById('drawInput').addEventListener('input', formatInputMask);
document.getElementById('clearDrawBtn').addEventListener('click', clearDraw);
document.getElementById('manualToggleBtn').addEventListener('click', toggleManualForm);
document.getElementById('cancelManualBtn').addEventListener('click', toggleManualForm);
document.getElementById('submitManualBtn').addEventListener('click', handleManualSubmit);
document.getElementById('saveBtn').addEventListener('click', saveCurrentGroups);
document.getElementById('clearHistoryBtn').addEventListener('click', clearHistory);

// Init
renderHistory();
renderResults(); // Show initial state
