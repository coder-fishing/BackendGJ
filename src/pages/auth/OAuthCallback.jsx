import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext';
import axios from 'axios';
import '../../styles/auth.scss';

const OAuthCallback = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { updateCurrentUser } = useAuth();
  const [processedToken, setProcessedToken] = useState(false);

  const decodeToken = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  // Kiểm tra xem email đã tồn tại trong hệ thống chưa
  const checkExistingUser = async (email) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/users/check-email?email=${email}`);
      return response.data;
    } catch (error) {
      console.error('Error checking existing user:', error);
      return null;
    }
  };

  // Lấy thông tin user từ server
  const fetchUserData = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  useEffect(() => {
    if (window.location.hash === '#_=_') {
      window.history.replaceState 
        ? window.history.replaceState(null, null, window.location.href.split('#')[0])
        : window.location.hash = '';
    }
  }, []);

  useEffect(() => {
    if (processedToken) return;
    
    console.log("OAuthCallback mounted, location:", location);
    
    const processCallback = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const oauthError = params.get('error');
        
        if (oauthError) {
          console.error("OAuth provider returned an error:", oauthError);
          setError(`Đăng nhập thất bại: ${oauthError}`);
          setLoading(false);
          return;
        }
        
        const token = params.get('token');
        const code = params.get('code');
        
        if (!token && !code) {
          setError('Không nhận được thông tin xác thực từ nhà cung cấp OAuth');
          setLoading(false);
          return;
        }
        
        console.log("Received token:", token);
        console.log("Received code:", code);
        
        setProcessedToken(true);
        
        if (code && !token) {
          try {
            console.log("Exchanging authorization code for token");
            const tokenResponse = await axios.post('http://localhost:8080/oauth2/token', { code });
            const accessToken = tokenResponse.data.access_token;
            
            if (accessToken) {
              const decodedToken = decodeToken(accessToken);
              if (decodedToken) {
                const email = decodedToken.email || decodedToken.sub;
                
                // Kiểm tra xem email đã tồn tại chưa
                const existingUser = await checkExistingUser(email);
                
                if (existingUser) {
                  // Nếu user đã tồn tại, lấy thông tin đầy đủ từ server
                  const userData = await fetchUserData(existingUser.id);
                  if (userData) {
                    localStorage.setItem('token', accessToken);
                    localStorage.setItem('user', JSON.stringify(userData));
                    axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
                    updateCurrentUser(userData);
                    
                    if (userData.role === 'EMPLOYER') {
                      setTimeout(() => navigate('/employer/dashboard'), 500);
                    } else {
                      setTimeout(() => navigate('/user/dashboard'), 500);
                    }
                  } else {
                    setError('Không thể lấy thông tin người dùng');
                  }
                } else {
                  // Nếu là user mới, tạo thông tin mới
                  const newUserData = {
                    id: decodedToken.id || decodedToken.sub,
                    email: email,
                    role: decodedToken.role || 'USER',
                    fullName: decodedToken.name || '',
                    active: true
                  };
                  
                  localStorage.setItem('token', accessToken);
                  localStorage.setItem('user', JSON.stringify(newUserData));
                  axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
                  updateCurrentUser(newUserData);
                  
                  setTimeout(() => navigate('/user/dashboard'), 500);
                }
              } else {
                setError('Không thể đọc thông tin từ token');
              }
            } else {
              setError('Không nhận được token từ server sau khi trao đổi mã ủy quyền');
            }
          } catch (err) {
            console.error("Error exchanging code for token:", err);
            setError(`Lỗi khi trao đổi mã xác thực: ${err.message || 'Lỗi không xác định'}`);
          }
        } else if (token) {
          const decodedToken = decodeToken(token);
          console.log("Decoded token:", decodedToken);
          
          if (!decodedToken) {
            setError('Token không hợp lệ hoặc không đúng định dạng JWT');
            setLoading(false);
            return;
          }
          
          if (!decodedToken.sub || !decodedToken.email) {
            console.error("Token is missing required claims:", decodedToken);
            setError('Token thiếu thông tin xác thực cần thiết');
            setLoading(false);
            return;
          }
          
          try {
            const email = decodedToken.email || decodedToken.sub;
            
            // Kiểm tra xem email đã tồn tại chưa
            const existingUser = await checkExistingUser(email);
            
            if (existingUser) {
              // Nếu user đã tồn tại, lấy thông tin đầy đủ từ server
              const userData = await fetchUserData(existingUser.id);
              if (userData) {
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(userData));
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                updateCurrentUser(userData);
                
                if (userData.role === 'EMPLOYER') {
                  setTimeout(() => navigate('/employer/dashboard'), 500);
                } else {
                  setTimeout(() => navigate('/user/dashboard'), 500);
                }
              } else {
                setError('Không thể lấy thông tin người dùng');
              }
            } else {
              // Nếu là user mới, tạo thông tin mới
              const newUserData = {
                id: decodedToken.id || decodedToken.sub,
                email: email,
                role: decodedToken.role || 'USER',
                fullName: decodedToken.name || '',
                active: true
              };
              
              localStorage.setItem('token', token);
              localStorage.setItem('user', JSON.stringify(newUserData));
              axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
              updateCurrentUser(newUserData);
              
              setTimeout(() => navigate('/user/dashboard'), 500);
            }
          } catch (userErr) {
            console.error("Error handling user data:", userErr);
            setError('Lỗi xử lý thông tin người dùng');
          }
        }
      } catch (err) {
        console.error('OAuth callback error:', err);
        setError(`Đăng nhập thất bại: ${err.message || 'Lỗi không xác định'}`);
      } finally {
        setLoading(false);
      }
    };
    
    processCallback();
  }, [location, navigate, updateCurrentUser, processedToken]);

  if (loading) {
    return (
      <div className="oauth-callback-container">
        <div className="oauth-callback-box">
          <div className="loading-spinner"></div>
          <h2>Đang xử lý đăng nhập...</h2>
          <p>Vui lòng đợi trong giây lát</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="oauth-callback-container">
        <div className="oauth-callback-box error">
          <h2>Đăng nhập thất bại</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/user/login')}>Quay lại đăng nhập</button>
        </div>
      </div>
    );
  }

  return (
    <div className="oauth-callback-container">
      <div className="oauth-callback-box">
        <h2>Đăng nhập thành công</h2>
        <p>Đang chuyển hướng...</p>
      </div>
    </div>
  );
};

export default OAuthCallback; 