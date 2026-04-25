import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState } from '../types';
import { fetchCurrentUser } from '../services/api';

interface AuthContextType extends AuthState {
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token) {
      // Optimistically set state from local storage if available
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setState({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (e) {
          console.error('Failed to parse user from local storage', e);
        }
      }

      // Fetch latest user data from server
      fetchCurrentUser()
        .then(user => {
          localStorage.setItem('user', JSON.stringify(user));
          setState({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        })
        .catch(err => {
          console.error('Failed to fetch user profile:', err);
          
          // Clear everything if the token is invalid or expired
          const errorMessage = err.message || '';
          if (
            errorMessage.includes('401') || 
            errorMessage.includes('403') || 
            errorMessage.includes('token') || 
            errorMessage.includes('Unauthorized')
          ) {
             localStorage.removeItem('token');
             localStorage.removeItem('user');
             setState({
               user: null,
               isAuthenticated: false,
               isLoading: false,
             });
          } else {
            // Even if it's not a clear auth error, if we have no user data to fall back on, set loading to false
            setState(prev => ({ ...prev, isLoading: false }));
          }
        });
    } else {
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }, []);

  const login = (token: string, user: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setState({
      user,
      isAuthenticated: true,
      isLoading: false,
    });
  };

  const updateUser = (user: User) => {
    localStorage.setItem('user', JSON.stringify(user));
    setState(prev => ({
        ...prev,
        user
    }));
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
