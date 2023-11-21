const paymentModel = require("../models/payment-model");

class PaymentService {
  async createPayment(data){
    return await paymentModel.create(data);
  }
}
module.exports = new PaymentService();
