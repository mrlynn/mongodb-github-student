const Code = require("../models/code");
/**
 * Fetch an available Atas code from the database
 * @param {user} The user object currently in session.
 * @param {next} Callback to return
 * @return {number} Code - the atlas code to be assigned to the user.
 */
exports.fetchCodeForUser = async function(user,next) {
    // get next code and update a user
    await Code.findOne({assigned:false},function(err,code) {
        if (err) {
            err = {
                message: "Problem fetching user codes"
            }
            if (err) throw err;
        }
        code.isAssigned = true;
        code.student = user._id;
        console.log("Should have saved code: " + JSON.stringify(code))
        code.save(function(err) {
            if (err) throw err;
            return next(null, code.code);
        });        
        return next(null,code.code);
    });
}