// DOM Elements
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const chatMessages = document.getElementById('chatMessages');
const profileIcon = document.getElementById('profileIcon');
const profileMenu = document.getElementById('profileMenu');
const quickActionButtons = document.querySelectorAll('.quick-action-btn');

// Chat state
let isTyping = false;
let messageHistory = [];

// Global variables for Firebase (not directly used for AI API, but good practice for Canvas apps)
// These will be provided by the Canvas environment at runtime
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// OpenRouter API Key and Model
const OPENROUTER_API_KEY = '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';
const OPENROUTER_MODEL = 'anthropic/claude-3-haiku'; // Using Claude 3 Haiku

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    focusMessageInput();
    console.log('MediTrack+ AI Healthcare Assistant Initialized');
});

// Event Listeners
function initializeEventListeners() {
    // Send message events
    sendButton.addEventListener('click', handleSendMessage);
    messageInput.addEventListener('keypress', handleKeyPress);
    messageInput.addEventListener('input', handleInputChange);

    // Profile menu events
    profileIcon.addEventListener('click', toggleProfileMenu);
    document.addEventListener('click', handleOutsideClick);

    // Quick action events
    quickActionButtons.forEach(button => {
        button.addEventListener('click', handleQuickAction);
    });

    // Menu item events
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', handleMenuItemClick);
    });

    // Keyboard navigation
    document.addEventListener('keydown', handleKeyboardNavigation);
}

// Message handling
async function handleSendMessage() {
    const message = messageInput.value.trim();
    if (message && !isTyping) {
        sendUserMessage(message);
        messageInput.value = '';
        updateSendButtonState();
        await getAIResponse(message); // Call AI API
    }
}

function handleKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
    }
}

function handleInputChange() {
    updateSendButtonState();
}

function updateSendButtonState() {
    const hasText = messageInput.value.trim().length > 0;
    sendButton.disabled = !hasText || isTyping;

    if (hasText && !isTyping) {
        sendButton.style.opacity = '1';
        sendButton.style.transform = 'scale(1)';
    } else {
        sendButton.style.opacity = '0.6';
        sendButton.style.transform = 'scale(0.95)';
    }
}

function sendUserMessage(message) {
    // Add user message to chat
    addMessage(message, 'user');

    // Store in history
    // OpenRouter expects 'content' for messages, not 'parts'
    messageHistory.push({ role: 'user', content: message });
}

