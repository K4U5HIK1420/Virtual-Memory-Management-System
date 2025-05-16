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
        "FIFO": "FIFO replaces the oldest page in memory first.",
        "LRU": "LRU replaces the least recently used page.",
        "Optimal": "Optimal replaces the page that won't be used for the longest time.",
        "LFU": "LFU replaces the least frequently used page.",
        "Second Chance": "Second Chance gives pages a second chance before replacing them.",
        "page fault": "A page fault occurs when a requested page is not in memory."

    };
    return responses[input] || "I'm here to help! Ask me about virtual memory management.";
}

document.getElementById("runSimulation").addEventListener("click", function () {
    const frames = parseInt(document.getElementById("frames").value);
    const pageRequests = document.getElementById("pageRequests").value.split(",").map(num => parseInt(num.trim()));
    const algorithm = document.getElementById("algorithm").value;
    let pageFaults = 0;

    if (isNaN(frames) || frames <= 0 || pageRequests.some(isNaN)) {
        alert("Please enter valid inputs.");
        return;
    }

    if (algorithm === "fifo") {
        pageFaults = simulateFIFO(pageRequests, frames);
    } else if (algorithm === "lru") {
        pageFaults = simulateLRU(pageRequests, frames);
    } else if (algorithm === "optimal") {
        pageFaults = simulateOptimal(pageRequests, frames);
    } else if (algorithm === "secondChance") {
        pageFaults = secondChance(pageRequests, frames);
    } else if (algorithm === "lfu") {
        pageFaults = simulateLFU(pageRequests, frames);
    }

    document.getElementById("result").innerText = `Page faults: ${pageFaults}`;
});

// FIFO Algorithm
function simulateFIFO(pages, frameCount) {
    let frames = [];
    let pageFaults = 0;

    for (let page of pages) {
        if (!frames.includes(page)) {
            pageFaults++;
            if (frames.length === frameCount) {
                frames.shift();
            }
            frames.push(page);
        }
    }

    return pageFaults;
}

// LRU Algorithm
function simulateLRU(pages, frameCount) {
    let frames = [];
    let recent = new Map();
    let pageFaults = 0;

    for (let i = 0; i < pages.length; i++) {
        const page = pages[i];

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

    return pageFaults;
}

// Optimal Algorithm
function simulateOptimal(pages, frameCount) {
    let frames = [];
    let pageFaults = 0;

    for (let i = 0; i < pages.length; i++) {
        const page = pages[i];

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

    return pageFaults;
}

// Second Chance Algorithm
function secondChance(pages, framesCount) {
    let frames = Array(framesCount).fill(null);
    let referenceBits = Array(framesCount).fill(0);
    let pointer = 0;
    let pageFaults = 0;

    for (let i = 0; i < pages.length; i++) {
        let page = pages[i];

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

    return pageFaults;
}

// LFU Algorithm
function simulateLFU(pages, frameCount) {
    let frames = [];
    let frequency = new Map(); // Tracks frequency of each page
    let pageFaults = 0;

    for (let i = 0; i < pages.length; i++) {
        const page = pages[i];

        if (!frames.includes(page)) {
            pageFaults++;
            if (frames.length === frameCount) {
                // Find the least frequently used page
                let lfuPage = frames.reduce((a, b) => 
                    frequency.get(a) < frequency.get(b) ? a : b
                );
                frames.splice(frames.indexOf(lfuPage), 1);
                frequency.delete(lfuPage);
            }
            frames.push(page);
            frequency.set(page, 1);
        } else {
            // Update frequency count
            frequency.set(page, frequency.get(page) + 1);
        }
    }

    return pageFaults;
}