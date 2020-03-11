const normalize = require('normalize-url');
const { validationResult } = require('express-validator');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const advancedResults = require('../middleware/advancedResults');
const User = require('../models/User');
const Profile = require('../models/Profile');

// @desc      Create a new Profile                                 CREATE or
// @route     POST /api/v1/profiles                                   UPDATE
// @access    Private/Admin
exports.createProfile = asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    // Validation Errors carried in from //routes/auth.js
    if (!errors.isEmpty()) {
        console.log(errors.array());
        return res.status(422).json({
            success: false,
            errors: errors.array()
        });
    }

    const {
        company,
        location,
        website,
        bio,
        skills,
        status,
        githubusername,
        youtube,
        twitter,
        instagram,
        linkedin,
        facebook
    } = req.body;

    // Build Profile Object
    const profileFields = {
        user: req.user.id,
        company,
        location,
        website: website === '' ? '' : normalize(website, { forceHttps: true }),
        bio,
        skills: Array.isArray(skills)
            ? skills
            : skills.split(',').map(skill => ' ' + skill.trim()),
        status,
        githubusername
    };

    // Build social object and add to profileFields
    const socialfields = { youtube, twitter, instagram, linkedin, facebook };

    // for (const [key, value] of Object.entries(socialfields)) {
    //     if (value.length > 0)
    //         socialfields[key] = normalize(value, { forceHttps: true });
    // }
    profileFields.social = socialfields;

    try {
        // Using upsert option (creates new doc if no match is found):
        let profile = await Profile.findOneAndUpdate(
            { user: req.user.id },
            { $set: profileFields },
            { new: true, upsert: true }
        );
        return res.json(profile);
        // res.status(201).json({
        //     success: true,
        //     data: profile,
        // });

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error::: /POST /api/v1/profiles');
    }
});

// @desc      Reads all Profiles                                   Reads
// @route     GET /api/v1/auth/Profiles
// @access    Public
exports.readProfiles = asyncHandler(async (req, res, next) => {
    try {
        const profiles = await Profile.find().populate('User', ['name', 'avatar']);
        // res.json(profiles);
        res.status(200).json(res.advancedResults);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error::: //GET /api/v1/Profiles');
    }
});

// @desc    READ Get a single Profile by it's user's ID            READ
// @route   GET /api/v1/auth/Profiles/:id
// @access  Public
exports.readProfile = asyncHandler(async (req, res, next) => {
    try {
        const profile = await Profile.findOne({ user: req.params.user_id }).populate('User', ['name', 'avatar']);
        if (!profile) {
            return res.status(400).json({ msg: 'There is no profile for this luser' });
        }

        res.status(200).json({
            success: true,
            data: profile,
        });

    } catch (err) {
        console.error(err.message);
        // console.log(req.params.user_id);
        if (err.kind == 'ObjectId') {
            return res.status(400).json({ msg: 'There is no profile for this luuzer' });
        }
        res.status(500).send('Server Error::: //GET /api/v1/auth/Profiles/:id');
    }
});

// // @desc      Update a profile by their /:Identification number    UPDATE
// // @route     PUT /api/v1/auth/profiles/:id
// // @access    Private/Admin
// exports.updateProfile = asyncHandler(async (req, res, next) => {
//     const profile = await Profile.findByIdAndUpdate(req.params.id, req.body, {
//         new: true,
//         runValidators: true,
//     });

//     res.status(201).json({
//         success: true,
//         data: profile,
//     });
// });

// @desc      Delete a profile, user & posts by the User's Identification number    DELETE
// @route     DELETE /api/v1/auth/profiles/:id
// @access    Private
exports.deleteProfile = asyncHandler(async (req, res, next) => {
    try {
        // Remove user posts
        //         await Post.deleteMany({ user: req.user.id });
        // Remove profile
        await Profile.findOneAndRemove({ user: req.user.id });
        // await Profile.findByIdAndDelete({ user: req.user.id });
        // Remove user
        await User.findOneAndRemove({ _id: req.user.id });
        return res.status(200).json({
            success: true,
            data: {},
            msg: 'User deleted'
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route    PUT api/v1/profile/experience
// @desc     Add profile experience
// @access   Private
exports.updateExperience = asyncHandler(async (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    } = req.body;

    const newExp = {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    };

    try {
        const profile = await Profile.findOne({ user: req.user.id });

        profile.experience.unshift(newExp);

        await profile.save();

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
}
);

// // @route    DELETE api/v1/profile/experience/:exp_id
// // @desc     Delete experience from profile
// // @access   Private
exports.deleteExperience = asyncHandler(async (req, res, next) => {
    try {
        const foundProfile = await Profile.findOne({ user: req.user.id });

        foundProfile.experience = foundProfile.experience.filter(
            exp => exp._id.toString() !== req.params.exp_id
        );

        await foundProfile.save();
        return res.status(200).json(foundProfile);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: 'Server error' });
    }
});

// // @route    PUT api/v1/profile/education
// // @desc     Add profile education
// // @access   Private
exports.updateEducation = asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    } = req.body;

    const newEdu = {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    };

    try {
        const profile = await Profile.findOne({ user: req.user.id });

        profile.education.unshift(newEdu);

        await profile.save();

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
}
);

// // @route    DELETE api/profile/education/:edu_id
// // @desc     Delete education from profile
// // @access   Private
exports.deleteEducation = asyncHandler(async (req, res, next) => {
    try {
        const foundProfile = await Profile.findOne({ user: req.user.id });
        const eduIds = foundProfile.education.map(edu => edu._id.toString());
        const removeIndex = eduIds.indexOf(req.params.edu_id);
        if (removeIndex === -1) {
            return res.status(500).json({ msg: 'Server error' });
        } else {
            foundProfile.education.splice(removeIndex, 1);
            await foundProfile.save();
            return res.status(200).json(foundProfile);
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: 'Server error' });
    }
});

// // @route    GET api/profile/github/:username
// // @desc     Get user repos from Github
// // @access   Public
// router.get('/github/:username', (req, res) => {
//     try {
//         const options = {
//             uri: encodeURI(
//                 `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc`
//             ),
//             method: 'GET',
//             headers: {
//                 'user-agent': 'node.js',
//                 Authorization: `token ${config.get('githubToken')}`
//             }
//         };

//         request(options, (error, response, body) => {
//             if (error) console.error(error);

//             if (response.statusCode !== 200) {
//                 return res.status(404).json({ msg: 'No Github profile found' });
//             }

//             res.json(JSON.parse(body));
//         });
//     } catch (err) {
//         console.error(err.message);
//         res.status(500).send('Server Error');
//     }
// });
