import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  :root {
    --primary: #00B5B0;
    --primary-light: #20DAD5;
    --secondary: #1B998B;
    --accent: #34E4BE;
    --dark: #004D4A;
    --bg-dark: #0A2928;
    --text-light: #FFFFFF;
    --text-dark: #1A1A1A;
    --text-muted: rgba(255, 255, 255, 0.6);
    --error: #FF4D4D;
    --success: #4CAF50;
    --warning: #FFC107;
    --input-bg: rgba(255, 255, 255, 0.07);
    --input-border: rgba(0, 181, 176, 0.3);
    --border: rgba(255, 255, 255, 0.1);
    --gradient: linear-gradient(135deg, #00B5B0 0%, #004D4A 100%);
    --card-bg: rgba(10, 41, 40, 0.8);
    --card-hover: rgba(0, 181, 176, 0.2);
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
    border-radius: 14px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.12);
    border: none;
    transition: box-shadow 0.3s, transform 0.3s;

    &:hover {
      box-shadow: 0 8px 32px rgba(0,0,0,0.18);
      transform: translateY(-2px) scale(1.01);
    }
  }
`;

export default GlobalStyles;