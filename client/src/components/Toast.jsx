import React, { useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { FaCheck, FaExclamationTriangle, FaInfoCircle, FaTimes } from 'react-icons/fa';

const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`;

const ToastContainer = styled.div`
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: ${props => props.theme.zIndices.toast};
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ToastWrapper = styled.div`
  min-width: 300px;
  max-width: 400px;
  padding: 1rem;
  border-radius: ${props => props.theme.radii.lg};
  background-color: var(--bg-light);
  box-shadow: ${props => props.theme.shadows.lg};
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  animation: ${props => props.isExiting ? slideOut : slideIn} 0.3s ease-in-out;
`;

const IconWrapper = styled.div`
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => {
    switch (props.type) {
      case 'success':
        return 'var(--success)';
      case 'error':
        return 'var(--error)';
      case 'warning':
        return 'var(--warning)';
      default:
        return 'var(--info)';
    }
  }};
`;

const Content = styled.div`
  flex: 1;
`;

const Title = styled.h4`
  margin: 0;
  font-size: ${props => props.theme.fontSizes.md};
  font-weight: ${props => props.theme.fontWeights.medium};
  color: var(--text-light);
`;

const Message = styled.p`
  margin: 0.25rem 0 0;
  font-size: ${props => props.theme.fontSizes.sm};
  color: var(--text-muted);
`;

const CloseButton = styled.button`
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  padding: 0;
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color ${props => props.theme.transitions.duration.normal} ${props => props.theme.transitions.easing['ease-in-out']};

  &:hover {
    color: var(--text-light);
  }
`;

const getIcon = (type) => {
  switch (type) {
    case 'success':
      return <FaCheck />;
    case 'error':
      return <FaExclamationTriangle />;
    case 'warning':
      return <FaExclamationTriangle />;
    default:
      return <FaInfoCircle />;
  }
};

const Toast = ({ toast, onClose }) => {
  const { id, type = 'info', title, message, duration = 5000 } = toast;

  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, id, onClose]);

  return (
    <ToastWrapper isExiting={toast.isExiting}>
      <IconWrapper type={type}>
        {getIcon(type)}
      </IconWrapper>
      <Content>
        <Title>{title}</Title>
        {message && <Message>{message}</Message>}
      </Content>
      <CloseButton onClick={() => onClose(id)}>
        <FaTimes />
      </CloseButton>
    </ToastWrapper>
  );
};

const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = React.useState([]);

  const addToast = (toast) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { ...toast, id }]);
  };

  const removeToast = (id) => {
    setToasts((prev) =>
      prev.map((toast) =>
        toast.id === id ? { ...toast, isExiting: true } : toast
      )
    );

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 300);
  };

  const contextValue = React.useMemo(
    () => ({
      addToast,
      removeToast
    }),
    []
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            toast={toast}
            onClose={removeToast}
          />
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  );
};

const ToastContext = React.createContext(null);

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastProvider; 