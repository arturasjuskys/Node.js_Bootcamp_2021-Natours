const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');

exports.deleteOne = (Model) => {
    return catchAsync(async (req, res, next) => {
        const doc = await Model.findByIdAndDelete(
            req.params.id
        );

        if (!doc) {
            return next(
                new AppError(
                    'No document found with that ID',
                    404
                )
            );
        }

        res.status(204).json({
            status: 'success',
            data: null,
        });
    });
};
exports.updateOne = (Model) => {
    return catchAsync(async (req, res, next) => {
        const doc = await Model.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!doc) {
            return next(
                new AppError(
                    'No document found with that ID',
                    404
                )
            );
        }

        res.status(200).json({
            status: 'success',
            data: {
                doc,
            },
        });
    });
};
exports.createOne = (Model) => {
    return catchAsync(async (req, res, next) => {
        const doc = await Model.create(req.body);

        res.status(201).json({
            status: 'success',
            data: {
                data: doc,
            },
        });
    });
};
exports.getOne = (Model, popOptions) => {
    // Beause we have populate we need to create query, then check if populate is required if so add it to query and then await the query
    return catchAsync(async (req, res, next) => {
        let query = Model.findById(req.params.id);
        if (popOptions)
            query = query.populate(popOptions);
        const doc = await query;

        if (!doc) {
            return next(
                new AppError(
                    'No document found with that ID',
                    404
                )
            );
        }

        res.status(200).json({
            status: 'success',
            data: {
                data: doc,
            },
        });
    });
};
exports.getAll = (Model) => {
    return catchAsync(async (req, res, next) => {
        // To allow for nested GET reviews on tour (hack)
        let filter = {};
        if (req.params.tourId)
            filter = { tour: req.params.tourId };
        // Executing a query
        const features = new APIFeatures(
            Model.find(filter),
            req.query
        )
            .filter()
            .sort()
            .limitFields()
            .paginate();
        const doc = await features.query;
        // const doc = await features.query.explain(); // .explain() - info on query itself and its stats

        // Send a response
        res.status(200).json({
            status: 'success',
            results: doc.length,
            data: {
                data: doc,
            },
        });
    });
};
