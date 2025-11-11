(() => {
  // Simple app state
  const tabs = {
    onramp: document.getElementById('tab-onramp'),
    offramp: document.getElementById('tab-offramp'),
  };
  const panels = {
    onramp: document.getElementById('panel-onramp'),
    offramp: document.getElementById('panel-offramp'),
  };

  const connectBtn = document.getElementById('connectBtn');

  // Mock wallet connect
  let walletConnected = false;
  connectBtn.addEventListener('click', () => {
    walletConnected = !walletConnected;
    connectBtn.textContent = walletConnected ? 'Wallet Connected' : 'Connect Sui Wallet';
    connectBtn.classList.toggle('primary', walletConnected);
  });

  // Tab switching
  function setTab(name){
    const active = name === 'onramp' ? tabs.onramp : tabs.offramp;
    const inactive = name === 'onramp' ? tabs.offramp : tabs.onramp;
    const activePanel = name === 'onramp' ? panels.onramp : panels.offramp;
    const inactivePanel = name === 'onramp' ? panels.offramp : panels.onramp;

    active.classList.add('active');
    inactive.classList.remove('active');
    active.setAttribute('aria-selected','true');
    inactive.setAttribute('aria-selected','false');

    activePanel.classList.remove('hidden');
    inactivePanel.classList.add('hidden');
  }
  tabs.onramp.addEventListener('click', () => setTab('onramp'));
  tabs.offramp.addEventListener('click', () => setTab('offramp'));

  // Mock rates and fees
  // Base FX: 1 USD = 150 KES (mock).
  const FX = { USD: 1, KES: 1/150 };
  // Crypto prices in USD (mock)
  const PRICES = { SUI: 1.25, USDC: 1.0 };
  // Fees
  const FEES = { network: 0.003, platform: 0.01 }; // percents of amount value

  function fmt(n, digits=4){
    return Number(n).toLocaleString(undefined, { maximumFractionDigits: digits });
  }

  // ONRAMP FLOW
  const fiatAmount = document.getElementById('fiatAmount');
  const fiatSelect = document.getElementById('fiatSelect');
  const cryptoSelect = document.getElementById('cryptoSelect');
  const getOnrampQuoteBtn = document.getElementById('getOnrampQuote');
  const confirmOnrampBtn = document.getElementById('confirmOnramp');

  const onrampQuoteBox = document.getElementById('onrampQuote');
  const onrampRate = document.getElementById('onrampRate');
  const onrampNetFee = document.getElementById('onrampNetFee');
  const onrampPlatformFee = document.getElementById('onrampPlatformFee');
  const onrampReceive = document.getElementById('onrampReceive');

  let lastOnrampQuote = null;

  function getOnrampQuote(){
    const amount = parseFloat(fiatAmount.value);
    if (!amount || amount <= 0) return;
    const fiat = fiatSelect.value; // USD or KES
    const token = cryptoSelect.value; // SUI or USDC

    // Convert fiat to USD value via FX table
    const usdValue = amount * FX[fiat];
    const tokenPriceUsd = PRICES[token];
    const grossTokens = usdValue / tokenPriceUsd;

    const networkFee = usdValue * FEES.network;
    const platformFee = usdValue * FEES.platform;
    const netUsd = usdValue - networkFee - platformFee;
    const tokensOut = netUsd / tokenPriceUsd;

    lastOnrampQuote = { amount, fiat, token, usdValue, tokenPriceUsd, networkFee, platformFee, tokensOut };

    onrampRate.textContent = `1 ${token} = $${fmt(tokenPriceUsd, 3)}`;
    onrampNetFee.textContent = `$${fmt(networkFee, 2)}`;
    onrampPlatformFee.textContent = `$${fmt(platformFee, 2)}`;
    onrampReceive.textContent = `${fmt(tokensOut, 5)} ${token}`;
    onrampQuoteBox.hidden = false;
    confirmOnrampBtn.disabled = false;
  }

  getOnrampQuoteBtn.addEventListener('click', getOnrampQuote);
  document.getElementById('onrampForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!lastOnrampQuote) return;
    // Mock confirmation
    alert(`Purchased ${fmt(lastOnrampQuote.tokensOut, 5)} ${lastOnrampQuote.token} for ${lastOnrampQuote.fiat} ${fmt(lastOnrampQuote.amount,2)} (mock)`);
    confirmOnrampBtn.disabled = true;
  });

  // OFFRAMP FLOW
  const cryptoAmount = document.getElementById('cryptoAmount');
  const fromCryptoSelect = document.getElementById('fromCryptoSelect');
  const toFiatSelect = document.getElementById('toFiatSelect');
  const getOfframpQuoteBtn = document.getElementById('getOfframpQuote');
  const confirmOfframpBtn = document.getElementById('confirmOfframp');
  const offrampQuoteBox = document.getElementById('offrampQuote');
  const offrampRate = document.getElementById('offrampRate');
  const offrampNetFee = document.getElementById('offrampNetFee');
  const offrampPlatformFee = document.getElementById('offrampPlatformFee');
  const offrampReceive = document.getElementById('offrampReceive');

  let lastOfframpQuote = null;

  function getOfframpQuote(){
    const amount = parseFloat(cryptoAmount.value);
    if (!amount || amount <= 0) return;
    const token = fromCryptoSelect.value; // SUI or USDC
    const fiat = toFiatSelect.value; // USD or KES

    const tokenPriceUsd = PRICES[token];
    const usdValue = amount * tokenPriceUsd;

    const networkFee = usdValue * FEES.network;
    const platformFee = usdValue * FEES.platform;
    const netUsd = usdValue - networkFee - platformFee;

    const fiatOut = fiat === 'USD' ? netUsd : netUsd / FX['KES'];

    lastOfframpQuote = { amount, token, fiat, tokenPriceUsd, usdValue, networkFee, platformFee, fiatOut };

    offrampRate.textContent = `1 ${token} = $${fmt(tokenPriceUsd, 3)}`;
    offrampNetFee.textContent = `$${fmt(networkFee, 2)}`;
    offrampPlatformFee.textContent = `$${fmt(platformFee, 2)}`;
    offrampReceive.textContent = `${fiat} ${fmt(fiatOut, 2)}`;
    offrampQuoteBox.hidden = false;
    confirmOfframpBtn.disabled = false;
  }

  getOfframpQuoteBtn.addEventListener('click', getOfframpQuote);
  document.getElementById('offrampForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!lastOfframpQuote) return;
    // Mock confirmation
    alert(`Sold ${fmt(lastOfframpQuote.amount, 4)} ${lastOfframpQuote.token} for ${lastOfframpQuote.fiat} ${fmt(lastOfframpQuote.fiatOut,2)} (mock)`);
    confirmOfframpBtn.disabled = true;
  });

  // Init
  setTab('onramp');
})();
