document.addEventListener('DOMContentLoaded', () => {
    const aiChatNavbarIcon = document.getElementById('aiChatNavbarIcon');
    const aiChatPanel = document.getElementById('aiChatPanel');
    const aiChatCloseButton = document.getElementById('aiChatClose');
    const aiChatSendButton = document.getElementById('aiChatSend');
    const aiChatInput = document.getElementById('aiChatInput');
    const aiChatMessagesContainer = document.querySelector('#aiChatPanel .ai-chat-messages');

    const letsTalkBtn = document.getElementById('letsTalkBtn');
if (letsTalkBtn) {
    letsTalkBtn.addEventListener('click', (event) => {
        event.preventDefault();
        aiChatPanel.style.display = 'flex';
        aiChatInput?.focus();
        setTimeout(() => {
            aiChatMessagesContainer.scrollTop = aiChatMessagesContainer.scrollHeight;
        }, 100);
    });
}


    let chatHistory = [
        {
            role: "system",
            content: "You are A.run, the AI assistant for Arun Raj Peddhala. Only discuss his skills, experience, projects, or portfolio. Stay professional, concise, and user-friendly."
        },
        {
            role: "assistant",
            content: "Hi! 👋 I'm A.run — your assistant for learning all about Arun's skills and projects. What would you like to know?"
        }
    ];

    function scrollToBottom() {
        if (aiChatMessagesContainer) {
            aiChatMessagesContainer.scrollTop = aiChatMessagesContainer.scrollHeight;
        }
    }

    function addMessageToChatUI(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('ai-chat-message');
        messageDiv.classList.add(sender === 'user' ? 'ai-chat-message-user' : 'ai-chat-message-bot');
        messageDiv.innerText = text;
        aiChatMessagesContainer.appendChild(messageDiv);
        scrollToBottom();
    }

    async function handleSendMessage() {
        const messageText = aiChatInput.value.trim();
        if (!messageText) return;

        addMessageToChatUI(messageText, 'user');
        chatHistory.push({ role: 'user', content: messageText });
        aiChatInput.value = '';
        aiChatSendButton.disabled = true;
        aiChatInput.disabled = true;

        addMessageToChatUI('Thinking...', 'assistant');

        try {
            const response = await fetch("https://text.pollinations.ai/openai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "openai",
                    messages: chatHistory,
                    referrer: "ArunPortfolio"
                })
            });

            const data = await response.json();
            const reply = data?.choices?.[0]?.message?.content || "Sorry, something went wrong.";
            chatHistory.push({ role: 'assistant', content: reply });

            const lastBotMessage = document.querySelector('.ai-chat-message-bot:last-child');
            if (lastBotMessage) lastBotMessage.innerText = reply;
        } catch (error) {
            console.error("AI fetch error:", error);
            const lastBotMessage = document.querySelector('.ai-chat-message-bot:last-child');
            if (lastBotMessage) lastBotMessage.innerText = "There was an error. Please try again later.";
        }

        aiChatSendButton.disabled = false;
        aiChatInput.disabled = false;
        aiChatInput.focus();
    }

    aiChatSendButton.addEventListener('click', handleSendMessage);
    aiChatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSendMessage();
        }
    });

    aiChatNavbarIcon.addEventListener('click', () => {
        aiChatPanel.style.display = aiChatPanel.style.display === 'flex' ? 'none' : 'flex';
        scrollToBottom();
    });

    aiChatCloseButton.addEventListener('click', () => {
        aiChatPanel.style.display = 'none';
    });
});