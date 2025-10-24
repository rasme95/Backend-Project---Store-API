//AI helped me create unique and good responsehandlers that would be solid for this project
function errorResponse(res, statusMessage) {
    return res.status(500).json({
        status: "error",
        statuscode: 500,
        data: {
            result: statusMessage,
        },
    });
}

function successResponse(res, statusMessage, data) {
    return res.status(200).json({
        status: "success",
        statuscode: 200,
        data: {
            result: statusMessage,
            ...data,
        },
    });
}

function failResponse(res, statusMessage, data) {
    return res.status(404).json({
        status: "fail",
        statuscode: 404,
        data: {
            result: statusMessage,
            data: data,
        },
    });
}

module.exports = {successResponse, errorResponse, failResponse};
