import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import './PartyStore.css';

const PartyStore = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [merchandise, setMerchandise] = useState([]);
  const [isLoadingMerchandise, setIsLoadingMerchandise] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const [donationAmount, setDonationAmount] = useState(50);
  const [physicalCardDetails, setPhysicalCardDetails] = useState({
    deliveryAddress: '',
    city: '',
    province: '',
    postalCode: '',
    phone: ''
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Fetch merchandise from backend
    fetchMerchandise();
    
    // Scroll to physical card section if coming from membership card
    if (location.state?.scrollToPhysicalCard) {
      const element = document.querySelector('.store-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [isAuthenticated, navigate, location.state]);

  const fetchMerchandise = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/store/merchandise');
      if (response.ok) {
        const data = await response.json();
        setMerchandise(data);
      } else {
        console.error('Failed to fetch merchandise');
        // Fallback to default merchandise if API fails
        setMerchandise([
          {
            id: 1,
            name: 'Anamola T-Shirt',
            price: 250,
            image: '👕',
            description: 'Official party t-shirt with logo'
          },
          {
            id: 2,
            name: 'Anamola Cap',
            price: 150,
            image: '🧢',
            description: 'Party branded baseball cap'
          },
          {
            id: 3,
            name: 'Anamola Mug',
            price: 100,
            image: '☕',
            description: 'Ceramic mug with party branding'
          },
          {
            id: 4,
            name: 'Anamola Stickers',
            price: 50,
            image: '🏷️',
            description: 'Set of 10 party stickers'
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching merchandise:', error);
      // Fallback to default merchandise
      setMerchandise([
        {
          id: 1,
          name: 'Anamola T-Shirt',
          price: 250,
          image: '👕',
          description: 'Official party t-shirt with logo'
        },
        {
          id: 2,
          name: 'Anamola Cap',
          price: 150,
          image: '🧢',
          description: 'Party branded baseball cap'
        },
        {
          id: 3,
          name: 'Anamola Mug',
          price: 100,
          image: '☕',
          description: 'Ceramic mug with party branding'
        },
        {
          id: 4,
          name: 'Anamola Stickers',
          price: 50,
          image: '🏷️',
          description: 'Set of 10 party stickers'
        }
      ]);
    } finally {
      setIsLoadingMerchandise(false);
    }
  };

  const handleAddToCart = (item) => {
    setSelectedItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => 
          i.id === item.id 
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (itemId) => {
    setSelectedItems(prev => prev.filter(i => i.id !== itemId));
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(itemId);
      return;
    }
    setSelectedItems(prev => 
      prev.map(i => i.id === itemId ? { ...i, quantity: newQuantity } : i)
    );
  };

  const getTotalPrice = () => {
    const merchTotal = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    return merchTotal + donationAmount;
  };

  const handlePhysicalCardOrder = async () => {
    if (!physicalCardDetails.deliveryAddress || !physicalCardDetails.city) {
      alert('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/physical-card-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userId: user.id,
          deliveryDetails: physicalCardDetails,
          amount: 200 // Physical card cost
        })
      });

      if (response.ok) {
        const { sessionId } = await response.json();
        // Redirect to Stripe Checkout
        window.location.href = `https://checkout.stripe.com/pay/${sessionId}`;
      } else {
        throw new Error('Failed to create order');
      }
    } catch (error) {
      console.error('Error creating physical card order:', error);
      alert('Failed to create order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (selectedItems.length === 0 && donationAmount === 0) {
      alert('Please select items or enter a donation amount');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/store-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          items: selectedItems,
          donationAmount,
          userId: user.id
        })
      });

      if (response.ok) {
        const { sessionId } = await response.json();
        // Redirect to Stripe Checkout
        window.location.href = `https://checkout.stripe.com/pay/${sessionId}`;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Failed to create checkout session. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return <LoadingSpinner />;
  }

  return (
    <div className="party-store">
      <div className="store-header">
        <h1>Anamola Party Store</h1>
        <p>Support the party and get official merchandise</p>
      </div>

      <div className="store-content">
        {/* Physical Membership Card Order */}
        <div className="store-section">
          <h2>Physical Membership Card</h2>
          <div className="physical-card-form">
            <div className="form-row">
              <input
                type="text"
                placeholder="Delivery Address"
                value={physicalCardDetails.deliveryAddress}
                onChange={(e) => setPhysicalCardDetails(prev => ({
                  ...prev,
                  deliveryAddress: e.target.value
                }))}
              />
              <input
                type="text"
                placeholder="City"
                value={physicalCardDetails.city}
                onChange={(e) => setPhysicalCardDetails(prev => ({
                  ...prev,
                  city: e.target.value
                }))}
              />
            </div>
            <div className="form-row">
              <input
                type="text"
                placeholder="Province"
                value={physicalCardDetails.province}
                onChange={(e) => setPhysicalCardDetails(prev => ({
                  ...prev,
                  province: e.target.value
                }))}
              />
              <input
                type="text"
                placeholder="Postal Code"
                value={physicalCardDetails.postalCode}
                onChange={(e) => setPhysicalCardDetails(prev => ({
                  ...prev,
                  postalCode: e.target.value
                }))}
              />
            </div>
            <input
              type="tel"
              placeholder="Phone Number"
              value={physicalCardDetails.phone}
              onChange={(e) => setPhysicalCardDetails(prev => ({
                ...prev,
                phone: e.target.value
              }))}
            />
            <button 
              className="order-card-btn"
              onClick={handlePhysicalCardOrder}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Order Physical Card (MZN 200)'}
            </button>
          </div>
        </div>

        {/* Party Merchandise */}
        <div className="store-section">
          <h2>Party Merchandise</h2>
          <div className="merchandise-grid">
            {isLoadingMerchandise ? (
              <LoadingSpinner />
            ) : merchandise.length === 0 ? (
              <p>No merchandise items available.</p>
            ) : (
              merchandise.map(item => (
                <div key={item.id} className="merch-item">
                  <div className="item-image">{item.image}</div>
                  <div className="item-details">
                    <h3>{item.name}</h3>
                    <p>{item.description}</p>
                    <div className="item-price">MZN {item.price}</div>
                    <button 
                      className="add-to-cart-btn"
                      onClick={() => handleAddToCart(item)}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Shopping Cart */}
        {selectedItems.length > 0 && (
          <div className="store-section">
            <h2>Shopping Cart</h2>
            <div className="cart-items">
              {selectedItems.map(item => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-info">
                    <span className="item-name">{item.name}</span>
                    <span className="item-price">MZN {item.price}</span>
                  </div>
                  <div className="cart-item-controls">
                    <button 
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      className="quantity-btn"
                    >
                      -
                    </button>
                    <span className="quantity">{item.quantity}</span>
                    <button 
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      className="quantity-btn"
                    >
                      +
                    </button>
                    <button 
                      onClick={() => handleRemoveFromCart(item.id)}
                      className="remove-btn"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Donations */}
        <div className="store-section">
          <h2>Make a Donation</h2>
          <div className="donation-section">
            <p>Support the Anamola party with a donation</p>
            <div className="donation-amounts">
              {[50, 100, 200, 500, 1000].map(amount => (
                <button
                  key={amount}
                  className={`donation-btn ${donationAmount === amount ? 'active' : ''}`}
                  onClick={() => setDonationAmount(amount)}
                >
                  MZN {amount}
                </button>
              ))}
            </div>
            <div className="custom-donation">
              <label>Custom Amount (MZN):</label>
              <input
                type="number"
                min="10"
                value={donationAmount}
                onChange={(e) => setDonationAmount(parseInt(e.target.value) || 0)}
                placeholder="Enter amount"
              />
            </div>
          </div>
        </div>

        {/* Checkout */}
        {(selectedItems.length > 0 || donationAmount > 0) && (
          <div className="checkout-section">
            <div className="total-amount">
              <h3>Total: MZN {getTotalPrice()}</h3>
            </div>
            <button 
              className="checkout-btn"
              onClick={handleCheckout}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Proceed to Checkout'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PartyStore;
