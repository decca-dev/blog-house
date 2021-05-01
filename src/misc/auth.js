module.exports = {
    ensureAuthenticated: function(req, res, next){
        if (req.isAuthenticated()) {
            return next()
        }else {
            req.flash('error_msg', 'Please login first to view this route')
            res.redirect('/401')
        }
    }
}