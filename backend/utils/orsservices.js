const axios = require("axios");
require("dotenv").config();

const ORS_API_KEY = process.env.ORS_API_KEY;

const getDistanceInKm = async (fromAddress, toAddress) => {
  try {
    const geocode = async (location, type) => {
      const res = await axios.get("https://api.openrouteservice.org/geocode/search", {
        params: {
          api_key: ORS_API_KEY,
          text: location,
          size: 1,
        },
      });

      if (!res.data.features || res.data.features.length === 0) {
        throw new Error(`Geocoding failed for ${location}`);
      }

      const coords = res.data.features[0].geometry.coordinates; // [lng, lat]
      return coords;
    };

    const [fromCoords, toCoords] = await Promise.all([
      geocode(fromAddress, "Sender"),
      geocode(toAddress, "Receiver"),
    ]);

    const routeRes = await axios.post(
      "https://api.openrouteservice.org/v2/directions/driving-car",
      {
        coordinates: [fromCoords, toCoords],
      },
      {
        headers: {
          Authorization: ORS_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    const distanceInMeters = routeRes.data.routes[0].summary.distance;
    return distanceInMeters / 1000; // Return in kilometers
  } catch (err) {
    console.error("Error getting distance:", err.response?.data || err.message);
    return null; // Return null so main controller can handle failure
  }
};

module.exports = { getDistanceInKm };
