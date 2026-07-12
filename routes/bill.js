const express = require('express');
const router = express.Router();
const connection = require('../connection');
var auth = require('../services/authentication');
var checkRole = require('../services/checkRole');
let ejs = require('ejs');
let pdf = require('html-pdf');
let path = require('path');
let fs = require('fs');
var uuid = require('uuid');

router.post('/generateReport', auth.authenticateToken, checkRole.checkRole, (req, res) => {
    const {
        name,
        contactNumber,
        paymentMethod,
        items,
        totalAmount,
        productDetails,
        orderId
    } = req.body;
    const userEmail = req.user.email;
    const currentDate = new Date().toLocaleString();
    const invoiceId = uuid.v4();
    var query = 'INSERT INTO bills (name,uuid, email,contactNumber,paymentMethod,totalAmount , productDetails,createdBy,orderId ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';

    connection.query(
        query,
        [
            name,
            invoiceId,
            userEmail,
            contactNumber,
            paymentMethod,
            totalAmount,
            JSON.stringify(productDetails),
            userEmail,
            orderId || null
        ],
        (err, results) => {
            if (err) {
                console.error('Error saving bill to database:', err);
                return res.status(500).json({ error: 'Error saving bill to database' });
            }


            // ejs.renderFile(path.join(__dirname, '../views', 'report.ejs'), { items, totalAmount, userEmail, currentDate, invoiceId }, (err, html) => {
            ejs.renderFile(path.join(__dirname, '', 'report.ejs'), { name, items, totalAmount, userEmail, contactNumber, paymentMethod, currentDate, invoiceId, productDetails }, (err, html) => {
                if (err) {
                    console.error('Error rendering EJS template:', err);
                    return res.status(500).json({ error: 'Error generating report' });
                }
                // pdf.create(html).toFile(path.join(__dirname, '../reports', `report_${invoiceId}.pdf`), (err, buffer) => {
                //     if (err) {
                //         console.error('Error creating PDF:', err);
                //         return res.status(500).json({ error: 'Error generating report' });
                //     }

                //     return res.status(200).json({ message: 'Report generated successfully', invoiceId });
                // });
                const pdfPath = path.join(
                    __dirname,
                    '../reports',
                    `report_${invoiceId}.pdf`
                );

                pdf.create(html).toFile(pdfPath, (err, result) => {

                    if (err) {
                        console.log(err);
                        return res.status(500).json({
                            error: err.message
                        });
                    }

                    res.download(pdfPath, `Invoice_${invoiceId}.pdf`, (err) => {

                        if (err) {
                            console.log(err);
                        }

                    });

                });
            });
        });
});

// router.get('/getReport/:invoiceId', auth.authenticateToken, checkRole.checkRole, (req, res) => {
//     const { invoiceId } = req.params;

//     var query = 'SELECT * FROM bills WHERE uuid = ?';

//     connection.query(query, [invoiceId], (err, results) => {
//         if (err) {
//             console.error('Error fetching bill from database:', err);
//             return res.status(500).json({ error: 'Error fetching bill from database' });
//         }

//         if (results.length === 0) {
//             return res.status(404).json({ error: 'Bill not found' });
//         }

//         return res.status(200).json({ bill: results[0] });
//     });
// });

router.get('/getReports', auth.authenticateToken, checkRole.checkRole, (req, res) => {
    var query = 'SELECT * FROM bills ORDER BY id DESC';

    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching bills from database:', err);
            return res.status(500).json({ error: 'Error fetching bills from database' });
        }

        return res.status(200).json({ bills: results });
    });
});

router.delete('/delete/:invoiceId', auth.authenticateToken, checkRole.checkRole, (req, res) => {
    const { invoiceId } = req.params;

    var query = 'DELETE FROM bills WHERE uuid = ?';

    connection.query(query, [invoiceId], (err, results) => {
        if (err) {
            console.error('Error deleting bill from database:', err);
            return res.status(500).json({ error: 'Error deleting bill from database' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Bill not found' });
        }

        return res.status(200).json({ message: 'Bill deleted successfully' });
    });
});

module.exports = router;
