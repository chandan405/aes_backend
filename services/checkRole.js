require('dotenv').config();

function checkRole(req,res,next) {
    // const userRole = req.user.role; 
    // if (userRole !== 'admin') {
    console.log("User locals:", req.user);
    const userRole = req.user.role; 
    if (userRole !== process.env.USER) {
        return res.status(403).json({ error: 'Access denied. Admins only.' });
    }
    next();

}

module.exports = { checkRole };