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

// OpenRouter API Key and Model
const OPENROUTER_API_KEY = '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';
const OPENROUTER_MODEL = 'agentica-org/deepcoder-14b-preview:free';

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    focusMessageInput();
    updateSendButtonState();
    console.log('MediTrack+ AI Healthcare Assistant Ready');
});

// Event listeners
function initializeEventListeners() {
    sendButton.addEventListener('click', handleSendMessage);
    messageInput.addEventListener('keypress', handleKeyPress);
    messageInput.addEventListener('input', handleInputChange);

    profileIcon.addEventListener('click', toggleProfileMenu);
    document.addEventListener('click', handleOutsideClick);

    quickActionButtons.forEach(btn => btn.addEventListener('click', handleQuickAction));

    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => item.addEventListener('click', handleMenuItemClick));

    document.addEventListener('keydown', handleKeyboardNavigation);
}

// Message sending
async function handleSendMessage() {
    const message = messageInput.value.trim();
    if (!message || isTyping) return;
    sendUserMessage(message);
    messageInput.value = '';
    updateSendButtonState();
    await getAIResponse(message);
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
    sendButton.style.opacity = hasText && !isTyping ? '1' : '0.6';
    sendButton.style.transform = hasText && !isTyping ? 'scale(1)' : 'scale(0.95)';
}

function sendUserMessage(message) {
    addMessage(message, 'user');
    messageHistory.push({ role: 'user', content: message });
}

function isHealthRelated(prompt) {
  const keywords = [
    "health", "diet", "meal", "food", "nutrition", "exercise", "fitness",
    "doctor", "medicine", "treatment", "fever", "cough", "headache",
    "pain", "blood", "diabetes", "pressure", "symptom", "recovery"
  ];

  return keywords.some(word => prompt.toLowerCase().includes(word));
} 

//get username from backend
async function getUsername() {
    try {
        const res = await fetch('/api/me', {
            method: 'GET',
            credentials: 'include', // important to include cookies
        });

        if (!res.ok) throw new Error('Failed to fetch user info');

        const user = await res.json();
        return user.username || user.name || 'User'; // adjust depending on your schema
    } catch (err) {
        console.error('Error fetching username:', err);
        return 'User'; // fallback
    }
}

