async function healthAPI(req,res){
    try {
        return res.json({
        success: true,
        message: "the Backend is successfully working"
    });
        
    } catch (error) {
        console.log(error);
        return res.json({
        success: false,
        message: "the Backend is not working"
    });
    }
}
module.exports = healthAPI;