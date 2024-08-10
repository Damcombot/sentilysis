function getSpokenText(text, maxLength) {
    // Trim the text to the maximum length
    let trimmedText = text.substring(0, maxLength);

    // Find the last complete sentence
    const lastSentenceEnd = Math.max(
        trimmedText.lastIndexOf('.'),
        trimmedText.lastIndexOf('!'),
        trimmedText.lastIndexOf('?'),
        trimmedText.lastIndexOf(' '), // Also consider space as a boundary
    );

    // Ensure the text makes sense by cutting at the last sentence boundary
    if (lastSentenceEnd !== -1) {
        trimmedText = trimmedText.substring(0, lastSentenceEnd + 1);
    }

    return trimmedText;
}

let speechSynthesisUtterance; // Global variable to keep track of the speech synthesis utterance

async function sendMessage() {
    const userInput = document.getElementById('userInput').value;
    const chatBox = document.getElementById('chat-box');

    // Stop any ongoing speech when the user starts typing
    if (speechSynthesisUtterance) {
        window.speechSynthesis.cancel();
    }
    
    // Display user message
    chatBox.innerHTML += `<div><strong><span style="padding-right:10px;">You:</span>${userInput}</strong></div>`;
    
    // GPT-2 API endpoint
    const apiEndpoint = 'https://api-inference.huggingface.co/models/gpt2';
    const apiKey = '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'; // Replace with your API key

    try {
        const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer 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`
            },
            body: JSON.stringify({
                "inputs": userInput,
                "parameters": {
                    "max_length": 200,  // Adjust length as needed
                    "temperature": 1, // Adjust for more or less randomness
                    "top_p": 0.9        // Controls nucleus sampling
                }
            })
        });

        if (response.ok) {
            const data = await response.json();
            const answer = data[0]?.generated_text || 'I’m not sure how to answer that.';

            // Display bot response
            chatBox.innerHTML += `<div><span style="font-family:monospace;font-size:15px;">Bot:</span> <span style="font-family:monospace;font-size:15px;">${answer}</span></div>`;
            
            // Get spoken text up to a max length that still makes sense
            const spokenAnswer = getSpokenText(answer, 200);  // Adjust the max length as needed
            
            // Speak the bot's response
            speechSynthesisUtterance = new SpeechSynthesisUtterance(spokenAnswer);
            window.speechSynthesis.speak(speechSynthesisUtterance);
        } else {
            chatBox.innerHTML += `<div>Bot: Error: ${response.statusText}</div>`;
        }
        
        // Clear input field
        document.getElementById('userInput').value = '';

        // Scroll to bottom of chat
        chatBox.scrollTop = chatBox.scrollHeight;
    } catch (error) {
        chatBox.innerHTML += `<div><strong>Bot:</strong> Error: ${error.message}</div>`;
    }
}

// Event listener to stop speech synthesis when the user starts typing
document.getElementById('userInput').addEventListener('input', () => {
    if (speechSynthesisUtterance) {
        window.speechSynthesis.cancel();
    }
});
