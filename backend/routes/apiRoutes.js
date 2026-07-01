const express = require('express');
const router = express.Router();

// Controllers
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const sparkController = require('../controllers/sparkController');
const videoController = require('../controllers/videoController');
const commentController = require('../controllers/commentController');
const networkController = require('../controllers/networkController');

// Middleware
const { protect } = require('../middleware/authMiddleware');

// 1. Auth routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// 2. User routes
router.get('/users', protect, userController.getUsers);
router.get('/userprofile', protect, userController.getUserProfile);
router.get('/leaderboard', userController.getLeaderboard);

// 3. Spark routes
router.post('/sendspark', protect, sparkController.sendSpark);
router.get('/sentsparks', protect, sparkController.getSentSparks);
router.get('/receivedsparks', protect, sparkController.getReceivedSparks);
router.get('/sparkdashboard', protect, sparkController.getSparkDashboard);
router.put('/changesparkstatus', sparkController.changeSparkStatus);
router.put('/completespark', sparkController.completeSpark);

// 4. Video feed & interaction routes
router.get('/feed', protect, videoController.getFeedWelcome);
router.get('/getfeed', protect, videoController.getFeedVideos);
router.put('/dolike', protect, videoController.toggleLikeVideo);
router.get('/uploadsignature', protect, videoController.getUploadSignature);

// 5. Comment & Reply routes
router.post('/postcomment', protect, commentController.postComment);
router.get('/fetchcomments', protect, commentController.fetchComments);
router.post('/postreply', protect, commentController.postReply);
router.get('/fetchreplies', commentController.fetchReplies);
router.put('/dolikecomment', protect, commentController.toggleLikeComment);

// 6. Network (Connection) routes
router.get('/network', protect, networkController.getNetwork);
router.post('/connect', protect, networkController.sendConnectionRequest);
router.put('/network/respond', protect, networkController.respondConnectionRequest);

module.exports = router;
