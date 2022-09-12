const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = mongoose.model("User");

module.exports = (req, res, next) => {
    const { auth } = req.headers;
    console.log(req.headers);
    if (!auth) {
        let error = new Error("You must be logged in");
        error.code = 401;
        return res.status(error.code).json(error.message);
    }

    const token = auth.replace("Owner ", "");

    jwt.verify(token, process.env.SECRET_KEY, async (err, payload) => {
        if (err) {
            let error = new Error("You must be logged in");
            error.code = 401;
            return res.status(error.code).json(error.message);
        }

        const { userId } = payload;
        const user = await User.findById(userId);
        req.user = user;
        next();
    });
};
