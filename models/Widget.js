const mongoose = require('mongoose');
const UserSchema = require('../models/User.js');
// const slugify = require('slugify');
// const geocoder = require('../utils/geoCoder');

const WidgetSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        unique: true,
        trim: true,
        maxlength: [50, 'Name can not be more than 50 characters']
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
        maxlength: [500, 'Description can not be more than 500 characters']
    },
    who: {
        type: String,
        trim: true,
        maxlength: [15, 'Who can not be more than 15 characters']
    },
    what: {
        type: String,
        trim: true,
        maxlength: [15, 'What can not be more than 15 characters']
    },
    when: {
        type: Date
    },
    why: {
        type: String,
        trim: true,
        maxlength: [50, 'Why can not be more than 50 characters']
    },
    where: {
        type: String,
        trim: true,
        maxlength: [50, 'Where can not be more than 50 characters']
    },
    address: {
        type: String,
        // required: [true, 'Please add an address']
    },
    location: {
        // GeoJSON Point
        type: {
            type: String,
            enum: ['Point']
        },
        coordinates: {
            type: [Number],
            index: '2dsphere'
        },
        formattedAddress: String,
        street: String,
        city: String,
        state: String,
        zipcode: String,
        country: String
    },
    wishes: {
        // Array of strings
        type: String,
        required: [true, 'Please add a minimum skill'],
        enum: [
            'Weight',
            'Worth',
            'Walk',
            'Whole',
            'Whale',
            'Wallrus'
        ]
    },

    createdAt: {
        type: Date,
        default: Date.now
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
}
);

// // Cascade delete Widgets when a User is deleted
// UserSchema.pre('remove', async function (next) {
//     console.log(`Widgets being removed per this user ${this._id}`);
//     await this.model('Widget').deleteMany({ user: this._id });
//     next();
// });

module.exports = mongoose.model('Widget', WidgetSchema);