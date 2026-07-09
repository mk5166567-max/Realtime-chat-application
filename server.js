const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/chat', async (req, res) => {
  const message = req.body?.message;

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ reply: 'Please enter a message first.' });
  }

  if (!OPENAI_API_KEY) {
    return res.json({
      reply: 'ChatGPT integration is ready. Add your OpenAI API key in the .env file to get live AI answers.'
    });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful chat assistant.' },
          { role: 'user', content: message }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'OpenAI request failed');
    }

    const reply = data.choices?.[0]?.message?.content?.trim() || 'No reply received.';
    res.json({ reply });
  } catch (error) {
    res.status(500).json({
      reply: `Sorry, I could not reach the AI service. ${error.message}`
    });
  }
});

app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'Real time Application .html'));
});

app.listen(PORT, () => {
  console.log(`Chat backend running at http://localhost:${PORT}`);
});
