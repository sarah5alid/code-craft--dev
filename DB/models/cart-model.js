import mongoose from "mongoose";



const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    courses: [
        {
            courseId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Course',
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                default: 1
            },
            basePrice: {
                type: Number,
                required: true,
                default: 0
            },
            finalPrice: {  //basePrice * quantity
                type: Number,
                required: true
            },
            title: {
                type: String,
                required: true
            }

        }
    ],
    subTotal: {
        type: Number,
        required: true,
        default: 0
    },
}, {
    timestamps: true
});






export default mongoose.models.Cart || mongoose.model('Cart', cartSchema);