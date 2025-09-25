const User = require("../../models/User");



const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password"); 

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Get profile error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};








const updateProfile = async (req, res) => {
  try {
    const { name, licenseNumber } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (licenseNumber) updateData.licenseNumber = licenseNumber;
    if (req.file) updateData.licenseFile = req.file.path; 

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateData,

      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error("Update profile error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};









module.exports = {
  getProfile,
  updateProfile,
};
