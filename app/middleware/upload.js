const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});

// Optional file support
const fileFilter = (req, file, cb) => {
  if (!file) {
    cb(null, true); // allow no file
  } else {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    cb(extname ? null : new Error("Only images allowed"), extname);
  }
};

module.exports = multer({ storage, fileFilter });
