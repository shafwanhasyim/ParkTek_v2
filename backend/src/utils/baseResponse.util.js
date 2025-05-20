const baseResponse = (res, success, statusCode, message, payload) => {
    return res.status(statusCode).json({
        success,
        message,
        payload,
    });
}

module.exports = {
    baseResponse,
    success: function(message, data = null) {
        return {
            status: "success",
            message: message,
            data: data
        };
    },
    error: function(message, errors = null) {
        return {
            status: "error",
            message: message,
            errors: errors
        };
    }
};

