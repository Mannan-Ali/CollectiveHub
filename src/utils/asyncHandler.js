/*
The technique of enclosing a function inside another function, 
as seen in your asynHandler, 
is often referred to as function wrapping or higher-order functions.
//There are 2 methods to do this one is by promise returing and 
//2.other is try and catch
What is happening is this function will be used for routing
that is when we do this 
app.get('/users/:id', asynHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) throw new Error('User not found');
    res.json(user);
}));
instead of writting again and again catch(error) code we send it here to handle it 
if no erros occurs it gets executed here
*/

//2.1] way here using promise 
const asynHandler = (reqhandler) => {
    (req,res,next)=>{
        Promise.resolve(reqhandler(req,res,next))
        .catch((err)=>{
           next(err) 
        })
    }

}
export default asynHandler

/*2.2]
const asynHandler = (reqhandler) => {
    return (req, res, next) => {
        return Promise.resolve(reqhandler(req, res, next)).catch(next);
    };
};


1]
const asyncHandler = (func)=>{()=>{}} what we are doing here is 
passing the func inside another func 

the req res and next comes from func parameter like the one calling it will 
give those parameter 
const asyncHandler =(func)=> async (req,res,next)=>{
    try {
        await func(req,res,next);
    } catch (error) {
        res.status(err.code|| 500).json({
            success : false,
            message : err.message,
        })
    }
}
*/
