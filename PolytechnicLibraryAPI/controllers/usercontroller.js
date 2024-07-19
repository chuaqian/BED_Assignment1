const User = require("../models/user");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

async function registerUser(req, res) {
  const { username, passwordHash, role } = req.body;

  //Sample req Body
  // {
  //   "username": "john_doe",
  //   "passwordHash": "examplePassword123",
  //   "role": "member"
  // }

  try {
    // Validate user data
    // ... your validation logic here ...
    // const errors = validateRegistration(req);
    // if (!errors.isEmpty()) {
    //   return res.status(400).json({ errors: errors.array() });
    // }

    // Check for existing username
    const existingUser = await User.getUserByUsername(username); 
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Hash password
    const salt = await bcryptjs.genSalt(10);
    console.log(username);
    const hashedPassword = await bcryptjs.hash(passwordHash, salt);

    data = {
      username:username,
      passwordHash: hashedPassword,
      role: role
    }
    await User.createUser(data)

    return res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// const validateRegistration = (body)=>{
//     [
//         body.username.isString().isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
//         body.passwordHash.isStrongPassword().withMessage('Password must be strong'),
//         body.role.isIn(['member', 'librarian']).withMessage('Role must be either member or librarian')
//     ];
// } 



async function login(req, res) {
  const { username, password } = req.body;
  try {
    // Validate user credentials
    const user = await User.getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Compare password with hash
    // console.log(user.passwordHash)
    const isMatch = await bcryptjs.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const payload = {
      id: user.id,
      role: user.role,
    };
    const token = jwt.sign(payload, "your_secret_key", { expiresIn: "3600s" }); // Expires in 1 hour

    return res.status(200).json({ token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
}


module.exports = {
    registerUser,
    // validateRegistration
    login
  };