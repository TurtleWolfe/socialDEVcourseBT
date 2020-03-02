const path = require('path');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geoCoder');
const Widget = require('../models/Widget');

// @desc    Create a new Widget               C
// @route   POST /api/v1/widgets              C
// @access  Private                           C
exports.createWidget = asyncHandler(async (req, res, next) => {
    // Add user to req,body
    req.body.user = req.user.id;

    // Check for published widget
    const publishedWidget = await Widget.findOne({ user: req.user.id });

    // If the user is not an admin, they can only add one widget
    if (publishedWidget && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `The user with ID ${req.user.id} has already published a widget`,
                400
            )
        );
    }

    const widget = await Widget.create(req.body);
    // console.log(req.body);
    res.status(201)
        .json({
            success: true,
            msg: `Created a new Widget`,
            data: widget,
        });
});

// @desc    Reads all Widgets                 Rs
// @route   GET /api/v1/widgets               Rs
// @access  Public                            Rs
exports.readWidgets = asyncHandler(async (req, res, next) => {
    // let widgetZ = await Widget.find();
    res.status(200).json(res.advancedResults);
    // res.status(200)
    //     .json({
    //         success: true,
    //         count: widgets.length,
    //         pagination,
    //         msg: `GET ${widgets.length} Widgets out of ${widgetZ.length}`,
    //         data: widgets
    //     });
});

// @desc    Read a single Widget              R
// @route   GET /api/v1/widgets/:id           R
// @access  Public                            R
exports.readWidget = asyncHandler(async (req, res, next) => {
    let widgetZ = await Widget.find();
    const widget = await Widget.findById(req.params.id);
    // console.log(req.body);
    if (!widget) {
        return next(
            new ErrorResponse(`GET Widget by ID ${req.params.id} is not part of the ${widgetZ.length}`, 404)
        );
    }
    res.status(200)
        .json({
            success: true,
            msg: `GET Widget by ID ${req.params.id} out of ${widgetZ.length}`,
            data: widget,
        });
});

// @desc    Update a single Widget            U
// @route   PUT /api/v1/widgets/:id           U
// @access  Private                           U
exports.updateWidget = asyncHandler(async (req, res, next) => {
    let widget = await Widget.findById(req.params.id);
    let widgetz = await Widget.find();

    if (!widget) {
        return next(
            new ErrorResponse(`PUT widget by ID ${req.params.id} is an odd request.. out of ${widgetz.length}`, 404)
        );
    }

    // Make sure user is widget owner
    if (widget.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `User ${req.params.id} is not authorized to update this widget`,
                401
            )
        );
    }

    widget = await Widget.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200)
        .json({
            success: true,
            msg: `Updated Widget ${req.params.id}`,
            data: widget
        });
});

// @desc Delete a single Widget               D
// @route DELETE /api/v1/widgets/:id          D
// @access Private                            D
exports.deleteWidget = asyncHandler(async (req, res, next) => {
    const widget = await Widget.findById(req.params.id);
    const widgetz = await Widget.find();

    if (!widget) {
        return next(
            new ErrorResponse(`DELETE Widget by ID ${req.params.id} is an ODDITY not found in this database ${widgetz.length}`, 404)
        );
    }

    // Make sure user is widget owner
    if (widget.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `User ${req.params.id} is not authorized to delete this widget`,
                401
            )
        );
    }

    widget.remove();

    res.status(200)
        .json({
            success: true,
            msg: `Deleted Widget by ID ${req.params.id} out of ${widgetz.length - 1} remaining`,
            data: widget
        });
});

// @desc      Get Widgets within a radius
// @route     GET /api/v1/widgets/radius/:zipcode/:distance
// @access    Private
exports.getWidgetsInRadius = asyncHandler(async (req, res, next) => {
    const { zipcode, distance } = req.params;

    // Get lat/lng from geocoder
    const loc = await geocoder.geocode(zipcode);
    const lat = loc[0].latitude;
    const lng = loc[0].longitude;

    // Calc radius using radians
    // Divide dist by radius of Earth
    // Earth Radius = 3,963 mi / 6,378 km
    const radius = distance / 3963;

    const widgets = await Widget.find({
        location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
    });

    res.status(200).json({
        success: true,
        count: widgets.length,
        msg: `${widgets.length} Widgets within ${req.params.distance} miles of the ${req.params.zipcode} zipcode`,
        data: widgets
    });
});

// @desc      Upload photo for Widget
// @route     PUT /api/v1/widgets/:id/photo
// @access    Private
exports.widgetPhotoUpload = asyncHandler(async (req, res, next) => {
    const widget = await Widget.findById(req.params.id);

    if (!widget) {
        return next(
            new ErrorResponse(`Widget not found with id of ${req.params.id}`, 404)
        );
    }

    // Make sure user is widget owner
    if (widget.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `User ${req.params.id} is not authorized to update this widget`,
                401
            )
        );
    }

    if (!req.files) {
        return next(new ErrorResponse(`Please upload a file`, 400));
    }
    // console.log(req.files.file);
    const file = req.files.file;
    console.log(file);

    // Make sure the image is a photo
    if (!file.mimetype.startsWith('image')) {
        return next(new ErrorResponse(`Please upload an image file`, 400));
    }

    // Check filesize
    if (file.size > process.env.MAX_FILE_UPLOAD) {
        return next(
            new ErrorResponse(
                `Please upload an image less than ${process.env.MAX_FILE_UPLOAD} bytes`,
                400
            )
        );
    }

    // Create custom filename
    file.name = `photo_${widget._id}${path.parse(file.name).ext}`;

    // save image to database and respond
    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
        if (err) {
            console.error(err);
            return next(new ErrorResponse(`Problem with file upload`, 500));
        }

        await Widget.findByIdAndUpdate(req.params.id, { photo: file.name });

        res.status(200).json({
            success: true,
            data: file.name
        });
    });
});