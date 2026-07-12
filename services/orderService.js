require('dotenv').config();
const connection = require('../connection');
// const mysql = require('mysql2');

// const dbConfig = {
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME
// };

/**
 * Executes a function within a database transaction using a dedicated connection.
 * @param {Function} fn - Function(conn, txCallback) containing the database operations.
 * @param {Function} callback - Callback function(err, result).
 */
// function runInTransaction(fn, callback) {
//     const conn = mysql.createConnection(dbConfig);
//     conn.connect(err => {
//         if (err) {
//             console.error('Error connecting for transaction:', err);
//             return callback(err);
//         }
//         conn.beginTransaction(txErr => {
//             if (txErr) {
//                 console.error('Error starting transaction:', txErr);
//                 conn.end();
//                 return callback(txErr);
//             }
//             fn(conn, (execErr, result) => {
//                 if (execErr) {
//                     return conn.rollback(() => {
//                         conn.end();
//                         callback(execErr);
//                     });
//                 }
//                 conn.commit(commitErr => {
//                     if (commitErr) {
//                         return conn.rollback(() => {
//                             conn.end();
//                             callback(commitErr);
//                         });
//                     }
//                     conn.end();
//                     callback(null, result);
//                 });
//             });
//         });
//     });
// }

const orderService = {
    /**
     * Creates a new order and its items in a transaction.
     */
    createOrder: (orderData, callback) => {

        const { userId, items, totalPrice, status } = orderData;
        console.log('Creating order with data:', orderData);
        let totalItems = items.length;
        const orderQuery = `INSERT INTO orders
            (userId,quantity, totalPrice, status)
            VALUES (?, ?, ?, ?)`;

        connection.query(
            orderQuery,
            [
                userId,
                totalItems,
                totalPrice,
                status || 'Pending'
            ],
            (err, orderResult) => {

                if (err) {
                    return callback(err);
                }

                const orderId = orderResult.insertId;

                const values = items.map(item => [

                    orderId,

                    item.productId,

                    item.quantity,

                    item.price
                ]);
                

                const itemQuery = `
                INSERT INTO order_items
                (orderId, productId, quantity, price)
                VALUES ?`;
                connection.query(
                    itemQuery,
                    [values],
                    (err, itemResult) => {

                        if (err) {
                            return callback(err);
                        }

                        callback(null, {

                            orderId,

                            affectedRows:
                                orderResult.affectedRows +
                                itemResult.affectedRows

                        });
                    }
                );
            }
        );
    },

    /**
     * Retrieves all orders with customer details and ordered products.
     */
    getAllOrders: (callback) => {
        const query = `
            SELECT 
                o.id AS orderId, o.totalPrice, o.orderDate, o.status,
                u.id AS userId, u.name AS userName, u.email AS userEmail, u.contactNumber AS userContact,
                oi.id AS itemId, oi.productId, oi.quantity AS itemQuantity, oi.price AS itemPrice,
                p.name AS productName, p.description AS productDescription
            FROM orders o
            LEFT JOIN users u ON o.userId = u.id
            LEFT JOIN order_items oi ON o.id = oi.orderId
            LEFT JOIN products p ON oi.productId = p.id
            ORDER BY o.id DESC
        `;
        connection.query(query, (err, results) => {
            if (err) {
                console.error('Error fetching all orders:', err);
                return callback(err);
            }
            const ordersMap = new Map();
            results.forEach(row => {
                if (!ordersMap.has(row.orderId)) {
                    ordersMap.set(row.orderId, {
                        id: row.orderId,
                        totalPrice: row.totalPrice,
                        orderDate: row.orderDate,
                        status: row.status,
                        customer: row.userId ? {
                            id: row.userId,
                            name: row.userName,
                            email: row.userEmail,
                            contactNumber: row.userContact
                        } : null,
                        products: []
                    });
                }
                if (row.itemId) {
                    ordersMap.get(row.orderId).products.push({
                        id: row.productId,
                        name: row.productName,
                        description: row.productDescription,
                        quantity: row.itemQuantity,
                        price: row.itemPrice,
                        total: Number((row.itemQuantity * row.itemPrice).toFixed(2))
                    });
                }
            });
            callback(null, Array.from(ordersMap.values()));
        });
    },

    /**
     * Retrieves a single order with customer details and full product details by id.
     */
    getOrderById: (id, callback) => {
        const query = `
            SELECT 
                o.id AS orderId, o.totalPrice, o.orderDate, o.status,
                u.id AS userId, u.name AS userName, u.email AS userEmail, u.contactNumber AS userContact,
                oi.id AS itemId, oi.productId, oi.quantity AS itemQuantity, oi.price AS itemPrice,
                p.name AS productName, p.description AS productDescription
            FROM orders o
            LEFT JOIN users u ON o.userId = u.id
            LEFT JOIN order_items oi ON o.id = oi.orderId
            LEFT JOIN products p ON oi.productId = p.id
            WHERE o.id = ?
        `;
        connection.query(query, [id], (err, results) => {
            if (err) {
                console.error('Error fetching order by ID:', err);
                return callback(err);
            }
            if (results.length === 0) return callback(null, null);

            const order = {
                id: results[0].orderId,
                totalPrice: results[0].totalPrice,
                orderDate: results[0].orderDate,
                status: results[0].status,
                customer: results[0].userId ? {
                    id: results[0].userId,
                    name: results[0].userName,
                    email: results[0].userEmail,
                    contactNumber: results[0].userContact
                } : null,
                products: []
            };

            results.forEach(row => {
                if (row.itemId) {
                    order.products.push({
                        id: row.productId,
                        name: row.productName,
                        description: row.productDescription,
                        quantity: row.itemQuantity,
                        price: row.itemPrice,
                        total: Number((row.itemQuantity * row.itemPrice).toFixed(2))
                    });
                }
            });
            callback(null, order);
        });
    },

    /**
     * Updates the status of an existing order.
     */
    updateOrderStatus: (id, status, callback) => {
        const query = 'UPDATE orders SET status = ? WHERE id = ?';
        connection.query(query, [status, id], (err, results) => {
            if (err) {
                console.error('Error updating order status:', err);
                return callback(err);
            }
            callback(null, results);
        });
    },

    /**
     * Deletes an order and its associated items in a transaction.
     */
    deleteOrder: (id, callback) => {
        runInTransaction((conn, txCallback) => {
            // 1. Unlink referencing bills to avoid foreign key errors
            const updateBillsQuery = 'UPDATE bills SET orderId = NULL WHERE orderId = ?';
            conn.query(updateBillsQuery, [id], (err) => {
                if (err) {
                    console.error('Error unlinking bills before delete:', err);
                    return txCallback(err);
                }

                // 2. Delete items
                const deleteItemsQuery = 'DELETE FROM order_items WHERE orderId = ?';
                conn.query(deleteItemsQuery, [id], (err) => {
                    if (err) {
                        console.error('Error deleting order items:', err);
                        return txCallback(err);
                    }

                    // 3. Delete order
                    const deleteOrderQuery = 'DELETE FROM orders WHERE id = ?';
                    conn.query(deleteOrderQuery, [id], (err, orderResult) => {
                        if (err) {
                            console.error('Error deleting order:', err);
                            return txCallback(err);
                        }
                        txCallback(null, orderResult);
                    });
                });
            });
        }, callback);
    }
};

module.exports = orderService;
