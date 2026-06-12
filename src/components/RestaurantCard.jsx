import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import posthog from "posthog-js";
import SaveButton from "./SaveButton";
import { bookedTodayCount, getRestaurantRating } from "../utils/hashUtils";

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
  const rating = getRestaurantRating(r.handle);
  const ratingColor = rating >= 9 ? '#2ecc71' : rating >= 8 ? '#27ae60' : rating >= 7 ? '#f39c12' : '#e74c3c';
  const addressParts = r.address ? r.address.split(',').map(s => s.trim()) : [];
  const shortAddress = addressParts.length >= 2
    ? addressParts.slice(-2).join(', ')
    : r.address;
  const cardRef = useRef(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          posthog.capture("restaurant_card_impression", {
            restaurant_handle: r.handle,
            section,
            $current_url: window.location.href,
          });
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [r.handle, section]);

  const trackClick = () =>
    posthog.capture("restaurant_card_click", {
      restaurant_handle: r.handle,
      section,
      $current_url: window.location.href,
    });

  return (
    <div ref={cardRef} className="product-item">
      <div className="product-img">
        <Link to={`/products/${r.handle}`} onClick={trackClick}>
          <img src={r.thumbnail} alt={r.title} loading="lazy" />
        </Link>
        <SaveButton handle={r.handle} />
        <div className="card-booked-badge">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="12" height="12" fill="currentColor" style={{marginRight: 4, verticalAlign: 'middle'}}><path d="M256.5 37.6C265.8 29.8 279.5 30.1 288.4 38.5C300.7 50.1 311.7 62.9 322.3 75.9C335.8 92.4 352 114.2 367.6 140.1C372.8 133.3 377.6 127.3 381.8 122.2C382.9 120.9 384 119.5 385.1 118.1C393 108.3 402.8 96 415.9 96C429.3 96 438.7 107.9 446.7 118.1C448 119.8 449.3 121.4 450.6 122.9C460.9 135.3 474.6 153.2 488.3 175.3C515.5 219.2 543.9 281.7 543.9 351.9C543.9 475.6 443.6 575.9 319.9 575.9C196.2 575.9 96 475.7 96 352C96 260.9 137.1 182 176.5 127C196.4 99.3 216.2 77.1 231.1 61.9C239.3 53.5 247.6 45.2 256.6 37.7zM321.7 480C347 480 369.4 473 390.5 459C432.6 429.6 443.9 370.8 418.6 324.6C414.1 315.6 402.6 315 396.1 322.6L370.9 351.9C364.3 359.5 352.4 359.3 346.2 351.4C328.9 329.3 297.1 289 280.9 268.4C275.5 261.5 265.7 260.4 259.4 266.5C241.1 284.3 207.9 323.3 207.9 370.8C207.9 439.4 258.5 480 321.6 480z"/></svg>
          Đặt {bookedCount} lần hôm nay
        </div>
      </div>
      <div className="product-item-info">
        <div className="product-title">
          <Link to={`/products/${r.handle}`} onClick={trackClick}>
            {r.title}
          </Link>
        </div>
        <div className="card-rating-row">
          <span className="tag-location">{shortAddress}</span>
          <span className="card-rating-badge" style={{ background: ratingColor }}>
            {rating.toFixed(1)}
          </span>
        </div>
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
