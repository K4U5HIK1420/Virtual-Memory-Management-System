// Theme and Chatbot (unchanged)
document.getElementById("themeToggle").addEventListener("click", function () {
    const body = document.body;
    if (body.classList.contains("theme-light")) {
        body.classList.remove("theme-light");
        body.classList.add("theme-dark");
    } else {
        body.classList.remove("theme-dark");
        body.classList.add("theme-light");
    }
});

document.getElementById("chatbotToggle").addEventListener("click", function () {
    document.getElementById("chatbox").classList.toggle("hidden");
});

document.getElementById("sendChat").addEventListener("click", function () {
    const input = document.getElementById("chatInput").value;
    if (input.trim() !== "") {
        const chatMessages = document.getElementById("chatMessages");

        const userMessage = document.createElement("div");
        userMessage.classList.add("p-2", "bg-blue-500", "text-white", "rounded-lg", "mb-2", "self-end", "w-fit");
        userMessage.innerText = "You: " + input;
        chatMessages.appendChild(userMessage);

        setTimeout(() => {
            const botResponse = document.createElement("div");
            botResponse.classList.add("p-2", "bg-gray-300", "rounded-lg", "mb-2", "self-start", "w-fit");
            botResponse.innerText = "Bot: " + getBotResponse(input);
            chatMessages.appendChild(botResponse);
        }, 1000);

        document.getElementById("chatInput").value = "";
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
});

function getBotResponse(input) {
    const responses = {
        "FIFO": "Replaces the oldest page in memory. Simple but not always efficient.",
        "LRU": "Replaces least recently used pages. Better for temporal locality.",
        "Optimal": "Theoretical best (replaces pages not needed longest). Impossible to implement perfectly.",
        "LFU": "Counts page usage frequency. Good for stable workloads.",
        "Second Chance": "Gives pages another chance via reference bit. FIFO improvement.",
        "page fault": "Occurs when a requested page isn't in RAM (costly operation)."
    };
    return responses[input] || "Ask about: FIFO, LRU, Optimal, LFU, Second Chance, or page faults";
}

// Main Simulation Function
document.getElementById("runSimulation").addEventListener("click", function () {
    const frames = parseInt(document.getElementById("frames").value);
    const pageRequests = document.getElementById("pageRequests").value.split(",").map(num => parseInt(num.trim()));
    
    if (isNaN(frames) || frames <= 0 || pageRequests.some(isNaN)) {
        alert("Please enter valid inputs (e.g., '1,2,3,4')");
        return;
    }

    // Run all algorithms
    const results = {
        "FIFO": simulateFIFO(pageRequests, frames),
        "LRU": simulateLRU(pageRequests, frames),
        "Optimal": simulateOptimal(pageRequests, frames),
        "Second Chance": secondChance(pageRequests, frames),
        "LFU": simulateLFU(pageRequests, frames)
    };

    displayResults(results, pageRequests.length);
});

function displayResults(results, totalPages) {
    const table = document.getElementById("resultsTable");
    table.innerHTML = "";
    
    let bestAlgorithm = "";
    let minFaults = Infinity;
    
    // Update metrics and find best algorithm
    let totalFaults = 0;
    let totalHits = 0;
    
    for (const [name, data] of Object.entries(results)) {
        if (data.pageFaults < minFaults) {
            minFaults = data.pageFaults;
            bestAlgorithm = name;
        }
        
        totalFaults += data.pageFaults;
        totalHits += data.tlbHits;
        
        const row = document.createElement("tr");
        row.className = "border-b hover:bg-gray-50";
        row.innerHTML = `
            <td class="p-3 font-medium">${name}</td>
            <td class="p-3 text-center">${data.pageFaults}</td>
            <td class="p-3 text-center">${(data.pageFaults/totalPages*100).toFixed(1)}%</td>
            <td class="p-3 text-center">${data.tlbHits}</td>
            <td class="p-3 text-center">${data.memoryUtilization}%</td>
            <td class="p-3 text-center">${data.swapIO}</td>
        `;
        table.appendChild(row);
    }
    
    // Update summary metrics
    document.getElementById("metric-faults").textContent = totalFaults;
    document.getElementById("metric-fault-rate").textContent = `${(totalFaults/(Object.keys(results).length*totalPages)*100).toFixed(1)}%`;
    document.getElementById("metric-tlb-hit").textContent = `${(totalHits/(totalHits+totalFaults)*100).toFixed(1)}%`;
    document.getElementById("metric-memory").textContent = "100%";
    document.getElementById("metric-swap").textContent = totalFaults * 2;
    
    // Show results
    document.getElementById("simulationResults").classList.remove("hidden");
    renderChart(results);
}

function renderChart(results) {
    const ctx = document.createElement("canvas");
    document.getElementById("chartContainer").innerHTML = "";
    document.getElementById("chartContainer").appendChild(ctx);
    
    new Chart(ctx, {
        type: "bar",
        data: {
            labels: Object.keys(results),
            datasets: [{
                label: "Page Faults",
                data: Object.values(results).map(r => r.pageFaults),
                backgroundColor: [
                    "#3b82f6",
                    "#ef4444",
                    "#10b981",
                    "#f59e0b",
                    "#8b5cf6"
                ],
                borderColor: [
                    "#2563eb",
                    "#dc2626",
                    "#059669",
                    "#d97706",
                    "#7c3aed"
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "Page Faults"
                    }
                }
            }
        }
    });
}

// Algorithm Implementations

// FIFO Algorithm
function simulateFIFO(pages, frameCount) {
    let frames = [];
    let pageFaults = 0;
    let tlbHits = 0;
    let tlbMisses = 0;

    for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        
        if (Math.random() > 0.5 && frames.includes(page)) {
            tlbHits++;
            continue;
        }
        
        tlbMisses++;
        
        if (!frames.includes(page)) {
            pageFaults++;
            if (frames.length === frameCount) {
                frames.shift();
            }
            frames.push(page);
        }
    }

    return {
        pageFaults,
        tlbHits,
        tlbMisses,
        memoryUtilization: 100,
        swapIO: pageFaults * 2
    };
}

