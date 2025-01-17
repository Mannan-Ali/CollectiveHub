//check ApiErrors
//here as it is not dirctly an node part like it is from express so we dont need much here
class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
    //as this is api response anything above this is  comes under error
  }
}

export { ApiResponse };