// Function to call the OpenRouter API for AI response
async function getAIResponse(userMessage) {
    showTypingIndicator(); // Show typing indicator while waiting for AI

    let retries = 0;
    const maxRetries = 5;
    const baseDelay = 1000; // 1 second

    while (retries < maxRetries) {
        try {
            // OpenRouter API endpoint
            const apiUrl = 'https://openrouter.ai/api/v1/chat/completions';

            // Custom system message to guide the AI's response format and content
            const systemPrompt = `You are MediTrack+, an AI healthcare assistant specializing in providing helpful, general health information and guidance based on user input (symptoms, medications, or health queries).

When responding, please follow this structured format using Markdown. Be empathetic, clear, and use simple language.

**1. Disclaimer:**
- ALWAYS start with this: "Disclaimer: I am an AI and cannot provide medical diagnoses or prescribe medications. This information is for general knowledge only. Always consult a qualified healthcare professional for accurate diagnosis, treatment, and medication advice."

**2. Potential Condition & Definition:**
- Based on the user's input, suggest a *possible* general health condition or area of concern.
- Provide a brief, easy-to-understand definition of this condition in simple words.

**3. Possible Causes:**
- List general causes related to the symptoms or condition mentioned. Use bullet points.

**4. General Medications (Informational):**
- Provide general information about common types of medications that *might* be used for the suggested condition.
- **Crucially, add this note:** "Please remember, only a doctor can prescribe medications suitable for you."

**5. Indian Food Diet Recommendations:**
- Suggest a general food diet beneficial for the condition/symptoms, specifically tailored with Indian food items and principles. Use bullet points.

**6. Indian Home Remedies & Ayurvedic Remedies:**
- List easy-to-follow home remedies and general Ayurvedic tips relevant to the symptoms or condition. Use bullet points.
- **Add a note:** "Consult an Ayurvedic practitioner before trying new Ayurvedic remedies."

**7. Symptom Severity Guidance:**
- Ask the user: "On a scale of 1 to 10, how severe are your symptoms currently? (1 being very mild, 10 being unbearable)"
- Provide general advice based on potential severity: "If your symptoms are severe (e.g., 7 or higher), worsen rapidly, or include emergency signs (like difficulty breathing, severe pain, sudden weakness), please seek immediate medical attention or call emergency services."

**8. Video Recommendations (Search Terms):**
- Suggest specific search terms or topics for videos that the user can look up on platforms like YouTube to learn more or find practical tips. Emphasize searching for "Indian" or "Ayurvedic" content if relevant to the query.
- **IMPORTANT:** "I cannot provide direct video links. Please use these search terms on YouTube or other video platforms to find relevant content."

**9. Further Assistance:**
- Conclude by asking: "Would you like to set a reminder for medication, track your symptoms, or need any other assistance today?"

Maintain a helpful, empathetic, and clear tone. Use concise language and bullet points for lists.`;

            const messagesToSend = [
                {
                    role: 'system',
                    content: systemPrompt
                },
                ...messageHistory // Append the existing message history
            ];

            // OpenRouter expects messages in a specific format, similar to OpenAI
            const payload = {
                model: OPENROUTER_MODEL,
                messages: messagesToSend, // Use the modified message history with system prompt
                // You can add other parameters like temperature, max_tokens etc.
                // temperature: 0.7, // Adjust for creativity vs. factual accuracy
                // max_tokens: 500, // Limit response length if needed
            };

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('OpenRouter API error details:', errorData);
                throw new Error(`API error: ${response.status} ${response.statusText} - ${errorData.message || 'Unknown error'}`);
            }

            const result = await response.json();

            if (result.choices && result.choices.length > 0 &&
                result.choices[0].message && result.choices[0].message.content) {
                const botResponse = result.choices[0].message.content;
                hideTypingIndicator();
                addMessage(botResponse, 'bot');
                // Store bot response in history for OpenRouter (role: 'assistant', content: ...)
                messageHistory.push({ role: 'assistant', content: botResponse });
                return; // Exit on success
            } else {
                console.error('Unexpected OpenRouter API response structure:', result);
                hideTypingIndicator();
                addMessage("I'm sorry, I couldn't generate a response from OpenRouter. Please try again.", 'bot');
                return;
            }
        } catch (error) {
            console.error('Error fetching AI response from OpenRouter:', error);
            retries++;
            if (retries < maxRetries) {
                const delay = baseDelay * Math.pow(2, retries - 1) + Math.random() * 500; // Exponential backoff with jitter
                console.log(`Retrying in ${delay / 1000} seconds... (Attempt ${retries}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                hideTypingIndicator();
                addMessage("I'm having trouble connecting to the AI via OpenRouter. Please check your API key, model, or internet connection, then try again later.", 'bot');
            }
        }
    }
}


function addMessage(content, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;

    const avatar = document.createElement('div');
    avatar.className = `message-avatar ${sender}`;

    const avatarIcon = sender === 'bot' ?
        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
        </svg>` :
        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
        </svg>`;

    avatar.innerHTML = avatarIcon;

    const bubble = document.createElement('div');
    bubble.className = `message-bubble ${sender}`;
    // Use marked.js to parse Markdown content into HTML
    bubble.innerHTML = marked.parse(content);

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(bubble);

    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

function showTypingIndicator() {
    isTyping = true;
    updateSendButtonState();

    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot typing-indicator';
    typingDiv.id = 'typing-indicator';

    typingDiv.innerHTML = `
        <div class="message-avatar bot">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
            </svg>
        </div>
        <div class="message-bubble bot">
            <div class="typing-dots">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        </div>
    `;

    chatMessages.appendChild(typingDiv);
    scrollToBottom();
}

function hideTypingIndicator() {
    isTyping = false;
    updateSendButtonState();

    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Quick Actions
function handleQuickAction(e) {
    const message = e.currentTarget.getAttribute('data-message');
    messageInput.value = message;
    messageInput.focus();
    updateSendButtonState();

    // Add visual feedback
    e.currentTarget.style.transform = 'scale(0.95)';
    setTimeout(() => {
        e.currentTarget.style.transform = 'scale(1)';
    }, 150);
}

// Profile Menu
function toggleProfileMenu() {
    profileMenu.classList.toggle('active');

    // Add ripple effect
    profileIcon.style.transform = 'scale(0.95)';
    setTimeout(() => {
        profileIcon.style.transform = 'scale(1)';
    }, 150);
}

function handleOutsideClick(e) {
    if (!profileIcon.contains(e.target) && !profileMenu.contains(e.target)) {
        profileMenu.classList.remove('active');
    }
}

function handleMenuItemClick(e) {
    const menuText = e.currentTarget.textContent.trim();

    // Add visual feedback
    e.currentTarget.style.background = 'rgba(25, 118, 210, 0.1)';
    setTimeout(() => {
        e.currentTarget.style.background = '';
    }, 200);

    // Handle menu actions
    switch (menuText) {
        case 'My Profile':
            // Redirect to profile.html
            window.location.href = 'profile.html';
            break;
        case 'Settings':
            addMessage("Here are your settings options: Notifications, Privacy, Data Export, and Account Preferences. What would you like to configure?", 'bot');
            break;
        case 'Sign Out':
            showMessage('Signing out securely... Your session will end shortly.', 'success');
            setTimeout(() => {
                // In a real app, this would redirect to login
                window.location.href = 'user_sign-in-up_page.html';
            }, 2000);
            break;
    }

    profileMenu.classList.remove('active');
}

// Utility Functions
function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function focusMessageInput() {
    messageInput.focus();
}

function handleKeyboardNavigation(e) {
    // ESC to close profile menu
    if (e.key === 'Escape') {
        profileMenu.classList.remove('active');
    }

    // Alt + P to open profile menu
    if (e.altKey && e.key === 'p') {
        e.preventDefault();
        toggleProfileMenu();
    }

    // Ctrl/Cmd + K to focus message input
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        focusMessageInput();
    }
}

// Message Display Function (for system messages)
function showMessage(message, type) {
    // Remove existing messages
    const existingMessage = document.querySelector('.system-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = `system-message system-message-${type}`;
    messageElement.textContent = message;

    // Add styles
    messageElement.style.cssText = `
        position: fixed;
        top: 2rem;
        left: 50%;
        transform: translateX(-50%);
        padding: 1rem 1.5rem;
        border-radius: 0.75rem;
        font-size: 0.875rem;
        font-weight: 500;
        z-index: 1001;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
        animation: slideDown 0.3s ease-out;
        max-width: 90%;
        text-align: center;
        font-family: 'Inter', sans-serif;
    `;

    if (type === 'success') {
        messageElement.style.backgroundColor = '#43A047';
        messageElement.style.color = '#FFFFFF';
    } else if (type === 'error') {
        messageElement.style.backgroundColor = '#F44336';
        messageElement.style.color = '#FFFFFF';
    } else if (type === 'info') {
        messageElement.style.backgroundColor = '#1976D2';
        messageElement.style.color = '#FFFFFF';
    }

    // Add to DOM
    document.body.appendChild(messageElement);

    // Remove after 4 seconds
    setTimeout(() => {
        messageElement.style.animation = 'slideUp 0.3s ease-in forwards';
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.remove();
            }
        }, 300);
    }, 4000);
}

// Add CSS animations for system messages
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    }

    @keyframes slideUp {
        from {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
        to {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
    }
`;
document.head.appendChild(style);

// Enhanced input interactions
messageInput.addEventListener('focus', () => {
    // Add a null check for parentElement before accessing its style
    if (messageInput && messageInput.parentElement) {
        messageInput.parentElement.style.transform = 'scale(1.02)';
        messageInput.parentElement.style.transition = 'transform 0.2s ease';
    }
});

messageInput.addEventListener('blur', () => {
    // Add a null check for parentElement before accessing its style
    if (messageInput && messageInput.parentElement) {
        messageInput.parentElement.style.transform = 'scale(1)';
    }
});

// Auto-resize input (if needed for longer messages)
messageInput.addEventListener('input', () => {
    // Reset height to auto to get the correct scrollHeight
    messageInput.style.height = 'auto';

    // Set height based on scrollHeight, with max height
    const maxHeight = 120; // Maximum height in pixels
    const newHeight = Math.min(messageInput.scrollHeight, maxHeight);
    messageInput.style.height = newHeight + 'px';

    // Show/hide scrollbar if content exceeds max height
    messageInput.style.overflowY = messageInput.scrollHeight > maxHeight ? 'auto' : 'hidden';
});

// Welcome interaction
setTimeout(() => {
    const welcomeMessage = document.querySelector('.welcome-message');
    if (welcomeMessage) {
        welcomeMessage.style.transform = 'scale(1.02)';
        setTimeout(() => {
            welcomeMessage.style.transform = 'scale(1)';
        }, 200);
    }
}, 1000);

// Initialize send button state
updateSendButtonState();

console.log('MediTrack+ AI Healthcare Assistant Ready');
console.log('Features: Intelligent responses, quick actions, profile management, accessibility support');
console.log('Keyboard shortcuts: ESC (close menu), Alt+P (profile), Ctrl/Cmd+K (focus input)');
