import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PetContext } from '../Context/Context';
import { 
  MDBContainer, 
  MDBRow, 
  MDBCol, 
  MDBCard, 
  MDBCardBody, 
  MDBCardTitle, 
  MDBCardText, 
  MDBCardImage,
  MDBBtn,
  MDBInput,
  MDBSpinner,
  MDBIcon,
  MDBBadge
} from 'mdb-react-ui-kit';
import { toast } from 'react-hot-toast';

function Home() {
  const { 
    services, 
    searchServices, 
    getNearbyServices, 
    loading, 
    userLocation,
    membership,
    loginStatus
  } = useContext(PetContext);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [nearbyServices, setNearbyServices] = useState([]);
  const [showNearby, setShowNearby] = useState(false);
  const navigate = useNavigate();

  const categories = [
    { id: 'veterinary', name: 'VETERINARY', icon: 'stethoscope' },
    { id: 'grooming', name: 'GROOMING', icon: 'cut' },
    { id: 'training', name: 'TRAINING', icon: 'graduation-cap' },
    { id: 'boarding', name: 'BOARDING', icon: 'home' },
    { id: 'walking', name: 'WALKING', icon: 'walking' },
    { id: 'daycare', name: 'DAYCARE', icon: 'baby-carriage' },
    { id: 'pet-supplies', name: 'PET SUPPLIES', icon: 'shopping-basket' }
  ];

  useEffect(() => {
    // If services is undefined or empty, use dummy data
    if (!services || services.length === 0) {
      // Import dummy services from dummyData.js
      import('../Pages/dummyData').then(module => {
        const { dummyServices } = module;
        setSearchResults(dummyServices || []);
      });
    } else {
      setSearchResults(services.slice(0, 6));
    }
  }, [services]);

  const handleSearch = async () => {
    if (!loginStatus) {
      toast.error("Please login to search for services");
      navigate('/login');
      return;
    }
    
    if (!membership || membership.status !== 'active') {
      toast.error("Premium membership required to search services");
      navigate('/membership');
      return;
    }
    
    const results = await searchServices(searchQuery, selectedCategory, '');
    setSearchResults(results || []);
    setShowNearby(false);
  };

  const handleNearbySearch = async () => {
    if (!loginStatus) {
      toast.error("Please login to search for nearby services");
      navigate('/login');
      return;
    }
    
    if (!membership || membership.status !== 'active') {
      toast.error("Premium membership required to search nearby services");
      navigate('/membership');
      return;
    }
    
    if (!userLocation) {
      return;
    }
    
    const results = await getNearbyServices(10);
    setNearbyServices(results || []);
    setShowNearby(true);
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setSearchQuery('');
  };

  const handleViewDetails = (id) => {
    navigate(`/service/${id}`);
  };

  return (
    <MDBContainer className="my-5">
      {/* Hero Section */}
      <MDBRow className="mb-5">
        <MDBCol md="12" className="text-center">
          <h1 className="display-4 fw-bold mb-4">Find the Best Pet Services Near You</h1>
          <p className="lead mb-5">
            Connect with top-rated veterinarians, groomers, trainers, and more for your furry friends
          </p>
          
          {/* Search Bar */}
          <MDBRow className="justify-content-center">
            <MDBCol md="6">
              <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
                <div className="input-group mb-3">
                  <MDBInput
                    label='Search for pet services'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <MDBBtn type="submit" color="primary">
                    <MDBIcon fas icon="search" />
                  </MDBBtn>
                </div>
              </form>
            </MDBCol>
          </MDBRow>
          
          {/* Nearby Button */}
          {userLocation && (
            <MDBBtn 
              color="success" 
              className="mb-4"
              onClick={handleNearbySearch}
            >
              <MDBIcon fas icon="map-marker-alt" className="me-2" />
              Find Nearby Services
            </MDBBtn>
          )}

          {/* Premium Membership Banner */}
          {loginStatus && (!membership || membership.status !== 'active') && (
            <div className="mt-4 p-3 bg-warning rounded">
              <h5 className="mb-2">Unlock All Features with Premium Membership</h5>
              <p className="mb-3">Get unlimited searches, advanced filters, and more!</p>
              <MDBBtn color="dark" onClick={() => navigate('/membership')}>
                <MDBIcon far icon="gem" className="me-2" />
                Upgrade Now
              </MDBBtn>
            </div>
          )}
        </MDBCol>
      </MDBRow>

      {/* Categories */}
      <MDBRow className="mb-5">
        <MDBCol md="12">
          <h3 className="mb-4">Browse by Category</h3>
          <div className="d-flex flex-wrap gap-2 justify-content-center">
            {categories.map((category) => (
              <MDBBtn 
                key={category.id}
                color={selectedCategory === category.name ? 'primary' : 'light'}
                onClick={() => handleCategoryClick(category.name)}
              >
                <MDBIcon fas icon={category.icon} className="me-2" />
                {category.name}
              </MDBBtn>
            ))}
          </div>
        </MDBCol>
      </MDBRow>

      {/* Loading Spinner */}
      {loading && (
        <div className="text-center my-5">
          <MDBSpinner role="status">
            <span className="visually-hidden">Loading...</span>
          </MDBSpinner>
        </div>
      )}

      {/* Results */}
      <MDBRow>
        <MDBCol md="12">
          <h3 className="mb-4">
            {showNearby 
              ? 'Nearby Pet Services' 
              : selectedCategory 
                ? `${selectedCategory} Services` 
                : 'Featured Pet Services'}
          </h3>
          
          {!loading && (showNearby ? nearbyServices.length === 0 : searchResults.length === 0) && (
            <div className="text-center my-5">
              <MDBIcon fas icon="search" size="3x" className="text-muted mb-3" />
              <h5>No services found</h5>
              <p>Try adjusting your search criteria or browse by category</p>
            </div>
          )}
          
          <MDBRow>
            {(showNearby ? nearbyServices : searchResults).map((service) => (
              <MDBCol md="4" key={service._id} className="mb-4">
                <MDBCard>
                  <MDBCardImage
                    src={service.images && service.images[0] ? service.images[0] : 'https://via.placeholder.com/300x200?text=Pet+Service'}
                    alt={service.name}
                    position="top"
                  />
                  <MDBCardBody>
                    <MDBCardTitle>{service.name}</MDBCardTitle>
                    <div className="mb-2">
                      <MDBIcon fas icon="star" className="text-warning me-1" />
                      <span>{service.rating ? service.rating.toFixed(1) : '0.0'}</span>
                      <span className="ms-2 text-muted">({service.reviews ? service.reviews.length : 0} reviews)</span>
                    </div>
                    <div className="mb-2">
                      <MDBIcon fas icon="tag" className="me-2" />
                      <span>{service.category}</span>
                    </div>
                    <div className="mb-3">
                      <MDBIcon fas icon="map-marker-alt" className="me-2" />
                      <span>{service.location ? `${service.location.city}, ${service.location.state}` : 'Location not available'}</span>
                    </div>
                    <MDBCardText className="text-truncate">
                      {service.description}
                    </MDBCardText>
                    <MDBBtn 
                      color="primary" 
                      block
                      onClick={() => handleViewDetails(service._id)}
                    >
                      View Details
                    </MDBBtn>
                  </MDBCardBody>
                </MDBCard>
              </MDBCol>
            ))}
          </MDBRow>
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );
}

export default Home;
