const connection = require('../connection');

/**
 * Helper to run a callback-based mysql2 query as a Promise.
 */
const queryPromise = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        connection.query(sql, params, (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results);
        });
    });
};

const dashboardService = {
    /**
     * Retrieves dashboard metrics.
     * Admins/Managers/Cashiers see global metrics.
     * Customers see personalized metrics.
     */
    getDashboardDetails: (userId, role, callback) => {
        const lowerRole = (role || '').toLowerCase();
        const isStaff = ['admin', 'manager', 'cashier'].includes(lowerRole);
        const params = isStaff ? [] : [userId];

        const queries = {
            totalRevenue: isStaff
                ? queryPromise("SELECT COALESCE(SUM(totalPrice), 0) AS totalRevenue FROM orders WHERE status != 'Cancelled'")
                : queryPromise("SELECT COALESCE(SUM(totalPrice), 0) AS totalRevenue FROM orders WHERE userId = ? AND status != 'Cancelled'", params),

            totalOrders: isStaff
                ? queryPromise("SELECT COUNT(*) AS totalOrders FROM orders")
                : queryPromise("SELECT COUNT(*) AS totalOrders FROM orders WHERE userId = ?", params),

            totalCustomers: isStaff
                ? queryPromise("SELECT COUNT(*) AS totalCustomers FROM users WHERE role = 'user'")
                : Promise.resolve([{ totalCustomers: 1 }]),

            averageOrderValue: isStaff
                ? queryPromise("SELECT COALESCE(AVG(totalPrice), 0) AS averageOrderValue FROM orders WHERE status != 'Cancelled'")
                : queryPromise("SELECT COALESCE(AVG(totalPrice), 0) AS averageOrderValue FROM orders WHERE userId = ? AND status != 'Cancelled'", params),

            recentOrders: isStaff
                ? queryPromise(`
                    SELECT o.id, o.totalPrice, o.orderDate, o.status, COALESCE(u.name, 'Unknown') AS customerName 
                    FROM orders o 
                    LEFT JOIN users u ON o.userId = u.id 
                    ORDER BY o.orderDate DESC 
                    LIMIT 5
                  `)
                : queryPromise(`
                    SELECT o.id, o.totalPrice, o.orderDate, o.status, COALESCE(u.name, 'Unknown') AS customerName 
                    FROM orders o 
                    LEFT JOIN users u ON o.userId = u.id 
                    WHERE o.userId = ? 
                    ORDER BY o.orderDate DESC 
                    LIMIT 5
                  `, params),

            popularProducts: isStaff
                ? queryPromise(`
                    SELECT p.name AS productName, CAST(SUM(oi.quantity) AS SIGNED) AS totalSold, CAST(SUM(oi.quantity * oi.price) AS DECIMAL(10, 2)) AS totalRevenue 
                    FROM order_items oi 
                    JOIN products p ON oi.productId = p.id 
                    GROUP BY oi.productId, p.name 
                    ORDER BY totalSold DESC 
                    LIMIT 5
                  `)
                : queryPromise(`
                    SELECT p.name AS productName, CAST(SUM(oi.quantity) AS SIGNED) AS totalSold, CAST(SUM(oi.quantity * oi.price) AS DECIMAL(10, 2)) AS totalRevenue 
                    FROM order_items oi 
                    JOIN products p ON oi.productId = p.id 
                    JOIN orders o ON oi.orderId = o.id 
                    WHERE o.userId = ? 
                    GROUP BY oi.productId, p.name 
                    ORDER BY totalSold DESC 
                    LIMIT 5
                  `, params),

            monthlyRevenue: isStaff
                ? queryPromise(`
                    SELECT DATE_FORMAT(orderDate, '%Y-%m') AS month, CAST(SUM(totalPrice) AS DECIMAL(10, 2)) AS revenue 
                    FROM orders 
                    WHERE status != 'Cancelled' 
                    GROUP BY DATE_FORMAT(orderDate, '%Y-%m') 
                    ORDER BY month DESC 
                    LIMIT 6
                  `)
                : queryPromise(`
                    SELECT DATE_FORMAT(orderDate, '%Y-%m') AS month, CAST(SUM(totalPrice) AS DECIMAL(10, 2)) AS revenue 
                    FROM orders 
                    WHERE userId = ? AND status != 'Cancelled' 
                    GROUP BY DATE_FORMAT(orderDate, '%Y-%m') 
                    ORDER BY month DESC 
                    LIMIT 6
                  `, params),

            orderStatus: isStaff
                ? queryPromise("SELECT status, COUNT(*) AS count FROM orders GROUP BY status")
                : queryPromise("SELECT status, COUNT(*) AS count FROM orders WHERE userId = ? GROUP BY status", params),

            categorySales: isStaff
                ? queryPromise(`
                    SELECT c.name AS categoryName, CAST(SUM(oi.quantity * oi.price) AS DECIMAL(10, 2)) AS sales 
                    FROM order_items oi 
                    JOIN products p ON oi.productId = p.id 
                    JOIN categories c ON p.categoryId = c.id 
                    GROUP BY c.id, c.name 
                    ORDER BY sales DESC
                  `)
                : queryPromise(`
                    SELECT c.name AS categoryName, CAST(SUM(oi.quantity * oi.price) AS DECIMAL(10, 2)) AS sales 
                    FROM order_items oi 
                    JOIN products p ON oi.productId = p.id 
                    JOIN categories c ON p.categoryId = c.id 
                    JOIN orders o ON oi.orderId = o.id 
                    WHERE o.userId = ? 
                    GROUP BY c.id, c.name 
                    ORDER BY sales DESC
                  `, params)
        };

        Promise.all(Object.values(queries))
            .then(results => {
                const keys = Object.keys(queries);
                const data = {};
                keys.forEach((key, index) => {
                    data[key] = results[index];
                });

                // Format structure exactly as requested
                const responseData = {
                    stats: {
                        totalRevenue: Number(Number(data.totalRevenue[0].totalRevenue).toFixed(2)) || 0,
                        totalOrders: Number(data.totalOrders[0].totalOrders) || 0,
                        totalCustomers: Number(data.totalCustomers[0].totalCustomers) || 0,
                        averageOrderValue: Number(Number(data.averageOrderValue[0].averageOrderValue).toFixed(2)) || 0
                    },
                    recentOrders: data.recentOrders.map(o => ({
                        id: o.id,
                        totalPrice: Number(Number(o.totalPrice).toFixed(2)),
                        orderDate: o.orderDate,
                        status: o.status,
                        customerName: o.customerName
                    })),
                    popularProducts: data.popularProducts.map(p => ({
                        productName: p.productName,
                        totalSold: Number(p.totalSold) || 0,
                        totalRevenue: Number(Number(p.totalRevenue).toFixed(2)) || 0
                    })),
                    orderStatus: data.orderStatus.map(os => ({
                        status: os.status,
                        count: Number(os.count) || 0
                    })),
                    monthlyRevenue: data.monthlyRevenue.map(mr => ({
                        month: mr.month,
                        revenue: Number(Number(mr.revenue).toFixed(2)) || 0
                    })),
                    categorySales: data.categorySales.map(cs => ({
                        categoryName: cs.categoryName,
                        sales: Number(Number(cs.sales).toFixed(2)) || 0
                    }))
                };

                callback(null, responseData);
            })
            .catch(err => {
                console.error("Database query error in dashboardService:", err);
                callback(err);
            });
    }
};

module.exports = dashboardService;
