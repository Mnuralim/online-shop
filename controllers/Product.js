import Product from "../models/ProductModel.js";
import slugify from "slugify";
import User from "../models/UserModel.js";

export const createProduct = async (req, res) => {
  const { title, description, price, category, brand, quantity, color } = req.body;

  const urls = [];
  const files = req.files;
  for (const file of files) {
    const newPath = file.path;
    urls.push(newPath);
  }

  try {
    const data = await Product.create({
      title: title,
      slug: slugify(title),
      description: description,
      price: price,
      category: category,
      brand: brand,
      quantity: quantity,
      color: color,
      images: urls.map((url) => {
        return { url };
      }),
    });
    res.status(200).json({
      msg: "Success",
      data: data,
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const getProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await Product.findById(id);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const getAllProducts = async (req, res) => {
  //filtering
  const filter = {};
  if (req.query.brand) {
    filter.brand = { $regex: `^${req.query.brand}$`, $options: "i" };
  }

  if (req.query.pricelte && req.query.pricegte) {
    filter.price = { $gte: req.query.pricegte, $lte: req.query.pricelte };
  }

  //sorting
  let sorting = req.query.sortBy;

  if (sorting) {
    sorting = sorting.split(",").join(" ");
  } else {
    sorting = "createdAt";
  }

  //limiting fieds
  let field = req.query.field;
  if (field) {
    field = field.split(",").join(" ");
  } else {
    field = "-__v";
  }

  //pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 100;
  const skip = (page - 1) * limit;

  const countDoc = await Product.countDocuments();
  console.log(countDoc);
  if (skip >= countDoc) {
    return res.status(404).json({ msg: "This page doesn't exists" });
  }

  try {
    const data = await Product.find(filter)
      .sort({ [sorting]: 1 })
      .select(field)
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      page: page,
      limit: limit,
      data: data,
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { title, description, price, category, brand, quantity, color } = req.body;
  const urls = [];
  const files = req.files;
  for (const file of files) {
    const newPath = file.path;
    urls.push(newPath);
  }

  let slug;
  if (title) {
    slug = slugify(title);
  }

  try {
    const data = await Product.findByIdAndUpdate(
      id,
      {
        title: title,
        slug: slug,
        description: description,
        price: price,
        category: category,
        brand: brand,
        quantity: quantity,
        color: color,
        images: urls.map((url) => {
          return { url };
        }),
      },
      {
        new: true,
      }
    );
    res.status(200).json({
      msg: "success updated",
      data: data,
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await Product.findByIdAndDelete(id);
    res.status(200).json({
      msg: "success deleted",
      data: data,
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const addToWishlist = async (req, res) => {
  const { id } = req.user;
  const { prodId } = req.body;

  try {
    const user = await User.findById(id);
    const alreadyAdded = user.wishlist.find((id) => id.toString() === prodId.toString());
    console.log(alreadyAdded);

    let wish;
    if (alreadyAdded) {
      wish = await User.findByIdAndUpdate(
        id,
        {
          $pull: { wishlist: prodId },
        },
        {
          new: true,
        }
      );
    } else {
      wish = await User.findByIdAndUpdate(
        id,
        {
          $push: { wishlist: prodId },
        },
        {
          new: true,
        }
      );
    }
    res.json(wish);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const rating = async (req, res) => {
  const { id } = req.user;
  const { prodId, comment, star } = req.body;

  try {
    const product = await Product.findById(prodId);
    const alreadyAdded = product.ratings.find((rating) => rating.postedby.toString() === id.toString());
    console.log(alreadyAdded);

    if (alreadyAdded) {
      await Product.updateOne(
        { ratings: { $elemMatch: alreadyAdded } },
        {
          $set: {
            "ratings.$.star": star,
            "ratings.$.comment": comment,
          },
        },
        {
          new: true,
        }
      );
    } else {
      await Product.findByIdAndUpdate(
        prodId,
        {
          $push: {
            ratings: {
              star: star,
              comment: comment,
              postedby: id,
            },
          },
        },
        {
          new: true,
        }
      );
    }

    const getAllRatings = await Product.findById(prodId);
    const totalRating = getAllRatings.ratings.length;
    const totalStar = getAllRatings.ratings.map((rating) => rating.star).reduce((prev, curr) => prev + curr);
    const actualRating = Math.round(totalStar / totalRating);

    const updateProduct = await Product.findByIdAndUpdate(
      prodId,
      {
        totalRating: actualRating,
      },
      {
        new: true,
      }
    );

    res.json(updateProduct);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// export const uploadImages = async (req, res) => {
//   const { id } = req.params;

//   try {
//     const urls = [];
//     const files = req.files;
//     for (const file of files) {
//       const newPath = file.path;
//       urls.push(newPath);
//     }

//     const addImages = await Product.findByIdAndUpdate(
//       id,
//       {
//         images: urls.map((url) => {
//           return { url };
//         }),
//       },
//       {
//         new: true,
//       }
//     );
//     res.json(addImages);
//   } catch (error) {
//     res.status(500).json({ msg: error.message });
//   }
// };
