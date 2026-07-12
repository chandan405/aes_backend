const orderService = require('../services/orderService');

const VALID_STATUSES = ['Pending', 'Preparing', 'Completed', 'Cancelled'];

const orderController = {
    /**
     * Creates a new order.
     */
    createOrder: (req, res) => {
        const { items, totalPrice, status } = req.body;

        console.log('Received order creation request:', { items, totalPrice, status });
        // userId can be taken from req.body or extracted from the JWT token (req.user.userId)
        const userId = req.body.userId || (req.user && req.user.userId);

        // Validation
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Order must contain at least one item.' });
        }

        for (const item of items) {
            if (!item.productId || !item.quantity || item.price === undefined) {
                return res.status(400).json({ error: 'Each item must have a productId, quantity, and price.' });
            }
            if (Number(item.quantity) <= 0 || Number(item.price) < 0) {
                return res.status(400).json({ error: 'Invalid quantity or price value.' });
            }
        }

        if (totalPrice === undefined || isNaN(totalPrice) || Number(totalPrice) < 0) {
            return res.status(400).json({ error: 'Valid totalPrice is required.' });
        }

        if (status && !VALID_STATUSES.some(s => s.toLowerCase() === status.toLowerCase())) {
            return res.status(400).json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` });
        }

        // Format status to standard casing
        let standardStatus = 'Pending';
        if (status) {
            standardStatus = VALID_STATUSES.find(s => s.toLowerCase() === status.toLowerCase()) || 'Pending';
        }

        const orderData = {
            userId,
            items,
            totalPrice: Number(totalPrice),
            status: standardStatus
        };

        orderService.createOrder(orderData, (err, result) => {
            if (err) {
                console.error('Error creating order in controller:', err);
                return res.status(500).json({ error: 'Error creating order.' });
            }
            res.status(201).json({
                message: 'Order created successfully.',
                orderId: result.orderId
            });
        });
    },

    /**
     * Retrieves all orders.
     */
    getAllOrders: (req, res) => {
        orderService.getAllOrders((err, orders) => {
            if (err) {
                console.error('Error fetching all orders in controller:', err);
                return res.status(500).json({ error: 'Error fetching orders.' });
            }
            res.status(200).json(orders);
        });
    },

    /**
     * Retrieves a single order by ID.
     */
    getOrderById: (req, res) => {
        const id = req.params.id || req.query.id;
        
        if (!id || isNaN(id)) {
            return res.status(400).json({ error: 'Valid Order ID is required.' });
        }

        orderService.getOrderById(id, (err, order) => {
            if (err) {
                console.error('Error fetching order by ID in controller:', err);
                return res.status(500).json({ error: 'Error fetching order.' });
            }
            if (!order) {
                return res.status(404).json({ error: 'Order not found.' });
            }
            res.status(200).json(order);
        });
    },

    /**
     * Updates order status.
     */
    updateOrderStatus: (req, res) => {
        const id = req.params.id || req.body.id;
        const { status } = req.body;

        if (!id || isNaN(id)) {
            return res.status(400).json({ error: 'Valid Order ID is required.' });
        }

        if (!status) {
            return res.status(400).json({ error: 'Status is required.' });
        }

        const standardStatus = VALID_STATUSES.find(s => s.toLowerCase() === status.toLowerCase());
        if (!standardStatus) {
            return res.status(400).json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` });
        }

        orderService.updateOrderStatus(id, standardStatus, (err, results) => {
            if (err) {
                console.error('Error updating order status in controller:', err);
                return res.status(500).json({ error: 'Error updating order status.' });
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ error: 'Order not found.' });
            }
            res.status(200).json({ message: 'Order status updated successfully.' });
        });
    },

    /**
     * Deletes an order.
     */
    deleteOrder: (req, res) => {
        const id = req.params.id;

        if (!id || isNaN(id)) {
            return res.status(400).json({ error: 'Valid Order ID is required.' });
        }

        orderService.deleteOrder(id, (err, results) => {
            if (err) {
                console.error('Error deleting order in controller:', err);
                return res.status(500).json({ error: 'Error deleting order.' });
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ error: 'Order not found.' });
            }
            res.status(200).json({ message: 'Order and associated items deleted successfully.' });
        });
    }
};

module.exports = orderController;
