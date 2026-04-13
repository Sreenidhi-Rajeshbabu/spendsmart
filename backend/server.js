const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.send('SpendSmart backend running'));

app.post('/ai-insights', async (req, res) => {
  const { summary, total } = req.body;
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a personal finance advisor for an Indian user.
Analyze this spending: Total ₹${total}. Breakdown: ${summary}.
Return ONLY a JSON array with 3 insights. Each object: {"type": "warn" or "good" or "info", "text": "your advice"}.
No extra text, just the JSON array.`
            }]
          }]
        })
      }
    );
    const data = await response.json();
    console.log('Gemini response:', JSON.stringify(data, null, 2));

    if (!data.candidates || !data.candidates[0]) {
      console.log('No candidates in response!');
      return res.json({ insights: [{ type: 'info', text: 'Gemini did not return a response. Check your API key.' }] });
    }

    let text = data.candidates[0].content.parts[0].text.replace(/```json|```/g, '').trim();
    const insights = JSON.parse(text);
    res.json({ insights });
  } catch (err) {
    console.error('Error:', err);
    res.json({ insights: [{ type: 'info', text: 'Could not generate insights right now.' }] });
  }
});

app.listen(3001, () => console.log('Backend running on http://localhost:3001'));