
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenAI } = require('@google/genai');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'maktab_ai'
};

let pool;

async function initDB() {
    pool = mysql.createPool(dbConfig);
}

// AI Initialization
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- API Endpoints ---

// Grades
app.get('/api/grades', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM grades');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/grades', async (req, res) => {
    try {
        const { id, name } = req.body;
        await pool.query('INSERT INTO grades (id, name) VALUES (?, ?)', [id, name]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Subjects
app.get('/api/subjects', async (req, res) => {
    try {
        // Fix: Alias grade_id as gradeId to match Subject interface
        const [rows] = await pool.query('SELECT id, grade_id AS gradeId, name FROM subjects');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/subjects/:gradeId', async (req, res) => {
    try {
        // Fix: Alias grade_id as gradeId to match Subject interface
        const [rows] = await pool.query('SELECT id, grade_id AS gradeId, name FROM subjects WHERE grade_id = ?', [req.params.gradeId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/subjects', async (req, res) => {
    try {
        const { id, gradeId, name } = req.body;
        await pool.query('INSERT INTO subjects (id, grade_id, name) VALUES (?, ?, ?)', [id, gradeId, name]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Topics
app.get('/api/topics/:subjectId', async (req, res) => {
    try {
        // Fix: Alias subject_id as subjectId to match Topic interface
        const [rows] = await pool.query('SELECT id, subject_id AS subjectId, name, content FROM topics WHERE subject_id = ?', [req.params.subjectId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/topic/:id', async (req, res) => {
    try {
        // Fix: Alias subject_id as subjectId to match Topic interface
        const [topicRows] = await pool.query('SELECT id, subject_id AS subjectId, name, content FROM topics WHERE id = ?', [req.params.id]);
        if (topicRows.length === 0) return res.status(404).json({ error: 'Not found' });
        
        const [imageRows] = await pool.query('SELECT data, mime_type as mimeType, `order` FROM topic_images WHERE topic_id = ? ORDER BY `order` ASC', [req.params.id]);
        
        const topic = { ...topicRows[0], images: imageRows };
        res.json(topic);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/topics', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const { id, subjectId, name, content, images } = req.body;
        
        await connection.query('INSERT INTO topics (id, subject_id, name, content) VALUES (?, ?, ?, ?)', [id, subjectId, name, content]);
        
        if (images && images.length > 0) {
            for (const img of images) {
                const imgId = require('crypto').randomUUID();
                await connection.query('INSERT INTO topic_images (id, topic_id, data, mime_type, `order`) VALUES (?, ?, ?, ?, ?)', [imgId, id, img.data, img.mimeType, img.order]);
            }
        }
        
        await connection.commit();
        res.json({ success: true });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
});

// AI Chat Endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { 
            topicName, 
            topicContent, 
            topicImages, 
            role, 
            gradeName, 
            actionKey, 
            language 
        } = req.body;

        const langName = language === 'tj' ? "Tajik (Cyrillic)" : "Russian";
        
        let systemInstruction = `You are Maktab AI, an expert educational assistant.
        CRITICAL RULES:
        1. DO NOT use any greetings (Hello, Hi, Welcome, etc.).
        2. DO NOT introduce yourself or your purpose.
        3. DO NOT use repetitive filler phrases like "I am here to help" or "Feel free to ask".
        4. Provide ONLY the direct, concise answer to the request.
        5. TARGET AUDIENCE: This content is for a ${role === 'Teacher' ? "Teacher" : "Student"} of ${gradeName}.
        6. COMPLEXITY LEVEL: Adjust your explanation style specifically for ${gradeName}.
        7. LANGUAGE: Respond strictly in ${langName}.
        8. MATH: Use LaTeX for all mathematical expressions: $x^2$.`;

        if (topicContent) systemInstruction += `\n\n[TEXT CONTEXT]: ${topicContent}`;
        if (topicImages && topicImages.length > 0) systemInstruction += `\n\n[IMAGE CONTEXT]: Sequential textbook images provided.`;

        const promptParts = [];
        if (topicImages && topicImages.length > 0) {
            topicImages.sort((a, b) => a.order - b.order).forEach(img => {
                promptParts.push({ inlineData: { data: img.data, mimeType: img.mimeType } });
            });
        }

        let userPrompt = actionKey; // Simple mapping for production logic
        promptParts.push({ text: userPrompt });

        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: { parts: promptParts },
            config: { systemInstruction, temperature: 0.7 }
        });

        // Use response.text property directly as per guidelines
        res.json({ text: response.text });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'AI Error' });
    }
});

const PORT = process.env.PORT || 3001;
initDB().then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
