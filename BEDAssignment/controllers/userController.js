const User = require("../models/user.js");

const getHighestScore = async (req, res) => {
    try {
        const usersWithHighestScore = await User.getUserByHighestScore();

        if(usersWithHighestScore.length > 0) {
            res.json(usersWithHighestScore.map(user => ({
                ID: user.id,
                Username: user.Username,
                Score: user.Score
            })));
        } else {
            res.status(404).json({error: "User not found."});
        }
    } catch (err) {
        console.error("Error retrieving the scores.", err);
        res.status(500).json({error: "Error retrieving user with the highest score."});
    }
}

module.exports = { getHighestScore };
