import { StartupGate } from './components/StartupGate';
import { OAuthCallback } from './components/OAuthCallback';

function isOAuthCallback(): boolean {
  const params = new URLSearchParams(window.location.search);
  return params.has('code') || params.has('error');
}

function App() {
  if (isOAuthCallback()) return <OAuthCallback />;
  return <StartupGate />;
}

export default App;
