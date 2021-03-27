class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter() {
        const queryObj = { ...this.queryString }; // Making hard copy

        // 1a. Feature: Filtering: Simple
        const excludedFields = [
            'page',
            'sort',
            'limit',
            'fields',
        ];
        excludedFields.forEach(
            (el) => delete queryObj[el]
        );

        // 1b. Feature: Filtering: Advanced
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(
            /\b(gte|gt|lte|lt)\b/g,
            (match) => `$${match}`
        );
        console.log(JSON.parse(queryStr));

        this.query = this.query.find(
            JSON.parse(queryStr)
        );
        // let query = Tour.find(
        //     JSON.parse(queryStr)
        // );
        return this;
    }

    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort
                .split(',')
                .join(' ');
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort(
                '-createdAt'
            );
        }
        return this;
    }

    limitFields() {
        // 3. Feature: Field Limiting
        if (this.queryString.fields) {
            const fields = this.queryString.fields
                .split(',')
                .join(' ');
            this.query = this.query.select(
                fields
            );
        } else {
            this.query = this.query.select(
                '-__v'
            );
        }
        return this;
    }

    paginate() {
        // 4. Feature: Pagination: Pages
        const page =
            Number(this.queryString.page) || 1;
        const limit =
            Number(this.queryString.limit) || 100;
        const skip = (page - 1) * limit;
        // page=2&limit=10 =====>>> 1-10 page1, 11-20 page 2, 21-30 page 3
        this.query = this.query
            .skip(skip)
            .limit(limit);

        return this;
    }
}

module.exports = APIFeatures;
