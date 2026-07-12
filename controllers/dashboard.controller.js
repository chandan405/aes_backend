const dashboardService = require('../services/dashboard.service');

const dashboardController = {
    /**
     * Gets dashboard details based on the authenticated user's role.
     */
    getDashboardDetails: (req, res) => {
        // Extract properties from JWT payload populated by auth middleware
        const userId = req.user.userId;
        const role = req.user.role;

        dashboardService.getDashboardDetails(userId, role, (err, data) => {
            if (err) {
                console.error('Error in dashboardController.getDashboardDetails:', err);
                return res.status(500).json({ error: 'Error fetching dashboard details.' });
            }
            res.status(200).json(data);
        });
    }
};

module.exports = dashboardController;
