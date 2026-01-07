
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import LoginScreen from './screens/LoginScreen';
import GradeScreen from './screens/GradeScreen';
import SubjectScreen from './screens/SubjectScreen';
import ChatScreen from './screens/ChatScreen';
import AdminScreen from './screens/AdminScreen';
import ProfileScreen from './screens/ProfileScreen';

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/admin" element={<AdminScreen />} />
            
            {/* Profile */}
            <Route path="/profile" element={<ProfileScreen />} />

            {/* Selection Flow */}
            <Route path="/grades" element={<GradeScreen />} />
            <Route path="/subjects/:gradeId" element={<SubjectScreen />} />
            
            {/* Main Interface - Now Chat is based on Subject */}
            <Route path="/chat/:subjectId" element={<ChatScreen />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </LanguageProvider>
  );
};

export default App;
