const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  banUser,
  extendSubscription,sendEmail
} = require('../controllers/adminController');

const advancedResults = require('../middlewares/advancedResults');
const User = require('../models/User');

// Re-route into other resource routers
// router.use('/:userId/courses', courseRouter);




router
  .route('/')
  .get(advancedResults(User), getUsers)
  .post(createUser);

router
  .route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

router.put('/:id/ban', banUser);
router.put('/:id/extend', extendSubscription);


router.post("/send-email", sendEmail);


module.exports = router;