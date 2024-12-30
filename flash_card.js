const express = require('express');
const sql = require('mssql');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 2601;

app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// MSSQL configuration
const config = {
    user: 'app',
    password: '1234',
    database: 'user',
    server: 'Rajeevsmsi',
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    },
    options: {
        encrypt: true, // for azure
        trustServerCertificate: true // change to true for local dev / self-signed certs
    }
};

// Add flashcard route
app.post('/add', async (req, res) => {
    const { Question, Answer } = req.body;
    try {
        await sql.connect(config);
        console.log("Connected to MSSQL!");

        const request = new sql.Request();
        request.input('Question', sql.VarChar, Question);
        request.input('Answer', sql.VarChar, Answer);

        await request.execute('AddFlashcard');
        console.log("1 record inserted");

        res.json({ message: 'Added flashcard kudos' });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ message: 'Failed to connect' });
    } finally {
        sql.close();
    }
});

app.post('/addformula', async (req, res) => {
    const { Question, Answer } = req.body;
    try {
        await sql.connect(config);
        console.log("Connected to MSSQL!");

        const request = new sql.Request();
        request.input('Question', sql.VarChar, Question);
        request.input('Answer', sql.VarChar, Answer);

        await request.query("INSERT INTO [dbo].[maths] (Question, Answer) VALUES (@Question, @Answer)");
        console.log("1 record inserted");

        res.json({ message: 'Added flashcard kudos' });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ message: 'Failed to connect' });
    } finally {
        sql.close();
    }
});


// Retrieve flashcards route
app.get('/get', async (req, res) => {
    try {
        await sql.connect(config);
        const request = new sql.Request();

        const result = await request.query('SELECT Question, Answer FROM [dbo].[uncertain];');
        res.json(result.recordset);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ message: 'Error while retrieving the data' });
    } finally {
        sql.close();
    }
});
// Retrieve maths flashcard
app.get('/getmaths', async (req, res) => {
    try {
        await sql.connect(config);
        const request = new sql.Request();

        const result = await request.query('SELECT Question, Answer FROM [dbo].[maths];');
        res.json(result.recordset);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ message: 'Error while retrieving the data' });
    } finally {
        sql.close();
    }
});
// Hardcoded users for login validation
const users = [{ loginid: 'Admin', password: '2601' }];

// Login validation route
app.post('/validationlogin', async (req, res) => {
    const { loginid, password } = req.body;
    try {
        await sql.connect(config);
        console.log("MSSQL connected successfully");

        const user = users.find(u => u.loginid === loginid && u.password === password);
        if (user) {
            res.json({ success: true });  // Send success response
        } else {
            res.json({ success: false, message: 'Invalid credentials' });  // Send failure response
        }
    } catch (err) {
        console.log("Error:", err);
        res.status(500).json({ success: false, message: 'Server error' });
    } finally {
        sql.close();
    }
});


// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
