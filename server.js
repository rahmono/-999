
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenAI } = require('@google/genai');
const crypto = require('crypto');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const os = require('os');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Configure Multer for temp file storage
const upload = multer({ dest: os.tmpdir() });

app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    }
    next();
});

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'maktab_ai'
};

let pool;

const generateServerId = () => {
    try {
        if (crypto.randomUUID) return crypto.randomUUID();
    } catch (e) {}
    return crypto.randomBytes(16).toString('hex');
};

async function initDB() {
    try {
        const connection = await mysql.createConnection({
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password
        });
        
        console.log(`Checking database: ${dbConfig.database}`);
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        await connection.end();

        pool = mysql.createPool(dbConfig);
        
        console.log('Verifying/Creating tables...');
        
        await pool.query(`
            CREATE TABLE IF NOT EXISTS grades (
                id VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci PRIMARY KEY,
                name VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        
        // Added pdf_uri column
        await pool.query(`
            CREATE TABLE IF NOT EXISTS subjects (
                id VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci PRIMARY KEY,
                grade_id VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
                name VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
                pdf_uri VARCHAR(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
                FOREIGN KEY (grade_id) REFERENCES grades(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        
        // Topics table kept for backward compatibility/hybrid use
        await pool.query(`
            CREATE TABLE IF NOT EXISTS topics (
                id VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci PRIMARY KEY,
                subject_id VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
                name VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
                content TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
                FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        
        await pool.query(`
            CREATE TABLE IF NOT EXISTS topic_images (
                id VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci PRIMARY KEY,
                topic_id VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
                data LONGTEXT NOT NULL,
                mime_type VARCHAR(50) NOT NULL,
                \`order\` INT NOT NULL,
                FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        
        console.log('Database schema is synchronized.');
    } catch (err) {
        console.error('CRITICAL: Database Initialization Failed!', err);
    }
}

app.use((req, res, next) => {
    if (!pool && req.path.startsWith('/api')) {
        return res.status(503).json({ error: 'Базаи маълумот омода нест.' });
    }
    next();
});

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- UPLOAD ---
app.post('/api/admin/upload', upload.single('pdf'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No PDF file uploaded' });
        }
        
        const filePath = req.file.path;
        const mimeType = 'application/pdf';
        
        console.log(`Uploading file to Gemini: ${req.file.originalname}`);

        // Upload to Google GenAI
        const uploadResponse = await ai.files.upload({
            file: fs.readFileSync(filePath),
            config: { 
                mimeType: mimeType,
                displayName: req.file.originalname 
            }
        });

        // Clean up temp file
        fs.unlinkSync(filePath);

        console.log(`File uploaded. URI: ${uploadResponse.file.uri}`);
        
        res.json({ success: true, uri: uploadResponse.file.uri });
    } catch (err) {
        console.error("Upload Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// --- GRADES ---
app.get('/api/grades', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM grades ORDER BY name ASC');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/grades', async (req, res) => {
    try {
        const { id, name } = req.body;
        if (!name) return res.status(400).json({ error: 'Name is required' });
        const finalId = id || generateServerId();
        await pool.query('INSERT INTO grades (id, name) VALUES (?, ?)', [finalId, name]);
        res.json({ success: true, id: finalId });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/grades/:id', async (req, res) => {
    try {
        const { name } = req.body;
        await pool.query('UPDATE grades SET name = ? WHERE id = ?', [name, req.params.id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/grades/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM grades WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- SUBJECTS ---
app.get('/api/subjects', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, grade_id AS gradeId, name, pdf_uri AS pdfUri FROM subjects');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/subjects/:gradeId', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, grade_id AS gradeId, name, pdf_uri AS pdfUri FROM subjects WHERE grade_id = ?', [req.params.gradeId]);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/subject/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, grade_id AS gradeId, name, pdf_uri AS pdfUri FROM subjects WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({error: 'Subject not found'});
        res.json(rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/subjects', async (req, res) => {
    try {
        const { id, gradeId, name, pdfUri } = req.body;
        const finalId = id || generateServerId();
        await pool.query('INSERT INTO subjects (id, grade_id, name, pdf_uri) VALUES (?, ?, ?, ?)', [finalId, gradeId, name, pdfUri || null]);
        res.json({ success: true, id: finalId });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/subjects/:id', async (req, res) => {
    try {
        const { gradeId, name, pdfUri } = req.body;
        await pool.query('UPDATE subjects SET grade_id = ?, name = ?, pdf_uri = ? WHERE id = ?', [gradeId, name, pdfUri || null, req.params.id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/subjects/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM subjects WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- CHAT WITH PDF CONTEXT ---
app.post('/api/chat', async (req, res) => {
    try {
        const { message, subjectId, role, gradeName, language, actionKey } = req.body;
        
        // 1. Fetch Subject PDF URI
        const [subjectRows] = await pool.query('SELECT name, pdf_uri FROM subjects WHERE id = ?', [subjectId]);
        if (subjectRows.length === 0) return res.status(404).json({ error: 'Subject not found' });
        
        const subject = subjectRows[0];
        
        // 2. Build Prompt
        const systemInstruction = `You are Maktab AI, an educational assistant for Tajikistan. 
        Context: You are helping a ${role} from grade ${gradeName} in the subject "${subject.name}".
        Language: Respond in ${language === 'tj' ? 'Tajik' : 'Russian'}.
        Task: Answer the user's question or perform the requested action (${actionKey || 'general query'}) based STRICTLY on the provided textbook PDF context.
        If the answer is not in the textbook, state that politely.
        Use LaTeX for math ($...$). No greetings necessary, just the content.`;

        const parts = [];
        
        // 3. Add PDF context if available
        if (subject.pdf_uri) {
            parts.push({ 
                fileData: { 
                    mimeType: 'application/pdf', 
                    fileUri: subject.pdf_uri 
                } 
            });
        } else {
            console.warn(`No PDF found for subject ${subject.name}, answering without context.`);
        }

        parts.push({ text: message });

        // 4. Call Gemini
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash-exp', // Using Flash as requested for context handling
            contents: { parts },
            config: { systemInstruction, temperature: 0.5 }
        });
        
        res.json({ text: response.text });

    } catch (err) { 
        console.error("Chat Error:", err);
        res.status(500).json({ error: 'AI Error', message: err.message }); 
    }
});

app.use((err, req, res, next) => {
    console.error("!!! UNCAUGHT SERVER ERROR:", err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

const PORT = process.env.PORT || 3001;
initDB().then(() => {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server started on port ${PORT}`);
    });
});
