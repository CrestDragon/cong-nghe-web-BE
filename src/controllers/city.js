import City from "../Model/city.js";
export const addCity = async (req, res, next) => {
  try {
    const city = new City({
      ...req.body,
    });
    
    await city.save();

    res.status(200).json({
      message: "Hotel has been created.",
    });
  } catch (err) {
    next(err);
  }
};
