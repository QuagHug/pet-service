import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PetContext } from '../Context/Context';
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBCardImage,
  MDBCardTitle,
  MDBCardText,
  MDBBtn,
  MDBIcon,
  MDBSpinner
} from 'mdb-react-ui-kit';

function Favorites() {
  const { favorites, fetchFavorites, removeFromFavorites, loading } = useContext(PetContext);
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);
  
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "80vh" }}>
        <MDBSpinner role="status">
          <span className="visually-hidden">Loading...</span>
        </MDBSpinner>
      </div>
    );
  }
  
  return (
    <MDBContainer className="my-5">
      <h2 className="text-center mb-5">My Favorite Services</h2>
      
      {favorites.length === 0 ? (
        <div className="text-center my-5">
          <MDBIcon far icon="heart" size="3x" className="text-muted mb-3" />
          <h4>No Favorites Yet</h4>
          <p>Save your favorite pet services to access them quickly later.</p>
          <MDBBtn color="primary" onClick={() => navigate('/')}>
            Browse Services
          </MDBBtn>
        </div>
      ) : (
        <MDBRow>
          {favorites.map((service) => (
            <MDBCol md="4" key={service._id} className="mb-4">
              <MDBCard>
                <MDBCardImage
                  src={service.images[0] || 'https://via.placeholder.com/300x200?text=Pet+Service'}
                  alt={service.name}
                  position="top"
                />
                <MDBCardBody>
                  <MDBCardTitle>{service.name}</MDBCardTitle>
                  <div className="mb-2">
                    <MDBIcon fas icon="star" className="text-warning me-1" />
                    <span>{service.rating.toFixed(1)}</span>
                    <span className="ms-2 text-muted">({service.reviews.length} reviews)</span>
                  </div>
                  <div className="mb-2">
                    <MDBIcon fas icon="tag" className="me-2" />
                    <span>{service.category}</span>
                  </div>
                  <div className="mb-3">
                    <MDBIcon fas icon="map-marker-alt" className="me-2" />
                    <span>{service.location.city}, {service.location.state}</span>
                  </div>
                  <MDBCardText className="text-truncate">
                    {service.description}
                  </MDBCardText>
                  <div className="d-flex justify-content-between">
                    <MDBBtn 
                      color="primary"
                      onClick={() => navigate(`/service/${service._id}`)}
                    >
                      View Details
                    </MDBBtn>
                    <MDBBtn 
                      color="danger" 
                      floating
                      onClick={() => removeFromFavorites(service._id)}
                    >
                      <MDBIcon fas icon="trash" />
                    </MDBBtn>
                  </div>
                </MDBCardBody>
              </MDBCard>
            </MDBCol>
          ))}
        </MDBRow>
      )}
    </MDBContainer>
  );
}

export default Favorites; 