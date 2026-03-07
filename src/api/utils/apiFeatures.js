class APIFeatures {
    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr;
    }

    search() {
        const keyword = this.queryStr.keyword ? {
            $or: [
                {
                    name: {
                        $regex: this.queryStr.keyword, //search for substrings (e.g. 'pod' in 'Apple Airpods)
                        $options: 'i', //case insensitive
                    }
                },
                {
                    description: {
                        $regex: this.queryStr.keyword,
                        $options: 'i',
                    }
                }
            ]    
        } : {};

        this.query = this.query.find({ ...keyword }); //apply filter to original query
        return this; //fluent interface pattern
    }

    filter() {
        const queryCopy = { ...this.queryStr };

        //remove fields that mongoDB Product schema doesn't have
        const removeFields = ['keyword', 'name', 'description', 'sort', 'limit', 'page'];
        removeFields.forEach(field => delete queryCopy[field]);

        // 1. Convert the object to a string
        let queryStr = JSON.stringify(queryCopy);
        console.log(queryCopy);

        // 2. Use Regex to add '$' before gte, gt, lte, lt
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`);

        // 3. Parse it back and pass it to the find method
        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }

    sort() {
        if (this.queryStr.sort) {
            const sortBy = this.queryStr.sort

            // This will find EVERY comma and replace it with a space
            const formattedSortBy = sortBy.replace('/,/g', ' ');
            
            this.query = this.query.sortBy(formattedSortBy);
        } else {
            //Default sort by newest first
            this.query = this.query.sort('-createdAt');
        }
        return this;
    }

    pagination(resPerPage) {
        const currentPage = Number(this.queryStr.page) || 1;
        const skip = resPerPage * (currentPage - 1);

        this.query = this.query.limit(resPerPage).skip(skip);
        return this;
    }
}

module.exports = APIFeatures;