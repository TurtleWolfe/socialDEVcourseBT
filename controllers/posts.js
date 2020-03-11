const normalize = require('normalize-url');
const { validationResult } = require('express-validator');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const advancedResults = require('../middleware/advancedResults');
const User = require('../models/User');
const Profile = require('../models/Profile');
const Post = require('../models/Post');

// @route    POST api/v1/posts
// @desc     Create a post
// @access   Private
exports.createPost = asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    // Validation Errors carried in from //routes/_-_-.js
    if (!errors.isEmpty()) {
        console.log(errors.array());
        return res.status(422).json({
            success: false,
            errors: errors.array()
        });
    }

    try {
        const user = await User.findById(req.user.id).select('-password');

        const newPost = new Post({
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        });

        const post = await newPost.save();

        res.json(post);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error::: /POST /api/v1/posts');
    }
});

// @route    GET api/v1/posts
// @desc     Get all posts
// @access   Private
exports.readPosts = asyncHandler(async (req, res, next) => {
    try {
        const posts = await Post.find().sort({ date: -1 });
        res.status(200).json(res.advancedResults);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error::: //GET /api/v1/Posts');
    }
});

// @route    GET api/v1/posts/:id
// @desc     Get post by ID
// @access   Private
exports.readPost = asyncHandler(async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);

        // Check for ObjectId format and post
        if (!req.params.id.match(/^[0-9a-fA-F]{24}$/) || !post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        res.json(post);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route    DELETE api/v1/posts/:id
// @desc     Delete a post
// @access   Private
exports.deletePost = asyncHandler(async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);

        // Check for ObjectId format and post
        if (!req.params.id.match(/^[0-9a-fA-F]{24}$/) || !post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        // Check user
        if (post.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        await post.remove();

        res.json({ msg: 'Post removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route    PUT api/v1/posts/like/:id
// @desc     Like a post
// @access   Private
exports.likePost = asyncHandler(async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);

        // Check if the post has already been liked
        if (
            post.likes.filter(like => like.user.toString() === req.user.id).length > 0
        ) {
            return res.status(400).json({ msg: 'Post already liked' });
        }

        post.likes.unshift({ user: req.user.id });

        await post.save();

        res.json(post.likes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route    PUT api/v1/posts/unlike/:id
// @desc     Unlike a post
// @access   Private
exports.unlikePost = asyncHandler(async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);

        // Check if the post has already been liked
        if (
            post.likes.filter(like => like.user.toString() === req.user.id).length ===
            0
        ) {
            return res.status(400).json({ msg: 'Post has not yet been liked' });
        }

        // Get remove index
        const removeIndex = post.likes
            .map(like => like.user.toString())
            .indexOf(req.user.id);

        post.likes.splice(removeIndex, 1);

        await post.save();

        res.json(post.likes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route    POST api/v1/posts/comment/:id
// @desc     Comment on a post
// @access   Private
exports.createComment = asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const user = await User.findById(req.user.id).select('-password');
        const post = await Post.findById(req.params.id);

        const newComment = {
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        };

        post.comments.unshift(newComment);

        await post.save();

        res.json(post.comments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route    DELETE api/v1/posts/comment/:id/:comment_id
// @desc     Delete comment
// @access   Private
exports.deleteComment = asyncHandler(async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);

        // Pull out comment
        const comment = post.comments.find(
            comment => comment.id === req.params.comment_id
        );
        // Make sure comment exists
        if (!comment) {
            return res.status(404).json({ msg: 'Comment does not exist' });
        }
        // Check user
        if (comment.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        post.comments = post.comments.filter(
            ({ id }) => id !== req.params.comment_id
        );

        await post.save();

        return res.json(post.comments);
    } catch (err) {
        console.error(err.message);
        return res.status(500).send('Server Error');
    }
});