// LRU Algorithm
function simulateLRU(pages, frameCount) {
    let frames = [];
    let recent = new Map();
    let pageFaults = 0;
    let tlbHits = 0;
    let tlbMisses = 0;

    for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        
        if (Math.random() > 0.5 && frames.includes(page)) {
            tlbHits++;
            recent.set(page, i);
            continue;
        }
        
        tlbMisses++;
        
        if (!frames.includes(page)) {
            pageFaults++;
            if (frames.length === frameCount) {
                let lruPage = [...recent.entries()].sort((a, b) => a[1] - b[1])[0][0];
                frames.splice(frames.indexOf(lruPage), 1);
                recent.delete(lruPage);
            }
            frames.push(page);
        }
        recent.set(page, i);
    }

    return {
        pageFaults,
        tlbHits,
        tlbMisses,
        memoryUtilization: 100,
        swapIO: pageFaults * 2
    };
}

// Optimal Algorithm
function simulateOptimal(pages, frameCount) {
    let frames = [];
    let pageFaults = 0;
    let tlbHits = 0;
    let tlbMisses = 0;

    for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        
        if (Math.random() > 0.5 && frames.includes(page)) {
            tlbHits++;
            continue;
        }
        
        tlbMisses++;
        
        if (!frames.includes(page)) {
            pageFaults++;
            if (frames.length === frameCount) {
                let futureIndices = frames.map(p => {
                    let idx = pages.slice(i + 1).indexOf(p);
                    return idx === -1 ? Infinity : idx;
                });
                let replaceIndex = futureIndices.indexOf(Math.max(...futureIndices));
                frames[replaceIndex] = page;
            } else {
                frames.push(page);
            }
        }
    }

    return {
        pageFaults,
        tlbHits,
        tlbMisses,
        memoryUtilization: 100,
        swapIO: pageFaults * 2
    };
}

// Second Chance Algorithm
function secondChance(pages, framesCount) {
    let frames = Array(framesCount).fill(null);
    let referenceBits = Array(framesCount).fill(0);
    let pointer = 0;
    let pageFaults = 0;
    let tlbHits = 0;
    let tlbMisses = 0;

    for (let i = 0; i < pages.length; i++) {
        let page = pages[i];
        
        if (Math.random() > 0.5 && frames.includes(page)) {
            tlbHits++;
            let index = frames.indexOf(page);
            referenceBits[index] = 1;
            continue;
        }
        
        tlbMisses++;
        
        if (frames.includes(page)) {
            let index = frames.indexOf(page);
            referenceBits[index] = 1;
        } else {
            while (true) {
                if (referenceBits[pointer] === 0) {
                    frames[pointer] = page;
                    referenceBits[pointer] = 1;
                    pointer = (pointer + 1) % framesCount;
                    break;
                } else {
                    referenceBits[pointer] = 0;
                    pointer = (pointer + 1) % framesCount;
                }
            }
            pageFaults++;
        }
    }

    return {
        pageFaults,
        tlbHits,
        tlbMisses,
        memoryUtilization: 100,
        swapIO: pageFaults * 2
    };
}

// LFU Algorithm
function simulateLFU(pages, frameCount) {
    let frames = [];
    let frequency = new Map();
    let pageFaults = 0;
    let tlbHits = 0;
    let tlbMisses = 0;

    for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        
        if (Math.random() > 0.5 && frames.includes(page)) {
            tlbHits++;
            frequency.set(page, (frequency.get(page) || 0) + 1);
            continue;
        }
        
        tlbMisses++;
        
        if (!frames.includes(page)) {
            pageFaults++;
            if (frames.length === frameCount) {
                let lfuPage = frames.reduce((a, b) => 
                    (frequency.get(a) || 0) < (frequency.get(b) || 0) ? a : b
                );
                frames.splice(frames.indexOf(lfuPage), 1);
                frequency.delete(lfuPage);
            }
            frames.push(page);
            frequency.set(page, 1);
        } else {
            frequency.set(page, (frequency.get(page) || 0) + 1);
        }
    }

    return {
        pageFaults,
        tlbHits,
        tlbMisses,
        memoryUtilization: 100,
        swapIO: pageFaults * 2
    };
}