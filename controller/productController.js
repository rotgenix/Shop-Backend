const Product = require("../models/productModels");
const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const ApiFeatures = require("../utils/apifeatures");

// create new product  -- admin
exports.createProduct = catchAsyncErrors(async (req, res, next) => {
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
  const resultPerPage = 5;
  const productCount = await Product.countDocuments();

  const apiFeature = new ApiFeatures(Product, req.query)
    .search()
    .filter()
    .pagination(resultPerPage);

  const products = await apiFeature.query;

  res.status(200).json({
    status: "true",
    products,
    productCount,
  });
});

// update products  -- admin

exports.updateProduct = catchAsyncErrors(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
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
    return next(new ErrorHander("product not found", 404));
  }

  res.status(500).json({
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

  const isReviewed = product.reviews.find(
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

// Get all reviews of a product
exports.getProductReviews = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.query.id);

  if (!product)
    return next(new ErrorHander("No product exist with given id", 404));

  res.status(200).json({
    success: true,
    reviews: product.reviews,
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
  product.ratings = avg / reviews.length;

  await product.save();

  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});
