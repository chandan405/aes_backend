const express = require('express');
const router = express.Router();
const connection = require('../connection');
var auth = require('../services/authentication');
var checkRole = require('../services/checkRole');
router.post('/add', auth.authenticateToken, checkRole.checkRole, (req, res) => {
    const { name, description, price, categoryId } = req.body;
    var query = 'INSERT INTO products (name,description,price,categoryId,status) VALUES (?,?,?,?,true)';
    connection.query(query, [name, description, price, categoryId], (err, results) => {
        if (err) {
            console.error('Error adding product:', err);
            return res.status(500).json({ error: 'Error adding product' });
        }
        res.status(201).json({ message: 'Product added successfully' });
    });
});

router.get('/get', auth.authenticateToken, (req, res) => {
    var query =  `
                    SELECT 
                        p.id,
                        p.name,
                        p.description,
                        p.price,
                        p.status,
                        p.imageUrl,
                        p.isAvailable,
                        c.id AS categoryId,
                        c.name AS categoryName
                    FROM products p
                    LEFT JOIN categories c
                    ON p.categoryId = c.id
                    `;
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching products:', err);
            return res.status(500).json({ error: 'Error fetching products' });
        }
        res.status(200).json(results);
    });
});

router.get('/getByCategoryID/:categoryId', auth.authenticateToken, (req, res) => {
    const { categoryId } = req.params;
    var query =  `
                    SELECT
                        p.id,
                        p.name,
                        p.description,
                        p.price,
                        p.status,
                        p.imageUrl,
                        p.isAvailable,
                        c.id AS categoryId,
                        c.name AS categoryName
                    FROM products p
                    LEFT JOIN categories c
                    ON p.categoryId = c.id
                    WHERE p.categoryId = ?
                    `;
    connection.query(query, [categoryId], (err, results) => {
        if (err) {
            console.error('Error fetching products by category:', err);
            return res.status(500).json({ error: 'Error fetching products by category' });
        }
        res.status(200).json(results);
    });
});

router.put('/update/:id', auth.authenticateToken, checkRole.checkRole, (req, res) => {
    const { id } = req.params;
    // const { name, description, price, categoryId } = req.body;
    // var query = 'UPDATE products SET name = ?, description = ?, price = ?, categoryId = ? WHERE id = ?';
     const fields = [];
    const values = [];

    Object.keys(req.body).forEach(key => {
        fields.push(`${key} = ?`);
        values.push(req.body[key]);
    });

    if (fields.length === 0) {
        return res.status(400).json({
            message: 'No fields provided for update'
        });
    }

    values.push(id);

    const query = `
        UPDATE products
        SET ${fields.join(', ')}
        WHERE id = ?
    `;
    
    connection.query(query, values, (err, results) => {
        if (err) {
            console.error('Error updating product:', err);
            return res.status(500).json({ error: 'Error updating product' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.status(200).json({ message: 'Product updated successfully' });
    });
});

router.delete('/delete/:id', auth.authenticateToken, checkRole.checkRole, (req, res) => {
    const { id } = req.params;
    var query = 'DELETE FROM products WHERE id = ?';
    connection.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error deleting product:', err);
            return res.status(500).json({ error: 'Error deleting product' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.status(200).json({ message: 'Product deleted successfully' });
    });
});

module.exports = router;