const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

const hashedPassword = (password) => {
  const salt = 10;
  const hash = bcryptjs.hashSync(password, salt);
  return hash;
};

const comparePassword = (password, hashedPassword) => {
  return bcryptjs.compareSync(password, hashedPassword);
};


// const AuthCheck = (req, res, next) => {
//   // const token = req?.body?.token || req?.headers["x-access-token"];



//    const authHeader = req.headers.authorization; // get header
//   const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>
//   if (!token) {
//     return res.status(400).json({
//       status: false,
//       message: "please login first to access this apge",
//     });
//   }
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRECT_KEY);
//     req.user = decoded;
//   } catch (error) {
//     return res.status(404).json({
//       status: false,
//       message: "invalid token access",
//     });
//   }
//   next();
// };


const AuthCheck = (req, res, next) => {
  const authHeader = req.headers.authorization; 
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      status: false,
      message: "Please login first to access this page",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY); 
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      status: false,
      message: "Invalid token access",
    });
  }
};

module.exports = { AuthCheck };



module.exports = { hashedPassword, comparePassword, AuthCheck };
