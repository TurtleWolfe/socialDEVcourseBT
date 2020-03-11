const express = require('express');
const { check } = require('express-validator');
const {
    createPost,
    readPosts,
    readPost,
    updatePost,
    deletePost,
    likePost,
    unlikePost,
    createComment,
    deleteComment,
} = require('../controllers/posts');

const Post = require('../models/Post');

const router = express.Router({ mergeParams: true });

const advancedResults = require('../middleware/advancedResults');
const { protect } = require('../middleware/auth');

router.use(protect);
// router.use(authorize('admin'));

router
    .route('/')
    .get(advancedResults(Post), readPosts)
    .post([
        check('text', 'Text is required')
            .not()
            .isEmpty()
    ],
        createPost);

router
    .route('/:id')
    .get(advancedResults(Post), readPost)
    // .put(updatePost)
    .delete(deletePost);

router
    .route('/comment')
    .put([
        check('text', 'Text is required')
            .not()
            .isEmpty()
    ],
        createComment);

router
    .route('/comment/:id')
    // router.delete('/comment/:id', auth, async (req, res) => {
    .put([
        check('text', 'Text is required')
            .not()
            .isEmpty()
    ],
        createComment);
// .delete(deleteComment);

router
    .route('/comment/:id/:comment_id')
    // router.delete('/comment/:id', auth, async (req, res) => {
    // .put([
    //     check('text', 'Text is required')
    //         .not()
    //         .isEmpty()
    // ],
    //     createComment)
    .delete(deleteComment);
// @route    DELETE api/v1/posts/comment/:id/:comment_id
// @route    DELETE api/v1/posts/comment/:id(post id)/:comment_id(followed by comment id)
// @desc     Delete comment
// @access   Private

router
    .route('/like/:id')
    // @route    PUT api/v1/posts/unlike/:id
    // @desc     Unlike a post
    // router.delete('/like/:id', auth, async (req, res) => {
    .put(likePost)
    .delete(unlikePost);

module.exports = router;
