const Product = require("../models/productModels");
const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const ApiFeatures = require("../utils/apifeatures");
const cloudinary = require("cloudinary");

// create new product  -- admin
exports.createProduct = catchAsyncErrors(async (req, res, next) => {
  let images = [];

  if (typeof req.body.images === "string") {
    images.push(req.body.images);
  } else {
    images = req.body.images;
  }

  const imagesLinks = [];

  for (let i = 0; i < images.length; i++) {
    const result = await cloudinary.v2.uploader.upload(images[i], {
      folder: "products",
    });

    imagesLinks.push({
      public_id: result.public_id,
      url: result.secure_url,
    });
  }

  req.body.images = imagesLinks;
  req.body.user = req.user.id;

  const product = await Product.create(req.body);

  return res.status(201).json({
    success: "true",
    message: "product created successfully",
    product,
  });
});

// fetching all products
exports.getAllProducts = catchAsyncErrors(async (req, res, next) => {
  const resultPerPage = 8;
  const productCount = await Product.countDocuments();

  let apiFeature = new ApiFeatures(Product, req.query).search().filter();

  let products = await apiFeature.query;
  let filterProductCount = products.length;

  let apiFeatureFilter = new ApiFeatures(Product, req.query)
    .search()
    .filter()
    .pagination(resultPerPage);
  products = await apiFeatureFilter.query;

  res.status(200).json({
    status: "true",
    products,
    productCount,
    resultPerPage,
    filterProductCount,
  });
});

// update products  -- admin
exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  let images = [];

  if (typeof req.body.images === "string") {
    images.push(req.body.images);
  } else {
    images = req.body.images;
  }

  const imagesLinks = [];
  if (product) {
    if (images) {
      product.images.forEach(async (item) => {
        await cloudinary.v2.uploader.destroy(item.public_id);
      });
      for (let i = 0; i < images?.length; i++) {
        const result = await cloudinary.v2.uploader.upload(images[i], {
          folder: "products",
        });
        imagesLinks.push({
          public_id: result.public_id,
          url: result.secure_url,
        });
      }

      req.body.images = imagesLinks;
    }
    req.body.user = req.user.id;

    await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });

    return res.status(200).json({
      success: true,
      message: "product updated succesfully",
    });
  } else return next(new ErrorHander("product not found", 404));
});

// Delete Product   -- admin
exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    product.images.forEach(async (img) => {
      await cloudinary.v2.uploader.destroy(img.public_id);
    });

    await product.deleteOne();

    return res.status(200).json({
      success: true,
      message: "product deleted succesfully",
    });
  }

  return next(new ErrorHander("product not found", 404));
});

// get product details
exports.getProductDetails = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHander("Invalid Product Id", 404));
  }

  res.status(200).json({
    success: true,
    message: "product details fetched succesfully",
    data: product,
  });
});

// Create new review or update the review
exports.createProductReview = catchAsyncErrors(async (req, res, next) => {
  const { rating, comment, productId } = req.body;

  const review = {
    user: req.user.id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };
  const product = await Product.findById(productId);

  if (!product)
    return next(new ErrorHander("Product not exit with given product-id", 404));

  const isReviewed = await product.reviews.find(
    (rev) => rev.user.toString() === req.user.id.toString()
  );

  if (isReviewed) {
    product.reviews.forEach((rev) => {
      if (rev.user.toString() === req.user.id.toString()) {
        (rev.rating = rating), (rev.comment = comment);
      }
    });
  } else {
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }

  let avg = 0;
  await product.reviews.forEach((rev) => (avg += rev.rating));

  product.ratings = avg / product.numOfReviews;

  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: `${
      isReviewed
        ? "Review upadated successfully"
        : "review created successfully"
    }`,
  });
});

// Get all reviews of a single product
exports.getProductReviews = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.query.id);

  if (!product)
    return next(new ErrorHander("No product exist with given id", 404));

  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});

// Get all reviewed products.
exports.getReviewedProducts = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.find();

  if (!product) return next(new ErrorHander("No product exist", 404));
  const Products = [];

  product.forEach((item) => {
    if (item.numOfReviews > 0) {
      Products.push(item);
    }
  });

  res.status(200).json({
    success: true,
    products: Products,
  });
});

// delete reviews
exports.deleteProductReviews = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.query.productId);

  if (!product)
    return next(new ErrorHander("No product exist with given id", 404));

  const reviews = product.reviews.filter(
    (rev) => rev._id.toString() !== req.query.id.toString()
  );

  let avg = 0;

  reviews.forEach((e) => (avg += e.rating));
  product.reviews = reviews;
  product.numOfReviews = reviews.length;
  product.rating = avg / reviews.length;

  await product.save();

  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});

// admin products
exports.getAdminProducts = catchAsyncErrors(async (req, res, next) => {
  const products = await Product.find();

  res.status(200).json({
    status: "true",
    products,
  });
});
