const express = require('express');
const sql = require('mssql');
const bodyParser = require('body-parser');

const app = express();
const port = 2601;

app.use(bodyParser.json());
app.use(express.static('public'));

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

app.post('/add', async (req, res) => {
    const { Question, Answer } = req.body;
    try {
        // Connect to the database
        await sql.connect(config);
        console.log("Connected to MSSQL!");

        // Prepare the SQL request
        const request = new sql.Request();
        request.input('Question', sql.VarChar, Question);
        request.input('Answer', sql.VarChar, Answer);

        // Execute the stored procedure
        await request.execute('AddFlashcard');
        console.log("1 record inserted");

        // Send a success response
        res.json({ message: 'Added flashcard kudos' });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ message: 'Failed to connect' });
    } finally {
        sql.close();
    }
});

app.get('/get', async (req, res) => {
    try {
        await sql.connect(config);
        const request = new sql.Request();

        // Execute a stored procedure or SQL query
        const result = await request.query('SELECT Question, Answer FROM Flashcard;')

        res.json(result.recordset);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ message: 'Error while retrieving the data' });
    } finally {
        sql.close();
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
