/*
This file is made becasue whenever we return error in anyfiles 
we want to return the same response like 
insdie the asyncHandler 1.] we did error return + json what should be the status code 
ans message 
res.status(err.code|| 500).json({
            success : false,
            message : err.message,
        }) 

now we can use this instead 
 

this is how it gets called 
app.get('/user/:id', asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        // Throw an ApiError if the user is not found
        throw new ApiError(404, 'User not found');
    }
    res.json(user);
}));

instead of this 
app.get('/user/:id', asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        // Manually create and send an error response without ApiError
        return res.status(404).json({
            success: false,
            message: 'User not found',
            errors: [] // You could include more details here if needed
        });
    }

*/


class ApiError extends Error {
    constructor(
        statusCode,
        message= "Something went wrong",
        errors = [],
        stack = ""
    ){
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false;
        this.errors = errors

        if (stack) {
            this.stack = stack
        } else{
            Error.captureStackTrace(this, this.constructor)
        }

    }
}

export {ApiError}