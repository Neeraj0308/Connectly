import { useEffect, useState } from "react";
import { Check, Crown, Heart, Sparkles, Zap } from "lucide-react";

import api from "../api/axios";

const Premium = () => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState("monthly");
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const response = await api.get("/payments/subscription");

      setSubscription(response.data);
    } catch (error) {
      console.error("SUBSCRIPTION ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (document.getElementById("razorpay-checkout")) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");

      script.id = "razorpay-checkout";

      script.src = "https://checkout.razorpay.com/v1/checkout.js";

      script.onload = () => resolve(true);

      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    try {
      setPaying(true);

      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded) {
        alert("Unable to load payment gateway.");
        return;
      }

      const response = await api.post("/payments/create-order", {
        plan: selectedPlan,
      });

      const order = response.data.order;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,

        amount: order.amount,

        currency: order.currency,

        name: "Connectly",

        description:
          selectedPlan === "monthly"
            ? "Connectly Premium - Monthly"
            : "Connectly Premium - Yearly",

        order_id: order.id,

        theme: {
          color: "#ff3f76",
        },

        handler: async function (payment) {
          try {
            await api.post("/payments/verify", {
              ...payment,
              plan: selectedPlan,
            });

            alert("Premium activated successfully ❤️");

            await loadSubscription();
          } catch (error) {
            console.error("PAYMENT VERIFY ERROR:", error);

            alert(
              error.response?.data?.message || "Payment verification failed.",
            );
          }
        },

        modal: {
          ondismiss: function () {
            setPaying(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.open();
    } catch (error) {
      console.error("PAYMENT ERROR:", error);

      alert(error.response?.data?.message || "Unable to start payment.");
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="page-center">
        <p>Loading Premium...</p>
      </div>
    );
  }

  if (subscription?.isPremium) {
    return (
      <div className="premium-page">
        <div className="premium-success">
          <div className="premium-success-icon">
            <Crown size={40} />
          </div>

          <span className="eyebrow">CONNECTLY PREMIUM</span>

          <h1>You're Premium ❤️</h1>

          <p>Enjoy your premium experience and connect with more people.</p>

          <div className="premium-date">
            Premium active until{" "}
            <strong>
              {new Date(subscription.subscription.endDate).toLocaleDateString()}
            </strong>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="premium-page">
      <div className="premium-header">
        <div className="premium-crown">
          <Crown size={34} />
        </div>

        <span className="eyebrow">CONNECTLY PREMIUM</span>

        <h1>
          Find meaningful
          <br />
          connections faster.
        </h1>

        <p>
          Unlock premium features designed to help you get more out of
          Connectly.
        </p>
      </div>

      <div className="premium-benefits">
        <div>
          <Zap size={20} />
          <span>Unlimited likes</span>
        </div>

        <div>
          <Heart size={20} />
          <span>See who liked you</span>
        </div>

        <div>
          <Sparkles size={20} />
          <span>Advanced discovery</span>
        </div>
      </div>

      <div className="plans">
        <button
          type="button"
          className={`plan-card ${
            selectedPlan === "monthly" ? "selected" : ""
          }`}
          onClick={() => setSelectedPlan("monthly")}
        >
          <span className="plan-name">Monthly</span>

          <strong>₹299</strong>

          <span>per month</span>

          <div className="plan-check">
            {selectedPlan === "monthly" && <Check size={16} />}
          </div>
        </button>

        <button
          type="button"
          className={`plan-card ${selectedPlan === "yearly" ? "selected" : ""}`}
          onClick={() => setSelectedPlan("yearly")}
        >
          <span className="popular">BEST VALUE</span>

          <span className="plan-name">Yearly</span>

          <strong>₹1,999</strong>

          <span>per year</span>

          <div className="plan-check">
            {selectedPlan === "yearly" && <Check size={16} />}
          </div>
        </button>
      </div>

      <button
        className="premium-pay-button"
        onClick={handlePayment}
        disabled={paying}
      >
        <Crown size={19} />

        {paying ? "Opening payment..." : `Upgrade to Premium`}
      </button>

      <p className="payment-note">Secure payment powered by Razorpay.</p>
    </div>
  );
};

export default Premium;
