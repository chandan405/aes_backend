const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../services/authentication');
const { sendMail } = require('../services/emailService');
const connection = require('../connection');
const uuid = require('uuid');
const orderService = require('../services/orderService');

// Create a new order
router.post('/create', auth.authenticateToken, orderController.createOrder);

// Checkout (create order, generate bill, send email invoice)
router.post('/checkout', auth.authenticateToken, (req, res) => {
    const { items, totalPrice, restaurantName, customerName, contactNumber, paymentMethod } = req.body;
    const userId = req.user.userId;
    const email = req.user.email;

    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Order must contain at least one item.' });
    }

    const orderData = {
        userId,
        items,
        totalPrice: Number(totalPrice),
        status: 'Completed'
    };

    orderService.createOrder(orderData, (err, orderResult) => {
        if (err) {
            console.error('Error creating order during checkout:', err);
            return res.status(500).json({ error: 'Error creating order.' });
        }
        
        const orderId = orderResult.orderId;
        const invoiceId = uuid.v4();

        // Insert into bills table
        const query = 'INSERT INTO bills (name, uuid, email, contactNumber, paymentMethod, totalAmount, productDetails, createdBy, orderId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
        const productDetailsJson = items.map(item => ({
            productId: item.productId,
            name: item.name,
            quantity: item.quantity,
            price: item.price
        }));

        connection.query(query, [
            customerName || 'Customer',
            invoiceId,
            email,
            contactNumber || '0000000000',
            paymentMethod || 'Cash On Delivery',
            totalPrice,
            JSON.stringify(productDetailsJson),
            email,
            orderId
        ], (billErr, billResult) => {
            if (billErr) {
                console.error('Error creating bill in checkout:', billErr);
            }

            // Prepare Email Content
            let itemsHtml = '';
            const gst = 30; // standard mock GST
            
            items.forEach(item => {
                itemsHtml += `<tr>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.name}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">₹${item.price}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
                </tr>`;
            });

            const emailHtml = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #f59e0b; text-align: center;">Order Confirmed!</h2>
                    <p>Dear ${customerName || 'Customer'},</p>
                    <p>Your order has been successfully placed at <strong>${restaurantName || 'Pizza Hub'}</strong>.</p>
                    
                    <h4 style="margin-bottom: 5px;">Order Details:</h4>
                    <table style="width: 100%; border-collapse: collapse; text-align: left;">
                        <thead>
                            <tr style="background-color: #f9fafb;">
                                <th style="padding: 8px; border-bottom: 2px solid #ddd;">Item</th>
                                <th style="padding: 8px; border-bottom: 2px solid #ddd; text-align: center;">Qty</th>
                                <th style="padding: 8px; border-bottom: 2px solid #ddd; text-align: right;">Price</th>
                                <th style="padding: 8px; border-bottom: 2px solid #ddd; text-align: right;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                    </table>
                    
                    <div style="margin-top: 20px; text-align: right; line-height: 1.8;">
                        <p style="margin: 0;">Subtotal: <strong>₹${totalPrice.toFixed(2)}</strong></p>
                        <p style="margin: 0;">GST: <strong>₹${gst.toFixed(2)}</strong></p>
                        <h3 style="margin: 5px 0 0 0; color: #10b981;">Total Paid: ₹${(totalPrice + gst).toFixed(2)}</h3>
                    </div>
                    
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p style="text-align: center; color: #9ca3af; font-size: 12px;">Thank you for ordering with Cafe Management System!</p>
                </div>
            `;

            // Send Mail
            sendMail({
                to: email,
                subject: 'Order Invoice - ' + (restaurantName || 'Pizza Hub'),
                html: emailHtml
            }).then(() => {
                res.status(201).json({
                    message: 'Order checkout successful.',
                    orderId,
                    invoiceId
                });
            }).catch(mailErr => {
                console.error('Mail send error in checkout:', mailErr);
                res.status(201).json({
                    message: 'Order checkout successful (Email dispatch failed).',
                    orderId,
                    invoiceId
                });
            });
        });
    });
});

// Return all orders (or a single order if query parameter 'id' is provided)
router.get('/', auth.authenticateToken, (req, res) => {
    if ((req.query && req.query.id) || (req.body && req.body.id)) {
        return orderController.getOrderById(req, res);
    }
    return orderController.getAllOrders(req, res);
});

// Return a single order with complete details by URL parameter ID
router.get('/:id', auth.authenticateToken, orderController.getOrderById);

// Update order status by URL parameter ID
router.put('/status/:id', auth.authenticateToken, orderController.updateOrderStatus);

// Fallback: Update order status by ID in request body/param
router.put('/status', auth.authenticateToken, orderController.updateOrderStatus);

// Delete order and related order items by ID inside a transaction
router.delete('/:id', auth.authenticateToken, orderController.deleteOrder);

module.exports = router;
