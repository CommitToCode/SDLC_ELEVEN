const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    make: { type: String, required: true },
    model: { type: String, required: true }, 
    type: {
      type: String,
      enum: ["SUV", "Sedan", "Hatchback", "Truck", "Van"],
      required: true,
    },
    year: { type: Number, required: true },
    image: { type: String, default: "default-vehicle.jpg" },
    fuelType: {
      type: String,
      enum: ["Petrol", "Diesel", "Electric", "Hybrid"],
      required: true,
    },
    seatingCapacity: { type: Number, required: true },
    location: { type: String, required: true },
    isAvailable: { type: Boolean, default: true },
    dailyRate: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vehicle", vehicleSchema);
