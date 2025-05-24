const mongoose = require('mongoose');
 
const cloudinary = require('../config/cloudinary');  // Adjust the path to Cloudinary config
const path = require('path');  // To resolve image file paths

const vehicleSeeder = async () => {
  const vehicleData = {
    name: "MT-15",
    brand: "Yamaha",
    model: "MT-15",
    year: "2023",
    fuelType: "Petrol",
    transmission: "Manual",
    seatingCapacity: 2,
    rentPerDay: 1200,
    description: "The Yamaha MT-15 is a naked streetfighter motorcycle...",
    images: [
      path.join(__dirname, 'public/images/img1.jpg'),  // Make sure the file exists
      path.join(__dirname, 'public/images/img2.jpg')
    ],
    adminId: "603c72ef1f8e4d24b4b9c039",  // Admin ID
    licensePlateNumber: "MT15-AB1234",
    vehicleType: "Motorbikes",
    mileage: 35,
    isTuned: true,
    lastInsuranceDate: "2023-06-15",
    availableStatus: true
  };

  try {
    const imageUploads = await Promise.all(vehicleData.images.map(async (imagePath) => {
      const uploadedImage = await cloudinary.uploader.upload(imagePath, {
        folder: "vehicles"
      });
      return { url: uploadedImage.secure_url, public_id: uploadedImage.public_id };
    }));

    const vehicle = new Vehicle({
      ...vehicleData,
      images: imageUploads
    });

    await vehicle.save();
    console.log("Vehicle added successfully!");

  } catch (error) {
    console.error("Error seeding vehicle data:", error);
  } finally {
    mongoose.disconnect();  // Close MongoDB connection
  }
};

mongoose.connect('mongodb+srv://KeerthiDev:9AkQP1TaAYasb09H@keerthidev.stiw0.mongodb.net/vehiclerental?retryWrites=true&w=majority')  // Replace with your MongoDB URI
  .then(() => {
    console.log("Connected to MongoDB!");
    vehicleSeeder();  // Run the seeder
  })
  .catch(err => {
    console.error("MongoDB connection error:", err);
  });
