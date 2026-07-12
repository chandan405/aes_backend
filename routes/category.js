const express = require('express');
const router = express.Router();
const connection = require('../connection');
var auth = require('../services/authentication');
var checkRole = require('../services/checkRole');
router.post('/add', auth.authenticateToken, checkRole.checkRole, (req, res) => {
    const { name } = req.body;
    var query = 'INSERT INTO categories (name) VALUES (?)';
    connection.query(query, [name], (err, results) => {
        if (err) {
            console.error('Error adding category:', err);
            return res.status(500).json({ error: 'Error adding category' });
        }
        res.status(201).json({ message: 'Category added successfully' });
    });
});

router.get('/get', auth.authenticateToken, (req, res) => {
    var query = 'SELECT * FROM categories';
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching categories:', err);
            return res.status(500).json({ error: 'Error fetching categories' });
        }
        res.status(200).json(results);
    });
});

router.put('/update/:id', auth.authenticateToken, checkRole.checkRole, (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    var query = 'UPDATE categories SET name = ? WHERE id = ?';
    connection.query(query, [name, id], (err, results) => {
        if (err) {
            console.error('Error updating category:', err);
            return res.status(500).json({ error: 'Error updating category' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.status(200).json({ message: 'Category updated successfully' });
    });
});

router.delete('/delete/:id', auth.authenticateToken, checkRole.checkRole, (req, res) => {
    const { id } = req.params;
    var query = 'DELETE FROM categories WHERE id = ?';
    connection.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error deleting category:', err);
            return res.status(500).json({ error: 'Error deleting category' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.status(200).json({ message: 'Category deleted successfully' });
    });
});

module.exports = router;