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
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
  }

  h1, h2, h3, h4, h5, h6 {
    margin-bottom: 1rem;
    line-height: 1.2;
  }

  h1 {
    font-size: clamp(2.5rem, 5vw, 4rem);
  }

  h2 {
    font-size: clamp(2rem, 4vw, 3rem);
  }

  p {
    margin-bottom: 1rem;
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
`;

export default GlobalStyles; 