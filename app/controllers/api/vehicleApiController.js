// controllers/vehicleApiController.js
const Vehicle = require("../../models/Vehicle");

// @desc Add a new vehicle
exports.addVehicle = async (req, res) => {
  try {
    const vehicle = new Vehicle(req.body);
    await vehicle.save();
    res.status(201).json({ success: true, data: vehicle });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc Get all vehicles
exports.getAllVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    res.status(200).json({ success: true, data: vehicles });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc Get vehicle by ID
exports.getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res
        .status(404)
        .json({ success: false, message: "Vehicle not found" });
    }
    res.status(200).json({ success: true, data: vehicle });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc Update vehicle
exports.updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!vehicle) {
      return res
        .status(404)
        .json({ success: false, message: "Vehicle not found" });
    }
    res.status(200).json({ success: true, data: vehicle });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc Delete vehicle
exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) {
      return res
        .status(404)
        .json({ success: false, message: "Vehicle not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Vehicle deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc Get available vehicles by location
exports.getAvailableVehicles = async (req, res) => {
  try {
    const { location } = req.query;
    const filter = { isAvailable: true };
    if (location) filter.location = location;

    const vehicles = await Vehicle.find(filter);
    res.status(200).json({ success: true, data: vehicles });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
