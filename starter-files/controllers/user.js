const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const User = mongoose.model('User');
const passport = require('passport'); 
const { LOCAL_LOGIN } = require('../constant');
const crypto = require('crypto');
const { sendMail } = require('../handlers/mail');

exports.loginPage = function(req, res) {
  res.render('login', {title: 'Login Page'});
}

exports.registerPage = function(req, res) {
  res.render('register', {title: 'Register Page'});
}

exports.registerValidation = [
  body('email')
    .isEmail().withMessage('Email không hợp lệ!')
    .normalizeEmail(),
  body('name')
    .not().isEmpty().withMessage('Vui lòng điền tên của bạn')
    .isLength({ min: 5 }).withMessage('Tên ít nhất 5 ký tự')
    .trim().escape(),
  body('password')
    .not().isEmpty().withMessage('Vui lòng điền mật khẩu')
    .isLength({ min: 5 }).withMessage('Mật khẩu phải ít nhất 5 ký tự'),
  body('re-password').custom((value, {req}) => {
    if (value !== req.body.password) throw new Error('Mật khẩu và xác nhận mật khẩu không giống nhau!');
    else return true;
  }),
  sanitizeBody('email').normalizeEmail({
    gmail_remove_dots: false,
    gmail_remove_subaddress: false
  }),
  (req, res, next) => {
    const error = validationResult(req);

    if(!error.isEmpty()) {
      req.flash('error', error.array().map(error => error.msg));
      res.render('register', { 
        title: 'Regsiter', 
        // body: req.body,
        name: req.body.name,
        email: req.body.email, 
        flashes: req.flash()
      });
      return;
    }

    next();
  }
]

exports.register = async function(req, res) {
  const newUser = new User({
    email: req.body.email,
    name: req.body.name
  });

  newUser.setPassword(req.body.password);
  const user = await newUser.save();

  req.login(user, function(err) {
    if(err) {
      req.flash('error', err);
      res.redirect('/');
    }
    req.flash('success', 'Tạo tài khoản thành công!');
    res.redirect('/');
  });
}

exports.logout = async function(req, res) {
  if(req.isAuthenticated()) {
    req.logout();
  }

  req.flash('success', 'You are now logged out!');
  res.redirect('/');
}

exports.loginGuarantee = (req, res, next) => {
  if(req.isAuthenticated()) {
    next();
    return;
  }

  req.flash('error', 'You need login to continue!');
  res.redirect('/login');
}

exports.login = passport.authenticate(LOCAL_LOGIN, {
  successRedirect: '/',
  successMessage: 'Đăng nhập thành công',
  failureRedirect: '/login',
  failureMessage: 'Xin hãy thử lại'
});

exports.updateAccount = async (req, res) => {
  const { email, name } = req.body;
  const userInfo = {
    email, name
  }

  await User.findOneAndUpdate(
    { _id: req.user._id }, 
    { $set: userInfo }, 
    { new: true, runValidators: true, context: 'query' }
  );

  req.flash('success', 'Updated the profile');
  res.redirect('back');
}

exports.accountPage = (req, res) => {
  const { user } = req;
  res.render('account', {title: 'Thông tin tài khoản cá nhân.', user})
}

exports.forgotPassword = async (req, res) => {
  // Check if email is available
  const { email } = req.body;
  const user = await User.findOne({ email });

  if(!user) {
    req.flash('sucess', 'Please check mail to reset password');
    res.redirect('back');
    return;
  }

  // Generate id reset and expire
  user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now

  await user.save();
  // Send it to user email
  const URL_RESET = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`;
  // render back with sucess message
  await sendMail('password-reset', {
    user: {mail: email, subject: 'Store reset your password!!!'},
    resetURL: URL_RESET
  });

  req.flash('success', `Please check your mail to reset password!!!`);
  res.redirect('back');
}

exports.resetPasswordPage = (req, res) => {
  const { token } = req.params;
  res.render('resetPassword', {title: 'Reset your password', token});
}

exports.resetPasswordValidation = [
  body('password')
    .not().isEmpty().withMessage('Vui lòng điền mật khẩu')
    .isLength({ min: 5 }).withMessage('Mật khẩu phải ít nhất 5 ký tự'),
  body('re-password').custom((value, {req}) => {
    if (value !== req.body.password) throw new Error('Mật khẩu và xác nhận mật khẩu không giống nhau!');
    else return true;
  }),
  (req, res, next) => {
    const error = validationResult(req);

    if(!error.isEmpty()) {
      req.flash('error', error.array().map(error => error.msg));
      res.redirect('back');
      return;
    }

    next();
  }
]

exports.updatePassword = async (req, res) => {
  if(!req.body.token) {
    req.flash('error', 'Reset password invalid or expire');
    return res.redirect('/login');
  }

  const user = await User.findOne({
    resetPasswordToken: req.body.token
  });

  if (!user) {
    req.flash('error', 'Reset password invalid or expire');
    return res.redirect('/');
  }

  const isExpire = Date.now() > user.resetPasswordExpires;
  
  // whatever set resetPasswordToken and resetPasswordExpires to undefined
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  if (isExpire) {
    await user.save();
    req.flash('error', 'Reset password invalid or expire');
    return res.redirect('/');
  }

  user.setPassword(req.body.password);

  const updateUser = await user.save();
  await req.login(updateUser);

  req.flash('success', 'Updated password');
  res.redirect('/');
}
