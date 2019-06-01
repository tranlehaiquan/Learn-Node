const express = require('express');
const router = express.Router();
const storeController = require('../controllers/store');
const userController = require('../controllers/user');
const { catchErrors } = require('../handlers/errorHandlers');
const React = require('react');
const reactDOMServer = require('react-dom/server');

// Do work here`
router.get('/', storeController.getStores)
router.get('/add', 
  userController.loginGuarantee,
  storeController.addStore);
  
router.post('/add',
  userController.loginGuarantee,
  storeController.upload,
  catchErrors(storeController.resize),
  catchErrors(storeController.createStore)
)
router.post('/add/:slug',
  userController.loginGuarantee,
  storeController.upload,
  catchErrors(storeController.resize),
  catchErrors(storeController.updateStore))
router.get('/store/:slug', catchErrors(storeController.getStore))
router.get('/store/:slug/edit', 
userController.loginGuarantee, catchErrors(storeController.editStore))

router.get('/tags', catchErrors(storeController.getPostByTag))
router.get('/tags/:tag', catchErrors(storeController.getPostByTag))

router.get('/login', userController.loginPage);
router.post('/login', userController.login);

router.get('/logout', userController.logout);

router.get('/register', userController.registerPage)
router.post('/register',
  userController.registerValidation, 
  catchErrors(userController.register)
);

router.get('/account', userController.accountPage);
router.post('/account', userController.updateAccount);

router.post('/forgot', userController.forgotPassword);

router.get('/account/reset/:token', userController.resetPasswordPage);
router.post('/account/reset', userController.resetPasswordValidation , catchErrors(userController.updatePassword));

router.get('/search', catchErrors(storeController.searchStore));

router.get('/map', storeController.mapPage);
router.get('/mapStores', catchErrors(storeController.mapStores));

class Heading extends React.Component {
  render() {
    return React.createElement("h1", null, this.props.children);
  }
}

router.get('/test', (req, res) => {
  // Send the start of your HTML to the browser
  res.write('<html><head><title>Page</title></head><body><div id="root">');

  const componentStream = reactDOMServer.renderToNodeStream(React.createElement(Heading, null, "abc</br>abc"));

  componentStream.pipe(res, { end: 'false' });
  componentStream.on('end', () => {
    res.end('</div></body></html>');
  });
});

module.exports = router

