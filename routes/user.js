const express = require('express');
const connection = require('../connection');
const router = express.Router();

const jwt = require('jsonwebtoken');
require('dotenv').config();
var auth = require('../services/authentication');
var checkRole = require('../services/checkRole');
let transporter;

(async () => {
    const nodemailer = await import('nodemailer');
        transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: 'laurel.lowe@ethereal.email',
            pass: '5N2VD9AueG2whkHn3j'
        }
    });
})();

router.post('/signup', (req, res) => {
    const { name, contactNumber, email, password } = req.body;
    var query = 'SELECT * FROM users WHERE email = ?';
    connection.query(query, [email], (err, results) => {
        if (err) {
            console.error('Error registering user:', err);
            return res.status(500).json({ error: 'Error registering user' });
        }
        if (results.length > 0) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        query = 'INSERT INTO users (name,contactNumber, email, password,status,role) VALUES (?,?,?,?,false,"user")';
        connection.query(query, [name, contactNumber, email, password], (err, results) => {
            if (err) {
                console.error('Error registering user:', err);
                return res.status(500).json({ error: 'Error registering user' });
            }
            res.status(201).json({ message: 'User registered successfully' });
        });
    });
});

router.post('/login', (req, res) => {
    const { email, password } = req.body;
    var query = 'SELECT * FROM users WHERE email = ? AND password = ?';
    connection.query(query, [email, password], (err, results) => {
        if (err) {
            console.error('Error logging in:', err);
            return res.status(500).json({ message: 'Error logging in' });
        }
        if (results.length === 0) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }else if(results[0].status === 'false'){
            return res.status(403).json({ error: 'Your account is not approved yet' });
        }

        const token = jwt.sign({ userId: results[0].id, role: results[0].role, email: results[0].email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const { password, ...userWithoutPassword } = results[0];
        
        res.status(200).json({ message: 'Login successful', user: userWithoutPassword, authToken: token });
    });
});

router.post('/forgot-password', (req, res) => {
    const { email } = req.body;
    var query = 'SELECT * FROM users WHERE email = ?'; 
    connection.query(query, [email], (err, results) => {
        if (err) {
            console.error('Error processing forgot password:', err);
            return res.status(500).json({ error: 'Error processing forgot password' });
        }
        if (results.length === 0) {
            return res.status(400).json({ error: 'Email not found' });
        }
        const resetToken = jwt.sign({ userId: results[0].id }, process.env.JWT_SECRET, { expiresIn: '15m' });
        const resetLink = `http://localhost:4200/reset-password?token=${resetToken}`;
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: 'Password Reset Request',
            text: `You requested a password reset. Click the link to reset your password: ${resetLink}`
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending password reset email:', error);
                return res.status(500).json({ error: 'Error sending password reset email' });
            }
            res.status(200).json({ message: 'Password reset email sent successfully' });
        });
    });
});

router.get('/get',auth.authenticateToken,checkRole.checkRole, (req, res) => {
    var query = 'SELECT id,name,contactNumber,email,status,role FROM users WHERE role = "user"';
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching users:', err);
            return res.status(500).json({ error: 'Error fetching users' });
        }
        res.status(200).json({ users: results });
    });

});

router.patch('/update',auth.authenticateToken, (req, res) => {
    const { id, status } = req.body;
    var query = 'UPDATE users SET status = ? WHERE id = ?';
    connection.query(query, [status, id], (err, results) => {
        if (err) {
            console.error('Error updating user status:', err);
            return res.status(500).json({ error: 'Error updating user status' });
        }
        res.status(200).json({ message: 'User status updated successfully' });
    });
});

router.get('/checkToken', auth.authenticateToken, (req, res) => {
    return res.status(200).json({ message: 'Token is valid' });
});

router.post('/reset-password', auth.authenticateToken , (req, res) => {
    // const { token, newPassword } = req.body;
    // jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    //     if (err) {
    //         return res.status(400).json({ error: 'Invalid or expired token' });
    //     }
    //     var query = 'UPDATE users SET password = ? WHERE id = ?';
    //     connection.query(query, [newPassword, decoded.userId], (err, results) => {
    //         if (err) {
    //             console.error('Error resetting password:', err);
    //             return res.status(500).json({ error: 'Error resetting password' });
    //         }
    //         res.status(200).json({ message: 'Password reset successfully' });
    //     });
    // });
    const {oldPassword, newPassword } = req.body;
    const email = req.user.email;
    console.log("Email from token:", req.user );
    var query = 'SELECT * FROM users WHERE email = ? AND password = ?';
    connection.query(query, [email, oldPassword], (err, results) => {
        if (err) {
            console.error('Error checking user credentials:', err);
            return res.status(500).json({ error: 'Error checking user credentials' });
        }
        if (results.length === 0) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }
        var updateQuery = 'UPDATE users SET password = ? WHERE id = ?';
        connection.query(updateQuery, [newPassword, results[0].id], (err, updateResults) => {
            if (err) {
                console.error('Error updating password:', err);
                return res.status(500).json({ error: 'Error updating password' });
            }
            res.status(200).json({ message: 'Password updated successfully' });
        });
    });
});

module.exports = router;