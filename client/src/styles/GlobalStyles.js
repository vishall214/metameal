import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  :root {
    --primary: #00B5B0;
    --primary-light: #1BA5A1;
    --secondary: #1B998B;
    --accent: #34E4BE;
    --dark: #004D4A;
    --bg-dark: #0A2928;
    --text-light: #FFFFFF;
    --text-dark: #1A1A1A;
    --text-muted: rgba(255, 255, 255, 0.65);
    --error: #FF6B6B;
    --success: #4CAF50;
    --warning: #FFC107;
    --input-bg: rgba(255, 255, 255, 0.12);
    --input-border: rgba(0, 181, 176, 0.4);
    --border: rgba(255, 255, 255, 0.15);
    --gradient: linear-gradient(135deg, #00B5B0 0%, #004D4A 100%);
    --card-bg: linear-gradient(135deg, rgba(10, 41, 40, 0.85) 0%, rgba(0, 77, 74, 0.7) 100%);
    --card-hover: rgba(0, 181, 176, 0.25);
    
    /* Enhanced Glassmorphic Variables with Better Contrast */
    --glass-primary: linear-gradient(135deg, rgba(0, 181, 176, 0.3) 0%, rgba(0, 181, 176, 0.2) 100%);
    --glass-secondary: linear-gradient(135deg, rgba(0, 181, 176, 0.2) 0%, rgba(0, 181, 176, 0.1) 100%);
    --glass-tertiary: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
    --glass-border: rgba(0, 181, 176, 0.3);
    --glass-border-light: rgba(255, 255, 255, 0.2);
    --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    --glass-shadow-hover: 0 16px 48px rgba(0, 181, 176, 0.25);
    --glass-backdrop: blur(25px);
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    background: var(--bg-dark);
    color: var(--text-light);
    line-height: 1.5;
    min-height: 100vh;
  }

  #root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .container {
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 1.5rem;
  }

  h1, h2, h3, h4, h5, h6 {
    margin-bottom: 1rem;
    line-height: 1.2;
  }

  h1 {
    font-size: clamp(1.7rem, 3vw, 2.5rem);
    font-weight: 700;
    letter-spacing: -1px;
    margin-bottom: 1.2rem;
  }

  h2 {
    font-size: clamp(1.2rem, 2.5vw, 1.7rem);
    font-weight: 600;
    margin-bottom: 1rem;
  }

  h3 {
    font-size: 1.1rem;
    font-weight: 500;
    margin-bottom: 0.7rem;
  }

  p {
    margin-bottom: 0.7rem;
    font-size: 1rem;
    color: var(--text-muted);
  }

  a {
    color: var(--primary);
    text-decoration: none;
    transition: color 0.3s ease;

    &:hover {
      color: var(--primary-light);
    }
  }

  button {
    cursor: pointer;
  }

  img {
    max-width: 100%;
    height: auto;
  }

  input, textarea, select {
    font-family: inherit;
  }

  .card {
    background: var(--card-bg);
    border-radius: 20px;
    border: 1px solid var(--border);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    backdrop-filter: blur(20px);

    &:hover {
      transform: translateY(-3px) scale(1.02);
      box-shadow: var(--glass-shadow-hover);
      border-color: var(--primary);
    }
  }
  
  /* Global Glassmorphic Elements */
  .glass-card {
    background: var(--glass-primary);
    border: 1px solid var(--glass-border);
    border-radius: 20px;
    backdrop-filter: blur(20px);
    box-shadow: var(--glass-shadow);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .glass-card:hover {
    transform: translateY(-3px) scale(1.02);
    box-shadow: var(--glass-shadow-hover);
    border-color: var(--primary);
  }
  
  .glass-button {
    background: var(--glass-secondary);
    border: 1px solid var(--glass-border);
    border-radius: 12px;
    backdrop-filter: blur(20px);
    transition: all 0.3s ease;
  }
  
  .glass-button:hover {
    background: var(--glass-primary);
    border-color: var(--primary);
    transform: translateY(-2px);
    box-shadow: var(--glass-shadow);
  }
`;

export default GlobalStyles;