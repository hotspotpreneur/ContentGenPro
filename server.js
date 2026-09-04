const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from 'public' folder (no auth needed)
app.use(express.static(path.join(__dirname, 'public')));

// ============================================================
// API ROUTE - Handle content generation (no auth needed)
// ============================================================
app.post('/api/generate', async (req, res) => {
    try {
        const { input, profile, model } = req.body;

        // Check if API key exists
        if (!process.env.OPENROUTER_KEY) {
            throw new Error('OPENROUTER_KEY is not set in environment variables');
        }

        console.log('📤 Generating content...');

        // Call OpenRouter API
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENROUTER_KEY}`,
                'HTTP-Referer': 'https://app.contentgenpro.online',
                'X-Title': 'ContentGenPro'
            },
            body: JSON.stringify({
                model: model || 'openai/gpt-4o-mini',
                max_tokens: 16384,
                messages: [
                    { role: 'system', content: profile },
                    { role: 'user', content: input }
                ]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error:', response.status, errorText);
            throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Generation successful!');
        res.json(data);
    } catch (error) {
        console.error('❌ Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// ============================================================
// 🔒 SECURITY CHECK FOR IFrame — only on the catch-all route
// ============================================================
app.get('*', (req, res) => {
    const SECRET_KEY = 'super_secret_12345';
    const authKey = req.query.auth;

    // Allow iframe embedding header when auth key is present
    if (authKey === SECRET_KEY) {
        res.setHeader('X-Frame-Options', 'ALLOWALL');
    }

    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ============================================================
// Start server
// ============================================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📁 Serving from: ${__dirname}`);
    console.log(`🔑 OPENROUTER_KEY: ${process.env.OPENROUTER_KEY ? '✅ Found' : '❌ Missing'}`);
});