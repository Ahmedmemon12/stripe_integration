import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-08-16",
});

const PLANS = {
  basic: "price_1QyfO0GRFbYN6GoTVPM4v4Bz",
  premium: "price_1QyfOcGRFbYN6GoTS741QEgX",
  pro: "price_1QyfPCGRFbYN6GoTDEbr6Esa",
};

export async function POST(req) {
  try {
    const body = await req.json(); // Read request body
    const { plan, userId, app_url } = body;

    if (!PLANS[plan]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer_email: userId,
      line_items: [{ price: PLANS[plan], quantity: 1 }],
      success_url: `${app_url}/success?plan=${plan}`,
      cancel_url: `${app_url}/cancel`,
    });

    return NextResponse.json(
      {
        sessionId: session.id,
      },
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*", // Allow all origins
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: error.message,
      },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*", // Allow all origins
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    );
  }
}

// Next.js 13+ does not need `bodyParser: true`, it's handled automatically.
