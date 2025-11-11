(() => {
  // Wallet mock
  const connectBtn = document.getElementById('connectBtn');
  let walletConnected = false;
  connectBtn?.addEventListener('click', () => {
    walletConnected = !walletConnected;
    connectBtn.textContent = walletConnected ? 'Wallet Connected' : 'Connect Sui Wallet';
    connectBtn.classList.toggle('primary', walletConnected);
  });

  // Tabs for on/off ramp
  const tabs = {
    onramp: document.getElementById('tab-onramp'),
    offramp: document.getElementById('tab-offramp'),
  };
  const panels = {
    onramp: document.getElementById('panel-onramp'),
    offramp: document.getElementById('panel-offramp'),
  };
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
  tabs.onramp?.addEventListener('click', () => setTab('onramp'));
  tabs.offramp?.addEventListener('click', () => setTab('offramp'));

  // Mock rates and fees
  const FX = { USD: 1, KES: 1/150 };
  const PRICES = { SUI: 1.25, USDC: 1.0 };
  const FEES = { network: 0.003, platform: 0.01 };
  const fmt = (n, d=4) => Number(n).toLocaleString(undefined, { maximumFractionDigits: d });

  // ONRAMP
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
    const fiat = fiatSelect.value;
    const token = cryptoSelect.value;
    const usdValue = amount * FX[fiat];
    const tokenPriceUsd = PRICES[token];
    const networkFee = usdValue * FEES.network;
    const platformFee = usdValue * FEES.platform;
    const netUsd = usdValue - networkFee - platformFee;
    const tokensOut = netUsd / tokenPriceUsd;
    lastOnrampQuote = { amount, fiat, token, tokenPriceUsd, networkFee, platformFee, tokensOut };
    onrampRate.textContent = `1 ${token} = $${fmt(tokenPriceUsd,3)}`;
    onrampNetFee.textContent = `$${fmt(networkFee,2)}`;
    onrampPlatformFee.textContent = `$${fmt(platformFee,2)}`;
    onrampReceive.textContent = `${fmt(tokensOut,5)} ${token}`;
    onrampQuoteBox.hidden = false;
    confirmOnrampBtn.disabled = false;
  }
  getOnrampQuoteBtn?.addEventListener('click', getOnrampQuote);
  document.getElementById('onrampForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!lastOnrampQuote) return;
    alert(`Purchased ${fmt(lastOnrampQuote.tokensOut,5)} ${lastOnrampQuote.token} (mock)`);
    confirmOnrampBtn.disabled = true;
  });

  // OFFRAMP
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
    const token = fromCryptoSelect.value;
    const fiat = toFiatSelect.value;
    const tokenPriceUsd = PRICES[token];
    const usdValue = amount * tokenPriceUsd;
    const networkFee = usdValue * FEES.network;
    const platformFee = usdValue * FEES.platform;
    const netUsd = usdValue - networkFee - platformFee;
    const fiatOut = fiat === 'USD' ? netUsd : netUsd / FX['KES'];
    lastOfframpQuote = { amount, token, fiat, tokenPriceUsd, networkFee, platformFee, fiatOut };
    offrampRate.textContent = `1 ${token} = $${fmt(tokenPriceUsd,3)}`;
    offrampNetFee.textContent = `$${fmt(networkFee,2)}`;
    offrampPlatformFee.textContent = `$${fmt(platformFee,2)}`;
    offrampReceive.textContent = `${fiat} ${fmt(fiatOut,2)}`;
    offrampQuoteBox.hidden = false;
    confirmOfframpBtn.disabled = false;
  }
  getOfframpQuoteBtn?.addEventListener('click', getOfframpQuote);
  document.getElementById('offrampForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!lastOfframpQuote) return;
    alert(`Sold ${fmt(lastOfframpQuote.amount,4)} ${lastOfframpQuote.token} for ${lastOfframpQuote.fiat} ${fmt(lastOfframpQuote.fiatOut,2)} (mock)`);
    confirmOfframpBtn.disabled = true;
  });

  // NFT marketplace mock
  const GRID = document.getElementById('grid');
  const searchInput = document.getElementById('searchInput');
  const chainSelect = document.getElementById('chainSelect');
  const sortSelect = document.getElementById('sortSelect');

  const MOCK_NFTS = Array.from({ length: 20 }).map((_, i) => ({
    id: i + 1,
    title: `Sui Star #${i+1}`,
    collection: i % 2 ? 'Blue Nebula' : 'Sky Shards',
    chain: 'sui',
    price: +(Math.random()*10 + 0.1).toFixed(2), // in SUI
    image: `https://picsum.photos/seed/sui-${i+1}/600/600`,
  }));

  function renderGrid(items){
    GRID.innerHTML = '';
    items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'card card-nft';
      card.innerHTML = `
        <img class="thumb" src="${item.image}" alt="${item.title}"/>
        <div class="body">
          <div>
            <div class="title">${item.title}</div>
            <div class="muted">${item.collection}</div>
          </div>
          <div class="price">${item.price} SUI</div>
        </div>
      `;
      card.addEventListener('click', () => openModal(item));
      GRID.appendChild(card);
    });
  }

  function applyFilters(){
    let q = (searchInput.value || '').toLowerCase();
    let chain = chainSelect.value;
    let sort = sortSelect.value;
    let items = MOCK_NFTS.filter(n =>
      (!q || n.title.toLowerCase().includes(q) || n.collection.toLowerCase().includes(q)) &&
      (chain === 'all' || n.chain === chain)
    );
    if (sort === 'trending') items.sort((a,b)=>a.id-b.id);
    if (sort === 'recent') items.sort((a,b)=>b.id-a.id);
    if (sort === 'price_low') items.sort((a,b)=>a.price-b.price);
    if (sort === 'price_high') items.sort((a,b)=>b.price-a.price);
    renderGrid(items);
  }

  searchInput?.addEventListener('input', applyFilters);
  chainSelect?.addEventListener('change', applyFilters);
  sortSelect?.addEventListener('change', applyFilters);

  // Modal
  const modal = document.getElementById('itemModal');
  const closeModalBtn = document.getElementById('closeModal');
  const modalImage = document.getElementById('modalImage');
  const modalTitle = document.getElementById('modalTitle');
  const modalCollection = document.getElementById('modalCollection');
  const modalPrice = document.getElementById('modalPrice');
  const buyBtn = document.getElementById('buyBtn');
  const listBtn = document.getElementById('listBtn');

  function openModal(item){
    modalImage.src = item.image;
    modalTitle.textContent = item.title;
    modalCollection.textContent = item.collection;
    modalPrice.textContent = `${item.price} SUI`;
    buyBtn.onclick = () => alert(`Buying ${item.title} for ${item.price} SUI (mock)`);
    listBtn.onclick = () => alert(`Listing ${item.title} (mock)`);
    if (typeof modal.showModal === 'function') modal.showModal();
  }
  closeModalBtn?.addEventListener('click', ()=> modal.close());

  // Init
  setTab('onramp');
  applyFilters();
})();
