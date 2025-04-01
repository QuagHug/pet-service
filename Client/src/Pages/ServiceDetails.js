import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { PetContext } from '../Context/Context';
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBBtn,
  MDBIcon,
  MDBCarousel,
  MDBCarouselItem,
  MDBSpinner,
  MDBTextArea,
  MDBBadge
} from 'mdb-react-ui-kit';
import toast from 'react-hot-toast';
import { dummyServices } from './dummyData';

// Create a simple star rating component
const StarRating = ({ maxRating = 5, value = 0, onChange }) => {
  const [hoverRating, setHoverRating] = useState(0);
  
  return (
    <div className="star-rating">
      {[...Array(maxRating)].map((_, index) => {
        const ratingValue = index + 1;
        return (
          <span
            key={index}
            className="star"
            style={{ cursor: 'pointer', fontSize: '1.5rem', color: ratingValue <= (hoverRating || value) ? '#ffb400' : '#e4e5e9' }}
            onClick={() => onChange(ratingValue)}
            onMouseEnter={() => setHoverRating(ratingValue)}
            onMouseLeave={() => setHoverRating(0)}
          >
            <MDBIcon fas icon="star" />
          </span>
        );
      })}
    </div>
  );
};

function ServiceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    fetchServiceDetails, 
    trackAffiliateClick, 
    addToFavorites, 
    removeFromFavorites, 
    favorites,
    addReview,
    loginStatus
  } = useContext(PetContext);
  
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    const getServiceDetails = async () => {
      try {
        const data = await fetchServiceDetails(id);
        setService(data);
      } catch (error) {
        // If API call fails, check if this is a dummy service
        const dummyService = dummyServices.find(s => s._id === id);
        if (dummyService) {
          setService(dummyService);
          toast.info("Using demo data - this service is not in the database");
        } else {
          toast.error("Service not found");
          navigate('/');
        }
      } finally {
        setLoading(false);
      }
    };
    
    getServiceDetails();
  }, [id, fetchServiceDetails, navigate]);

  useEffect(() => {
    if (favorites.length > 0 && service) {
      setIsFavorite(favorites.some(fav => fav._id === service._id));
    }
  }, [favorites, service]);

  const handleFavoriteToggle = () => {
    if (!loginStatus) {
      toast.error("Please login to save favorites");
      navigate('/login');
      return;
    }

    if (isFavorite) {
      removeFromFavorites(service._id);
    } else {
      addToFavorites(service._id);
    }
  };

  const handleAffiliateClick = () => {
    if (loginStatus) {
      trackAffiliateClick(service._id);
    } else {
      // For demo purposes, just open the link directly
      window.open(service.affiliateLink, '_blank');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (reviewRating === 0) {
      toast.error("Please select a rating");
      return;
    }
    
    try {
      const success = await addReview(service._id, reviewRating, reviewComment);
      if (success) {
        setReviewRating(0);
        setReviewComment('');
        setShowReviewForm(false);
        
        // Refresh service details to show the new review
        const updatedService = await fetchServiceDetails(id);
        setService(updatedService);
      }
    } catch (error) {
      // For dummy services, simulate adding a review
      if (dummyServices.find(s => s._id === id)) {
        toast.success("Review added (demo mode)");
        setReviewRating(0);
        setReviewComment('');
        setShowReviewForm(false);
        
        // Add the review to the current service state
        const updatedService = {
          ...service,
          reviews: [
            ...(service.reviews || []),
            {
              rating: reviewRating,
              comment: reviewComment,
              date: new Date(),
            }
          ]
        };
        setService(updatedService);
      }
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "80vh" }}>
        <MDBSpinner role="status">
          <span className="visually-hidden">Loading...</span>
        </MDBSpinner>
      </div>
    );
  }

  if (!service) {
    return (
      <MDBContainer className="my-5 text-center">
        <MDBIcon far icon="frown" size="4x" className="mb-4 text-muted" />
        <h2>Service Not Found</h2>
        <p>The service you're looking for doesn't exist or has been removed.</p>
        <MDBBtn color="primary" onClick={() => navigate('/')}>
          Back to Home
        </MDBBtn>
      </MDBContainer>
    );
  }

  return (
    <MDBContainer className="my-5">
      <MDBRow>
        <MDBCol md="8">
          <h1 className="mb-4">{service.name}</h1>
          <div className="d-flex align-items-center mb-4">
            <div className="me-4">
              <MDBIcon fas icon="star" className="text-warning me-1" />
              <span className="fw-bold">{service.rating ? service.rating.toFixed(1) : '0.0'}</span>
              <span className="text-muted ms-1">
                ({service.reviews ? service.reviews.length : 0} reviews)
              </span>
            </div>
            <div>
              <MDBBadge color="primary" className="me-2">
                {service.category}
              </MDBBadge>
            </div>
          </div>

          {service.images && service.images.length > 0 ? (
            <MDBCarousel showControls showIndicators dark className="mb-4">
              {service.images.map((image, index) => (
                <MDBCarouselItem
                  key={index}
                  className="w-100 d-block"
                  itemId={index + 1}
                  src={image}
                  alt={`${service.name} - image ${index + 1}`}
                  style={{ height: '400px', objectFit: 'cover' }}
                />
              ))}
            </MDBCarousel>
          ) : (
            <img
              src="https://via.placeholder.com/800x400?text=No+Image+Available"
              className="img-fluid rounded mb-4"
              alt={service.name}
            />
          )}

          <MDBCard className="mb-4">
            <MDBCardBody>
              <h3 className="mb-3">About</h3>
              <p>{service.description}</p>
            </MDBCardBody>
          </MDBCard>

          <MDBCard className="mb-4">
            <MDBCardBody>
              <h3 className="mb-3">Location & Contact</h3>
              <div className="mb-3">
                <MDBIcon fas icon="map-marker-alt" className="me-2" />
                <span>
                  {service.location?.address}, {service.location?.city}, {service.location?.state} {service.location?.zipCode}
                </span>
              </div>
              {service.contactInfo?.phone && (
                <div className="mb-3">
                  <MDBIcon fas icon="phone" className="me-2" />
                  <span>{service.contactInfo.phone}</span>
                </div>
              )}
              {service.contactInfo?.email && (
                <div className="mb-3">
                  <MDBIcon fas icon="envelope" className="me-2" />
                  <span>{service.contactInfo.email}</span>
                </div>
              )}
              {service.contactInfo?.website && (
                <div className="mb-3">
                  <MDBIcon fas icon="globe" className="me-2" />
                  <a href={service.contactInfo.website} target="_blank" rel="noopener noreferrer">
                    {service.contactInfo.website}
                  </a>
                </div>
              )}
            </MDBCardBody>
          </MDBCard>

          {service.operatingHours && (
            <MDBCard className="mb-4">
              <MDBCardBody>
                <h3 className="mb-3">Operating Hours</h3>
                <div className="row">
                  {Object.entries(service.operatingHours).map(([day, hours]) => (
                    <div key={day} className="col-md-6 mb-2">
                      <div className="d-flex justify-content-between">
                        <span className="text-capitalize">{day}:</span>
                        <span>
                          {hours.open && hours.close 
                            ? `${hours.open} - ${hours.close}` 
                            : 'Closed'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </MDBCardBody>
            </MDBCard>
          )}
        </MDBCol>

        <MDBCol md="4">
          <MDBCard className="mb-4 sticky-top" style={{ top: '20px' }}>
            <MDBCardBody>
              <h3 className="mb-4">Book Now</h3>
              <p className="mb-4">
                Visit {service.name} to get the best services for your pet!
              </p>
              <MDBBtn 
                color="success" 
                className="mb-3 w-100"
                onClick={handleAffiliateClick}
              >
                <MDBIcon fas icon="external-link-alt" className="me-2" />
                Visit Website
              </MDBBtn>
              <MDBBtn 
                color={isFavorite ? "danger" : "light"}
                className="w-100"
                onClick={handleFavoriteToggle}
              >
                <MDBIcon 
                  fas 
                  icon="heart" 
                  className={isFavorite ? "me-2" : "me-2 text-danger"} 
                />
                {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
              </MDBBtn>
            </MDBCardBody>
          </MDBCard>
        </MDBCol>
      </MDBRow>

      {/* Review Button */}
      <MDBRow className="mt-4">
        <MDBCol md="12">
          <div className="d-flex justify-content-between align-items-center">
            <h3 className="mb-0">Reviews</h3>
            {loginStatus && !showReviewForm && (
              <MDBBtn 
                color="primary"
                onClick={() => setShowReviewForm(true)}
              >
                <MDBIcon far icon="edit" className="me-2" />
                Write a Review
              </MDBBtn>
            )}
          </div>
          <hr />
        </MDBCol>
      </MDBRow>

      {/* Review Form */}
      {showReviewForm && (
        <MDBRow className="mt-4">
          <MDBCol md="12">
            <MDBCard>
              <MDBCardBody>
                <h4 className="mb-4">Write a Review</h4>
                <form onSubmit={handleReviewSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Rating</label>
                    <StarRating 
                      value={reviewRating}
                      onChange={(value) => setReviewRating(value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Comment</label>
                    <MDBTextArea 
                      rows={4} 
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      required
                    />
                  </div>
                  <MDBBtn type="submit" color="primary">
                    Submit Review
                  </MDBBtn>
                </form>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>
      )}
      
      {/* Reviews Section */}
      <MDBRow className="mt-5">
        <MDBCol md="12">
          {!service.reviews || service.reviews.length === 0 ? (
            <div className="text-center my-5">
              <MDBIcon far icon="comment" size="3x" className="text-muted mb-3" />
              <h5>No Reviews Yet</h5>
              <p>Be the first to review this service!</p>
            </div>
          ) : (
            service.reviews.map((review, index) => (
              <MDBCard key={index} className="mb-3">
                <MDBCardBody>
                  <div className="d-flex justify-content-between mb-2">
                    <div>
                      <MDBIcon fas icon="user-circle" className="me-2" />
                      <span className="fw-bold">User</span>
                    </div>
                    <div>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <MDBIcon 
                          key={i}
                          fas 
                          icon="star" 
                          className={i < review.rating ? "text-warning" : "text-muted"}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="mb-1">{review.comment}</p>
                  <small className="text-muted">
                    {new Date(review.date).toLocaleDateString()}
                  </small>
                </MDBCardBody>
              </MDBCard>
            ))
          )}
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );
}

export default ServiceDetails; 