async function getAIResponse(userMessage) {
    showTypingIndicator();

    if (!isHealthRelated(userMessage)) {
        hideTypingIndicator();

        const warningMsg = "⚠️ I’m MediTrack+, a healthcare assistant. I only answer health, diet, and wellness-related queries.";
        
        // Show the warning in the chat
        addMessage(warningMsg, 'bot');

        // Also push into history if you want context
        messageHistory.push({ role: 'assistant', content: warningMsg });

        return; // Stop here
    }


const username = await getUsername();

    const systemPrompt = `user name is : ${username}, You are MediTrack+, a professional, friendly, and intelligent AI healthcare assistant. 
Your goal is to help users manage and maintain a healthy diet, providing clear, structured, and actionable advice.

Guidelines:

1. **Tone & Style**
- Be friendly, warm, and professional. 
- Include emojis to make the response lively and user-friendly (🍎, 🥗, 🕒, 🥛, etc.).
- Always motivate the user and encourage healthy habits.

2. **Diet Advice**
- Explain why the recommended meals are beneficial.
- Include tips on portion sizes, hydration, meal timing, and substitutions if ingredients are unavailable.
- Give steps to achieve consistency in diet and lifestyle.
- Suggest snacks, drinks, and daily routines where relevant.

3. **Response Format**
- Provide **two outputs** in every response:

[USER_FRIENDLY]
- Use a friendly, visually appealing style.
- Include emojis for meals, drinks, and activities.
- Include practical advice on how to maintain a good diet.
- Provide a **tabular meal schedule** at the end with the following columns: Time, Meal, Notes.
- The table is only for display to the user.


- Structured JSON for storing in a database.
- Include "meals" as an array of objects with the following fields: time, meal, notes.
- Example structure(follow this structure only!!! add [JSON_START] before and [JSON_END] after the json  ):
[JSON_START]
{
  "meals": [
    {
      "meal": "Oatmeal with Berries",
      "time": "07:00 AM",
      "date": "2025-09-13",
      "timestamp": "2025-09-13T07:00:00Z",
      "notes": "High fiber breakfast"
    },
    {
      "meal": "Greek Yogurt with Almonds",
      "time": "10:00 AM",
      "date": "2025-09-13",
      "timestamp": "2025-09-13T10:00:00Z",
      "notes": "Protein-rich snack"
    }
  ]
}

[JSON_END]
IMPORTANT: The JSON must be pure JSON only. Do not include emojis, Markdown, or extra text inside the JSON_START / JSON_END block.


4. **Timing Table**
- At the end of the user-friendly output, provide a table like this:
| Time      | Meal                  | Notes                     |
|-----------|----------------------|---------------------------|
| 07:00 AM  | Warm oatmeal 🍯       | High fiber breakfast      |
| 10:00 AM  | Green tea 🍵          | Boosts metabolism         |
| ...       | ...                  | ...                       |

5. **Content Rules**
- Ensure all suggestions are realistic and practical.
- Mention portions, hydration, and balanced macronutrients.
- Include suggestions for snacks, drinks, and daily routines.
- Always include **both [USER_FRIENDLY] and [JSON] outputs**.

6. **Example of friendly, structured response** (without being literal, just style):
- Greet the user positively.
- List meals with time, meal details, emojis, and notes on benefits.
- Give practical tips, substitutions, and reminders about hydration or lifestyle.
- End with a clear tabular schedule.
- Provide a well-structured JSON object.

7. **Important**
- Respond in English language only
- Always respond in a professional, friendly, and motivating way.
- Make responses actionable and easy to follow.
- Never skip [USER_FRIENDLY] or [JSON] sections.`;

    const messagesToSend = [
        { role: 'system', content: systemPrompt },
        ...messageHistory
    ];

    try {
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: OPENROUTER_MODEL,
                messages: messagesToSend,
                temperature: 0.7
            })
        });

        if (!res.ok) throw new Error(`API error ${res.status}`);

        const data = await res.json();
        const botMessage = data.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response.";

        // ---- Extract user-friendly and JSON parts ----
        const { userFriendlyText, jsonText } = extractUserFriendlyAndJSON(botMessage);

        // Display user-friendly text in chat
        addMessage(userFriendlyText, 'bot');

        // Parse and store JSON for MongoDB
if (jsonText) {
    try {
        const parsedJSON = JSON.parse(jsonText);

        await fetch('/api/mealPlans/create', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'},
            credentials: 'include',
            body: JSON.stringify(parsedJSON)
        }).then(res => res.json())
          .then(data => console.log('MealPlan save response:', data))
          .catch(err => console.error('Error saving meal plan:', err));
    } catch (err) {
        console.error('Error parsing JSON:', err);
    }
}


        // Add AI message to history
        messageHistory.push({ role: 'assistant', content: botMessage });

    } catch (err) {
        console.error(err);
        addMessage("Error connecting to OpenRouter. Check API key or internet.", 'bot');
    } finally {
        hideTypingIndicator();
    }
}

// ---- Utility function ----
function extractUserFriendlyAndJSON(botMessage) {
    const userFriendlyStart = botMessage.indexOf('[USER_FRIENDLY]');
    const jsonStart = botMessage.indexOf('[JSON_START]');
    const jsonEnd = botMessage.indexOf('[JSON_END]');

    let userFriendlyText = '';
    let jsonText = '';

    // Extract user-friendly text
    if (userFriendlyStart !== -1 && jsonStart !== -1) {
        userFriendlyText = botMessage
            .slice(userFriendlyStart, jsonStart)
            .replace('[USER_FRIENDLY]', '')
            .trim();
    } else {
        userFriendlyText = botMessage; // fallback
    }

    // Extract JSON text
    if (jsonStart !== -1 && jsonEnd !== -1) {
        jsonText = botMessage
            .slice(jsonStart + '[JSON_START]'.length, jsonEnd)
            .trim();
    } else {
        console.error('No valid JSON markers found in AI response');
    }

    console.log('User-friendly text:', userFriendlyText);
    console.log('Raw JSON text:', jsonText);

    return { userFriendlyText, jsonText };
}


