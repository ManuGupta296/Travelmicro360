import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function CreateItineraryPage() {
  const navigate = useNavigate();

  return (
    <div>
      <h4 className="fw-bold mb-4">Itineraries</h4>
      <div className="t-card p-5 text-center">
        <div style={{fontSize:'3rem'}}>✈️</div>
        <h5 className="fw-bold mt-3">Itineraries Are Auto-Generated</h5>
        <p className="text-muted">When your booking is confirmed, an itinerary is automatically created or updated with your trip details.</p>
        <button className="btn btn-primary btn-sm" onClick={() => navigate('/traveler/itineraries')}>View My Itineraries →</button>
      </div>
    </div>
  );
}
