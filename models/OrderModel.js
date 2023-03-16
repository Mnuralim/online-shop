import mongoose from "mongoose"; // Erase if already required

// Declare the Schema of the Mongo model
const OrderSchema = new mongoose.Schema(
  {
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        count: Number,
        color: String,
      },
    ],
    paymentIntent: {},
    orderStatus: {
      type: String,
      default: "Not Processed",
      enum: ["Not Processed", "Cash On Delivery", "Processing", "Dispatched", "Cancelled", "Delivered"],
    },
    orderby: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

//Export the model
const Order = mongoose.model("Order", OrderSchema);
export default Order;
