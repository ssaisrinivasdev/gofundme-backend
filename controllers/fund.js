const User = require("../models/user")
const Fund = require("../models/fund");
const {validationResult} = require('express-validator')
var jwt = require('jsonwebtoken')
var expressJwt = require('express-jwt')
const nodemailer = require('nodemailer');
const catchAsync = require("../middleware/catchAsync")
const auth = require("../middleware/auth")
const sendCookie = require('../utils/sendCookie');


//Done
// Get post Details By Id
exports.getFundDetails = catchAsync(async (req, res, next) => {
  try{
    if(req.params.id != null)
    {
      const fund = await Fund.findById(req.params.id)

      return res.status(200).json({
          message: "Success",
          fund,
      });

    }
    else{
      return res.status(404).json({
        error: "Fund not found",
        message: "Error",
      }); 
    }
  }
  catch(err){
    return res.status(400).json({
      error: "Something went wrong",
      message: err.toString()
    }); 
  }  
});

//Done
// Search Funds
exports.searchFunds = catchAsync(async (req, res, next) => {
  try
  {
    var page = req.query.page <= 0 ? 1 : req.query.page;
    var rangeStart = ((page - 1) * 3)+1;
    
    const funds = await Fund.find({
      $and: [{
        $or: [
          {
              title: {
                  $regex: req.query.keyword == null ? "": req.query.keyword,
                  $options: "i",
              },
          },
          {
              tags: {
                  $regex: req.query.keyword == null ? "": req.query.keyword,
                  $options: "i",
              }
          }
        ],
        category: {
          $regex: req.query.category == null ? "": req.query.category,
          $options: "i",
        }
      }]
    })
    .sort({ _id: -1 })
    .skip(rangeStart-1)
    .limit(3);
      
    return res.status(200).json({
      message: "Success",
      funds,
    });

  }
  catch(err){
    return res.status(400).json({
      error: "Something went wrong",
      message: err.toString(),
    }); 
  }
});


//Create Public API to get All fund posts
exports.getAllFunds = (req, res)=>{

  // MySchema.find().sort({ _id: -1 }).limit(2)
  //Count = 21
  User.find((err, resUsers) => {
    if(err){
      return res.status(400).json({
        error: err
      })
    }
    return res.status(200).json({
      "list": resUsers
    })
  }).sort({ _id: -1 }).limit(1)
}

//Updating the user details
exports.addFundUpdates = catchAsync(async (req, res, next) => {

  const {_id } = req.body;

  const newUserData = req.body

  const fund = await Fund.findOne({_id});
  if (userExists && userExists._id.toString() !== req.user._id.toString()) {
      return next(new ErrorHandler("User already exists", 404));
  }
  if (email != req.user.email.toString()) {
      return next(new ErrorHandler("Invalid email", 401));
  }

  //fund.up

  res.status(200).json({
      success: true,
  });
});


//Done
//Create a single post details by the ID.
exports.createFund = (async (req, res, next)=>{
  try{
    var count = 1
    
    const user = await User.findById(req.user._id);

    count++;

    if(!user){
      return res.status(404).json({
        error: "User not found",
        message: "Error"
      }); 
    }

    count++;

    const fundData = {
      owner: user.id,
      title: req.body.title,
      long_description: req.body.long_description,
      images : req.files.map(file => file.location),
      fund_verified_documents: req.body.fund_verified_documents,
      curreny: req.body.currency,
      isverified_status: false,
      fund_type: req.body.fund_type,
      category: req.body.category,
      donations: req.body.donations,
      curreny: req.body.currency,
      goal: req.body.goal,
      currentValue: req.body.currentValue,
      percent: req.body.percent,
      totalDonationsCount: req.body.totalDonationsCount,
      phone: req.body.phone,
      Address: req.body.Address,
      Country: req.body.Country,
      Zip_code: req.body.Zip_code,
      city: req.body.city,
      tags: req.body.tags
    }

    count++

    const fund = await Fund.create(fundData);

    count++

    user.created_funds.push(fund._id);
    count++
    await user.save();
    count++
    return res.status(201).json({
      message: "Success",
      fund
    });
  }
  catch(err){
    return res.status(400).json({
      error: "Something went wrong",
      message: err.toString(),
      "rowcount": count,
    }); 
  }
});

//Done
//TODO: Add get all funds
//Search Funds
exports.fundsByCategory = catchAsync(async (req, res, next) => {
  try{
    var page = (req.query.page == null ? 0 : req.query.page) <= 0 ? 1 : req.query.page;
  
    var rangeStart = ((page - 1) * 3)+1;
    // if(req.query.category){
      const funds = await Fund.find({
          category: {
            $regex: req.query.category == null ? "": req.query.category,
            $options: "i",
        }
      })
      .sort({ _id: -1 })
      .skip(rangeStart-1)
      .limit(3);
      
      return res.status(200).json({
        success: true,
        funds,
      });
    // }
    // else{
    //   return res.status(200).json({
    //     success: true,
    //     result: null,
    //   });
    // }
  }
  catch(err){
    return res.status(400).json({
      error: "Something went wrong",
      message: err.toString(),
    }); 
  }
});




//Done


//Done
//Updating the post details
exports.updateFund = catchAsync(async (req, res, next) => {

  try{
    //TODO: check whether post is belongs to the user in the 
    var fundFromBody = req.body;
    if(fundFromBody.owner == req.user._id){
      await Fund.findByIdAndUpdate(req.params.id, fundFromBody, {
        new: true,
        runValidators: true,
        useFindAndModify: true,
      });
      const fundFromId = await Fund.findById(req.params.id);
      res.status(200).json({
          message: "Success",
          fundFromId
      });
    }
    else{
      return res.status(404).json({
        error: "Invalid fund owner",
        message: "Error"
      }); 
    }
  }
  catch(err){
    return res.status(400).json({
      error: "Something went wrong",
      message: err.toString(),
    }); 
  } 
});