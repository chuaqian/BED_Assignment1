const { error } = require("console");
const User = require("../models/user.js");
const DBConfig = require("../DBConfig.js");

const getHighestScore = async (req, res) => {
    try {
        const UserWithHighestScore = await User.getUserByHighestScore();

        if(UserWithHighestScore) {
            res.json({"ID": UserWithHighestScore.ID, "Username": UserWithHighestScore.Username, "Score": UserWithHighestScore.Score})
        }
        else{
            res.status(404).json({error: "User not found."})
        }
    }
    catch (err) {
        console.error("Error retrieving the scores.", err)
        res.status(500).json({error: "Error retrieving user with the highest score."})
    }
}

module.exports = {getHighestScore};