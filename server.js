const express = require('express');
const path = require('path');
const app = express();

// IMPORTANT: Parse JSON requests
app.use(express.json());

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// ============================================================
// THE GENERATE API ROUTE (THIS IS WHAT'S MISSING!)
// ============================================================
app.post('/api/generate', async (req, res) => {
    try {
        const { input, profile, model } = req.body;
        
        // Call OpenRouter API
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENROUTER_KEY}`,
                'HTTP-Referer': 'https://contentgenpro.onrender.com',
                'X-Title': 'ContentGenPro'
            },
            body: JSON.stringify({
                model: model || 'openai/gpt-4o-mini',
                messages: [
                    { role: 'system', content: profile },
                    { role: 'user', content: input }
                ]
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'API request failed');
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// ============================================================
// HANDLE ALL OTHER ROUTES (for client-side routing)
// ============================================================
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ============================================================
// START THE SERVER
// ============================================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🌐 Visit: http://localhost:${PORT}`);
    console.log(`🔑 API Key loaded: ${process.env.OPENROUTER_KEY ? '✅ YES' : '❌ NO'}`);
});