// Display messages
function addMessage(content, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;

    const avatar = document.createElement('div');
    avatar.className = `message-avatar ${sender}`;
    avatar.innerHTML = sender === 'bot' 
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';

    const bubble = document.createElement('div');
    bubble.className = `message-bubble ${sender}`;
    bubble.innerHTML = marked.parse(content); // Markdown to HTML

    messageDiv.append(avatar, bubble);
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

// Typing indicator
function showTypingIndicator() {
    isTyping = true;
    updateSendButtonState();
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot typing-indicator';
    typingDiv.id = 'typing-indicator';
    typingDiv.innerHTML = `<div class="message-avatar bot"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg></div><div class="message-bubble bot"><div class="typing-dots"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div></div>`;
    chatMessages.appendChild(typingDiv);
    scrollToBottom();
}

function hideTypingIndicator() {
    isTyping = false;
    updateSendButtonState();
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
}

// Quick actions
function handleQuickAction(e) {
    const msg = e.currentTarget.dataset.message;
    messageInput.value = msg;
    messageInput.focus();
    updateSendButtonState();
    e.currentTarget.style.transform = 'scale(0.95)';
    setTimeout(() => e.currentTarget.style.transform = 'scale(1)', 150);
}

// Profile menu
function toggleProfileMenu() {
    profileMenu.classList.toggle('active');
    profileIcon.style.transform = 'scale(0.95)';
    setTimeout(() => profileIcon.style.transform = 'scale(1)', 150);
}

function handleOutsideClick(e) {
    if (!profileIcon.contains(e.target) && !profileMenu.contains(e.target)) {
        profileMenu.classList.remove('active');
    }
}

function handleMenuItemClick(e) {
    const text = e.currentTarget.textContent.trim();
    e.currentTarget.style.background = 'rgba(25,118,210,0.1)';
    setTimeout(() => e.currentTarget.style.background = '', 200);

    switch (text) {
        case 'My Profile': window.location.href = 'profile.html'; break;
        case 'Settings': addMessage("Settings: Notifications, Privacy, Data Export, Account Preferences.", 'bot'); break;
        case 'Sign Out': showMessage('Signing out...', 'success'); setTimeout(() => window.location.href = 'user_sign-in-up_page.html', 2000); break;
    }
    profileMenu.classList.remove('active');
}

// System messages
function showMessage(msg, type) {
    const existing = document.querySelector('.system-message');
    if (existing) existing.remove();

    const el = document.createElement('div');
    el.className = `system-message system-message-${type}`;
    el.textContent = msg;
    el.style.cssText = `
        position: fixed; top: 2rem; left: 50%; transform: translateX(-50%);
        padding: 1rem 1.5rem; border-radius: 0.75rem; font-size: 0.875rem;
        font-weight: 500; z-index: 1001; box-shadow: 0 8px 32px rgba(0,0,0,0.12);
        max-width: 90%; text-align: center; font-family: 'Inter', sans-serif;
        animation: slideDown 0.3s ease-out;
        background-color: ${type === 'success' ? '#43A047' : type === 'error' ? '#F44336' : '#1976D2'};
        color: #fff;
    `;
    document.body.appendChild(el);
    setTimeout(() => { el.style.animation = 'slideUp 0.3s ease-in forwards'; setTimeout(() => el.remove(), 300); }, 4000);
}

// Scroll and input helpers
function scrollToBottom() { chatMessages.scrollTop = chatMessages.scrollHeight; }
function focusMessageInput() { messageInput.focus(); }
function handleKeyboardNavigation(e) {
    if (e.key === 'Escape') profileMenu.classList.remove('active');
    if (e.altKey && e.key === 'p') { e.preventDefault(); toggleProfileMenu(); }
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); focusMessageInput(); }
}

// Auto-resize input
messageInput.addEventListener('input', () => {
    messageInput.style.height = 'auto';
    const maxHeight = 120;
    messageInput.style.height = Math.min(messageInput.scrollHeight, maxHeight) + 'px';
    messageInput.style.overflowY = messageInput.scrollHeight > maxHeight ? 'auto' : 'hidden';
});

// CSS animations for system messages
const style = document.createElement('style');
style.textContent = `
@keyframes slideDown { from {opacity:0; transform:translateX(-50%) translateY(-20px);} to {opacity:1; transform:translateX(-50%) translateY(0);} }
@keyframes slideUp { from {opacity:1; transform:translateX(-50%) translateY(0);} to {opacity:0; transform:translateX(-50%) translateY(-20px);} }
`;
document.head.appendChild(style);
