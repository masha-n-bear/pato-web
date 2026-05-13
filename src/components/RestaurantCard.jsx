import { Link } from "react-router-dom";
import posthog from "posthog-js";
import SaveButton from "./SaveButton";
import { bookedTodayCount } from "../utils/hashUtils";

const PRICE_LABELS = {
  1: "< 200.000 VND/người",
  2: "200.000 - 300.000 VND/người",
  3: "300.000 - 400.000 VND/người",
  4: "400.000 - 500.000 VND/người",
  5: "> 500.000 VND/người",
};

export default function RestaurantCard({ restaurant, section = "unknown" }) {
  const r = restaurant;
  const priceLabel = PRICE_LABELS[r.price_range] || "";
  const bookedCount = bookedTodayCount(r.handle);

  const trackClick = () =>
    posthog.capture("restaurant_card_click", {
      restaurant_handle: r.handle,
      section,
      $current_url: window.location.href,
    });

  return (
    <div className="product-item">
      <div className="product-img">
        <Link to={`/products/${r.handle}`} onClick={trackClick}>
          <img src={r.thumbnail} alt={r.title} loading="lazy" />
        </Link>
        <SaveButton handle={r.handle} />
        <div className="card-booked-badge">🔥 Đặt {bookedCount} lần hôm nay</div>
      </div>
      <div className="product-item-info">
        <div className="product-title">
          <Link to={`/products/${r.handle}`} onClick={trackClick}>
            {r.title}
          </Link>
        </div>
        <div className="tag-location">{r.address}</div>
        <div className="product-detail-type">
          <div className="product-type">
            {r.cuisine_all?.slice(0, 2).map((c) => (
              <span key={c}>
                <Link to={`/collections?cuisine=${encodeURIComponent(c)}`}>
                  {c}
                </Link>
              </span>
            ))}
          </div>
          <div className="product-type-ver2">
            {r.service_type && (
              <span>
                <Link to={`/collections?service=${encodeURIComponent(r.service_type)}`}>
                  {r.service_type}
                </Link>
              </span>
            )}
          </div>
        </div>
        <div className="product-price">
          <div className="product-price-content">
            <strong>{priceLabel}</strong>
          </div>
        </div>
        <div className="textUudai">
          {r.discount && r.discount_details ? r.discount_details : ""}
        </div>
        <div className="product-status-row">
          <Link
            className="btn-booking"
            to={`/products/${r.handle}`}
            target="_blank"
            onClick={() =>
              posthog.capture("card_cta_click", { restaurant_handle: r.handle })
            }
          >
            Đặt ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
