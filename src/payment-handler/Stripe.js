import Stripe from "stripe";
import couponModel from "../../DB/models/coupon-model.js";

export const createCheckOutSession = async ({
  customer_email,
  metadata,
  discounts,
  line_items,
}) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const paymentData = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email,
    metadata,
    success_url: process.env.success_URL,
    cancel_url: process.env.cancel_URL,
    discounts,
    line_items,
  });
  return paymentData;
};


//===========stripe coupon =============

export const createStripeCoupon = async ({ couponId }) => {
  const findCoupon = await couponModel.findById(couponId);

  if (!findCoupon) {
    return { status: false, message: "coupon not found" };
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const stripeCoupon = await stripe.coupons.create({
    name: findCoupon.couponCode,
    percent_off: findCoupon.couponAmount,
  });

  return stripeCoupon;
};
//=============================
export const createStripePaymentMethod = async ({ token }) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const paymentMethod = await stripe.paymentMethods.create({
    type: "card",
    card: {
      token,
    },
  });
  return paymentMethod;
};

export const createPaymentIntent = async ({ amount, currency }) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const paymentMethod = await createStripePaymentMethod({ token: "tok_visa" });
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100,
    currency,
    automatic_payment_methods: {
      enabled: true,
    },
    payment_method: paymentMethod.id,
  });
  return paymentIntent;
};

export const confirmPaymentIntent=async({payment})
