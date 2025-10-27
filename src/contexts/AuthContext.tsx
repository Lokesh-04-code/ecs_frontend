import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  email: string;
  password: string;
  createdAt: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const USERS_STORAGE_KEY = 'iot-users';
const CURRENT_USER_KEY = 'iot-current-user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem(CURRENT_USER_KEY);
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const getUsers = (): User[] => {
    const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
  };

  const saveUsers = (users: User[]) => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  };

  const signup = async (email: string, password: string): Promise<boolean> => {
    const users = getUsers();
    
    // Check if user already exists
    if (users.some(u => u.email === email)) {
      return false;
    }

    const newUser: User = {
      email,
      password,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);
    
    // Auto login after signup
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
    
    return true;
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, currentUser, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};