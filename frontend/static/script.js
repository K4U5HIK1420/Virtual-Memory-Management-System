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
        "page fault": "A page fault occurs when a requested page is not in memory."
    };
    return responses[input] || "I'm here to help! Ask me about virtual memory management.";
}
