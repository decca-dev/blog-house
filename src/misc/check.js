module.exports.checkBanned = async (req, res, next) => {
    if (req.user) {
        if (req.user.isBanned) {
            res.render('errors/banned', { title: "BlogHouse", description: "Enjoy the best blogging experience!\nCreate an account or checkout blogs by others.", route: "" })
        }else {
            return next()
        }
    }else {
        return next()
    }
}

module.exports.checkAdmin = async (req, res, next) => {
    if (req.user) {
        if (req.user.isAdmin == false) {
            res.redirect('/403')
        }else {
            return next()
        }
    }
}