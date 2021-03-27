const mongoose = require('mongoose');
const slugify = require('slugify');
// const validator = require('validator');
// const User = require('./userModel');

const tourSchema = new mongoose.Schema(
    {
        // name: String,
        // rating: Number,
        // price: Number
        name: {
            type: String,
            required: [true, 'A tour must have a name'],
            unique: true,
            trim: true,
            maxlength: [40, 'A tour name must not exceed 40 characters'],
            minlength: [10, 'A tour name must exceed 10 characters'],
            // validate: [validator.isAlpha, 'Tour name must contain only characters'], // external validator
        },
        slug: String,
        duration: {
            type: Number,
            required: [true, 'A tour must have a duration'],
        },
        maxGroupSize: {
            type: Number,
            required: [true, 'A tour must have a group size'],
        },
        difficulty: {
            type: String,
            required: [true, 'A tour must have a difficulty'],
            enum: {
                values: ['easy', 'medium', 'difficult'],
                message: 'Difficulty is either: easy, medium, difficult',
            },
        },
        ratingsAverage: {
            type: Number,
            default: 4.5,
            min: [1, 'Rating must be atlest 1'],
            max: [5, 'Rating must be below 5'],
            set: (val) => {
                return Math.round(val * 10) / 10; // to get 4.7 => round returns whole numbers, trick is to val*10 => 46.66 => 47/10 => 4.7
            },
        },
        ratingsQuantity: {
            type: Number,
            default: 0,
        },
        price: {
            type: Number,
            required: [true, 'A tour must have a price'],
        },
        priceDiscount: {
            // <<<<<<<<<<<<<=========================================================== Custom Validator
            type: Number,
            validate: {
                validator: function (val) {
                    // This will not work on update, only points to current doc on NEW document creation
                    return val < this.price; // 250 < 200
                },
                message:
                    'Discount price ({VALUE}) should be below regular price',
            },
        },
        summary: {
            type: String,
            trim: true,
            required: [true, 'A tour must have a description'],
        },
        description: {
            type: String,
            trim: true,
        },
        imageCover: {
            type: String,
            required: [true, 'A tour must have a cover image'],
        },
        images: [String],
        createdAt: {
            type: Date,
            default: Date.now(),
            select: false,
        },
        startDates: [Date],
        secretTour: {
            type: Boolean,
            default: false,
        },
        startLocation: {
            // GeoJSON
            type: {
                type: String,
                default: 'Point',
                enu: ['Point'],
            },
            coordinates: [Number],
            address: String,
            description: String,
        },
        locations: [
            // This is embedded document, to create embedded document use array and in it define your document
            {
                type: {
                    type: String,
                    default: 'Point',
                    enum: ['Point'],
                },
                coordinates: [Number],
                address: String,
                description: String,
                day: Number,
            },
        ],
        guides: [
            {
                type: mongoose.Schema.ObjectId,
                ref: 'User',
            },
        ],
    },
    {
        // <<<<<<<<<<================================================= options object for virtual properties
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// tourSchema.index({ price: 1 });
tourSchema.index({
    price: 1,
    ratingsAverage: -1,
});
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

// VIRTUAL PROPERTY
// this data will not be saved into database, and will be calculated after getting it from database. It needs to be pased into mongoose.Schema({},{options}) as an options object
tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7;
});
tourSchema.virtual('reviews', {
    ref: 'Review',
    // foreighField needs to point to [reviewModel.js] where id is stored, in this case in [tour] field
    foreignField: 'tour',
    // localField needs to point to field where [tourModel.js] holds its id
    localField: '_id',
});

// DOCUMENT MIDDLWWARE
// runs before .save() & .create(), but not .insertMany(), and needs to be defined in schema
tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, {
        lower: true,
    });
    next();
});
/*


// Embedding users into tours

// Gets all users => array => tours object => guides dataset
tourSchema.pre('save', async function (next) {
    const guidesPromises = this.guides.map(
        async (id) => {
            return await User.findById(id);
        }
    );
    this.guides = await Promise.all(
        guidesPromises
    );

    next();
});


*/
// tourSchema.pre('save', function (next) {
//     console.log('Will save document...');
//     next();
// });
// tourSchema.post('save', function (doc, next) {
//     console.log(doc);
//     next();
// });

// QUERY MIDDLEWARE

// This one hides Secret Tours from normal public search
// tourSchema.pre('find', function (next) {
tourSchema.pre(/^find/, function (next) {
    this.find({ secretTour: { $ne: true } });
    this.start = Date.now();
    next();
});
// This query middleware will auto fill guides field
tourSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'guides',
        select: '-__v -passwordChangedAt',
    });

    next();
});

tourSchema.post(/^find/, function (docs, next) {
    console.log(`Query took ${Date.now() - this.start} milliseconds!`);
    // console.log(docs);
    next();
});

// AGGREGATION MIDDLEWARE
// This one will hide Secret Tours from Tour Stats
// This middleware comes before $geoNear and throws an error
// tourSchema.pre('aggregate', function (next) {
//     this.pipeline().unshift({
//         $match: { secretTour: { $ne: true } },
//     });
//     console.log(this);
//     next();
// });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
