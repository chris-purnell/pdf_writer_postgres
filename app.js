// Importing modules
require('dotenv').config()
const PDFDocument = require('pdfkit');
const fs = require('fs');
const { Pool, Client } = require('pg');

// Create a document
const doc = new PDFDocument();

// pools will use environment variables
// for connection information
const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DB,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
})


// promise - checkout a client
pool
    .connect()
    .then(async client => {
        try {
            const res = await client
                .query('SELECT * FROM sample_order');

            // Saving the pdf file in root directory.
            doc.pipe(fs.createWriteStream('example_order.pdf'));

            // Adding functionality
            doc

                .fontSize(27)
                .text(res.rows[0].first_name, 100, 100);

            doc

                .fontSize(27)
                .text(res.rows[0].last_name, 200, 100);

            // Adding image in the pdf.

            doc.image('./happy-birthday.jpg', {
                fit: [300, 300],
                align: 'center',
                valign: 'center'
            });

            doc
                .addPage()
                .fontSize(15)
                .text('This has been a great invoice!', 100, 100);



            // Apply some transforms and render an SVG path with the 
            // 'even-odd' fill rule
            doc
                .scale(0.6)
                .translate(470, -380)
                .path('M 250,75 L 323,301 131,161 369,161 177,301 z')
                .fill('red', 'even-odd')
                .restore();

            // Add some text with annotations
            doc
                .addPage()
                .fillColor('blue')
                .text('This is a link to the image if the render failed.', 100, 100)

                .link(100, 100, 160, 27, 'https://imgur.com/a/v3cslDJ');

            // Finalize PDF file
            doc.end();
            client.release();
        } catch (err_1) {
            client.release();
            console.log(err_1.stack);
        }
    })
