/**
 * SplitRide - Mobile Carpool Fuel Calculator
 * Supports Metric & Imperial, Direct Fuel & Distance/Economy modes,
 * PWA installation, Offline caching, and Native Sharing.
 */

(function () {
  'use strict';

  // --- STATE ---
  const state = {
    mode: 'distance', // 'distance' | 'direct'
    peopleCount: 3,
    includeDriver: true,
    isRoundTrip: false,
    unitSystem: 'metric', // 'metric' | 'imperial'
    currency: '€',
    roundingRule: 0, // 0: exact, 0.5: nearest 0.5, 1: ceil 1, 5: ceil 5
    darkTheme: true,
    
    // Inputs
    distance: 0,
    consumption: 6.5,
    directFuel: 0,
    fuelPrice: 1.65,
    tolls: 0,
    parking: 0,
    carWear: 2,
    wearMode: 'percent', // 'percent' | 'fixed'

    // Storage
    cars: [],
    history: []
  };

  // --- DOM ELEMENTS ---
  const elements = {
    // Mode switcher
    tabDistance: document.getElementById('tabDistance'),
    tabDirectFuel: document.getElementById('tabDirectFuel'),
    modeDistanceSection: document.getElementById('modeDistanceSection'),
    modeDirectSection: document.getElementById('modeDirectSection'),

    // People stepper
    peopleCountInput: document.getElementById('peopleCountInput'),
    peopleMinusBtn: document.getElementById('peopleMinusBtn'),
    peoplePlusBtn: document.getElementById('peoplePlusBtn'),
    peopleCountLabel: document.getElementById('peopleCountLabel'),
    includeDriverToggle: document.getElementById('includeDriverToggle'),
    driverSplitDesc: document.getElementById('driverSplitDesc'),
    splitBadge: document.getElementById('splitBadge'),

    // Inputs
    distanceInput: document.getElementById('distanceInput'),
    distanceLabel: document.getElementById('distanceLabel'),
    distanceUnitSuffix: document.getElementById('distanceUnitSuffix'),
    roundTripBtn: document.getElementById('roundTripBtn'),
    consumptionInput: document.getElementById('consumptionInput'),
    consumptionLabel: document.getElementById('consumptionLabel'),
    consumptionUnitSuffix: document.getElementById('consumptionUnitSuffix'),
    carShortcutsContainer: document.getElementById('carShortcutsContainer'),
    manageCarsBtn: document.getElementById('manageCarsBtn'),
    directFuelInput: document.getElementById('directFuelInput'),
    directFuelLabel: document.getElementById('directFuelLabel'),
    directFuelUnitSuffix: document.getElementById('directFuelUnitSuffix'),
    fuelPriceInput: document.getElementById('fuelPriceInput'),
    fuelPriceLabel: document.getElementById('fuelPriceLabel'),
    fuelPriceUnitSuffix: document.getElementById('fuelPriceUnitSuffix'),
    currencyBadge: document.getElementById('currencyBadge'),

    // Extra expenses
    extraExpensesAccordion: document.getElementById('extraExpensesAccordion'),
    accordionToggleBtn: document.getElementById('accordionToggleBtn'),
    tollsInput: document.getElementById('tollsInput'),
    parkingInput: document.getElementById('parkingInput'),
    carWearInput: document.getElementById('carWearInput'),
    wearModePercentBtn: document.getElementById('wearModePercentBtn'),
    wearModeFixedBtn: document.getElementById('wearModeFixedBtn'),
    wearSuffix: document.getElementById('wearSuffix'),
    wearHelpText: document.getElementById('wearHelpText'),
    currencySymbols: document.querySelectorAll('.currency-symbol'),

    // Hero Results
    heroCurrency: document.getElementById('heroCurrency'),
    perPersonAmount: document.getElementById('perPersonAmount'),
    driverShareSubtext: document.getElementById('driverShareSubtext'),
    metricTotalCost: document.getElementById('metricTotalCost'),
    metricFuelUsed: document.getElementById('metricFuelUsed'),
    metricDriverCollects: document.getElementById('metricDriverCollects'),

    // Summary list
    summaryFuelCost: document.getElementById('summaryFuelCost'),
    summaryExtraCost: document.getElementById('summaryExtraCost'),
    summaryTotalCost: document.getElementById('summaryTotalCost'),
    summarySplitRule: document.getElementById('summarySplitRule'),
    summaryPassengerOwes: document.getElementById('summaryPassengerOwes'),

    // Actions
    shareBtn: document.getElementById('shareBtn'),
    saveTripBtn: document.getElementById('saveTripBtn'),
    resetBtn: document.getElementById('resetBtn'),

    // Modals
    phoneModal: document.getElementById('phoneModal'),
    carModal: document.getElementById('carModal'),
    historyModal: document.getElementById('historyModal'),
    settingsModal: document.getElementById('settingsModal'),
    installGuideModal: document.getElementById('installGuideModal'),
    closeInstallGuideBtn: document.getElementById('closeInstallGuideBtn'),
    
    // Modal openers
    headerPhoneBtn: document.getElementById('headerPhoneBtn'),
    openPhoneModalBtn: document.getElementById('openPhoneModalBtn'),
    carProfilesBtn: document.getElementById('carProfilesBtn'),
    historyBtn: document.getElementById('historyBtn'),
    settingsBtn: document.getElementById('settingsBtn'),

    // QR Code elements
    qrcodeCanvas: document.getElementById('qrcodeCanvas'),
    phoneUrlDisplay: document.getElementById('phoneUrlDisplay'),
    copyUrlBtn: document.getElementById('copyUrlBtn'),

    // Cars & History dynamic containers
    carsList: document.getElementById('carsList'),
    newCarName: document.getElementById('newCarName'),
    newCarEconomy: document.getElementById('newCarEconomy'),
    newCarEconomyLabel: document.getElementById('newCarEconomyLabel'),
    saveCarBtn: document.getElementById('saveCarBtn'),
    historyListContainer: document.getElementById('historyListContainer'),
    clearHistoryBtn: document.getElementById('clearHistoryBtn'),

    // Settings elements
    unitMetricBtn: document.getElementById('unitMetricBtn'),
    unitImperialBtn: document.getElementById('unitImperialBtn'),
    currencySelect: document.getElementById('currencySelect'),
    customCurrencyWrap: document.getElementById('customCurrencyWrap'),
    customCurrencyInput: document.getElementById('customCurrencyInput'),
    roundingSelect: document.getElementById('roundingSelect'),
    darkThemeToggle: document.getElementById('darkThemeToggle'),
    metaThemeColor: document.getElementById('metaThemeColor'),

    // PC view controls
    toggleViewBtn: document.getElementById('toggleViewBtn'),
    deviceContainer: document.getElementById('deviceContainer'),

    // PWA & Toast
    installBanner: document.getElementById('installBanner'),
    pwaInstallBtn: document.getElementById('pwaInstallBtn'),
    toastMessage: document.getElementById('toastMessage'),
    toastText: document.getElementById('toastText')
  };

  let deferredPrompt = null;
  let calculationResult = {};

  // --- INITIALIZATION ---
  function init() {
    loadSettings();
    loadCars();
    loadHistory();
    setupEventListeners();
    applyUnitSystemUI();
    applyTheme();
    if (!elements.carWearInput.value) {
      elements.carWearInput.value = '2';
    }
    calculate();
    initServiceWorker();
    setupPwaPrompt();
  }

  // --- HAPTIC FEEDBACK ---
  function vibrate(ms = 15) {
    if ('vibrate' in navigator) {
      try { navigator.vibrate(ms); } catch (e) {}
    }
  }

  // --- LOCAL STORAGE HELPERS ---
  function loadSettings() {
    try {
      const saved = localStorage.getItem('splitride_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        state.unitSystem = parsed.unitSystem || 'metric';
        state.currency = parsed.currency || '€';
        state.roundingRule = parseFloat(parsed.roundingRule) || 0;
        state.darkTheme = parsed.darkTheme !== undefined ? parsed.darkTheme : true;
      }
      
      const lastInput = localStorage.getItem('splitride_inputs');
      if (lastInput) {
        const parsedIn = JSON.parse(lastInput);
        if (parsedIn.consumption) state.consumption = parseFloat(parsedIn.consumption);
        if (parsedIn.fuelPrice) state.fuelPrice = parseFloat(parsedIn.fuelPrice);
        if (parsedIn.peopleCount) state.peopleCount = parseInt(parsedIn.peopleCount, 10);
      }
    } catch (e) {
      console.warn('Could not load settings from storage', e);
    }

    // Set initial input element values
    elements.peopleCountInput.value = state.peopleCount;
    elements.consumptionInput.value = state.consumption || '';
    elements.fuelPriceInput.value = state.fuelPrice || '';
    elements.currencySelect.value = ['€', '$', '£', 'zł', 'Kč', 'Ft', 'CHF', 'kr'].includes(state.currency) ? state.currency : 'custom';
    if (elements.currencySelect.value === 'custom') {
      elements.customCurrencyWrap.style.display = 'block';
      elements.customCurrencyInput.value = state.currency;
    }
    elements.roundingSelect.value = state.roundingRule.toString();
    elements.darkThemeToggle.checked = state.darkTheme;
  }

  function saveSettings() {
    try {
      localStorage.setItem('splitride_settings', JSON.stringify({
        unitSystem: state.unitSystem,
        currency: state.currency,
        roundingRule: state.roundingRule,
        darkTheme: state.darkTheme
      }));
      localStorage.setItem('splitride_inputs', JSON.stringify({
        consumption: state.consumption,
        fuelPrice: state.fuelPrice,
        peopleCount: state.peopleCount
      }));
    } catch (e) {}
  }

  function loadCars() {
    try {
      const saved = localStorage.getItem('splitride_cars');
      if (saved) {
        state.cars = JSON.parse(saved);
      } else {
        // Defaults
        state.cars = [
          { id: 1, name: 'Compact / Diesel', economy: 5.2 },
          { id: 2, name: 'Sedan / Petrol', economy: 6.8 },
          { id: 3, name: 'SUV / City', economy: 8.5 }
        ];
      }
    } catch (e) {
      state.cars = [];
    }
    renderCarsList();
    renderCarShortcuts();
  }

  function saveCars() {
    try {
      localStorage.setItem('splitride_cars', JSON.stringify(state.cars));
    } catch (e) {}
    renderCarsList();
    renderCarShortcuts();
  }

  function loadHistory() {
    try {
      const saved = localStorage.getItem('splitride_history');
      if (saved) {
        state.history = JSON.parse(saved);
      }
    } catch (e) {
      state.history = [];
    }
    renderHistoryList();
  }

  function saveHistory() {
    try {
      localStorage.setItem('splitride_history', JSON.stringify(state.history));
    } catch (e) {}
    renderHistoryList();
  }

  // --- UNIT SYSTEM & UI ADAPTATION ---
  function applyUnitSystemUI() {
    const isMetric = state.unitSystem === 'metric';
    
    // Toggle buttons
    elements.unitMetricBtn.classList.toggle('active', isMetric);
    elements.unitImperialBtn.classList.toggle('active', !isMetric);

    // Labels & Suffixes
    elements.distanceLabel.textContent = isMetric ? 'Driven Distance' : 'Driven Distance';
    elements.distanceUnitSuffix.textContent = isMetric ? 'km' : 'miles';
    
    elements.consumptionLabel.textContent = isMetric ? 'Fuel Consumption Rate' : 'Fuel Economy (MPG)';
    elements.consumptionUnitSuffix.textContent = isMetric ? 'L / 100km' : 'MPG';
    elements.newCarEconomyLabel.textContent = isMetric ? 'Consumption (L/100km)' : 'Fuel Economy (MPG)';

    elements.directFuelLabel.textContent = isMetric ? 'Total Fuel Burned' : 'Total Fuel Burned';
    elements.directFuelUnitSuffix.textContent = isMetric ? 'Liters' : 'Gallons';

    elements.fuelPriceLabel.textContent = isMetric ? 'Fuel Price' : 'Fuel Price';
    elements.fuelPriceUnitSuffix.textContent = `${state.currency} / ${isMetric ? 'L' : 'gal'}`;
    elements.currencyBadge.textContent = `${state.currency} / ${isMetric ? 'L' : 'gal'}`;

    // Update chips labels based on unit
    const chipContainer = document.querySelector('.preset-chips');
    if (chipContainer) {
      if (isMetric) {
        chipContainer.innerHTML = `
          <button type="button" class="chip" data-preset="4.8">🌱 Eco (4.8)</button>
          <button type="button" class="chip" data-preset="5.8">🚗 Avg (5.8)</button>
          <button type="button" class="chip" data-preset="7.2">🏎️ Fast (7.2)</button>
          <button type="button" class="chip" data-preset="8.9">🚙 SUV (8.9)</button>
        `;
      } else {
        chipContainer.innerHTML = `
          <button type="button" class="chip" data-preset="45">🌱 Eco (45 MPG)</button>
          <button type="button" class="chip" data-preset="34">🚗 Avg (34 MPG)</button>
          <button type="button" class="chip" data-preset="26">🏎️ Fast (26 MPG)</button>
          <button type="button" class="chip" data-preset="20">🚙 SUV (20 MPG)</button>
        `;
      }
    }

    // Currency symbols
    elements.heroCurrency.textContent = state.currency;
    elements.currencySymbols.forEach(el => el.textContent = state.currency);
  }

  function applyTheme() {
    if (state.darkTheme) {
      document.body.classList.remove('light-theme');
      elements.metaThemeColor.setAttribute('content', '#0b1120');
    } else {
      document.body.classList.add('light-theme');
      elements.metaThemeColor.setAttribute('content', '#ffffff');
    }
  }

  // --- CALCULATION ENGINE ---
  function calculate() {
    const isMetric = state.unitSystem === 'metric';
    const people = Math.max(1, state.peopleCount);
    const includeDriver = state.includeDriver;

    // Read current form values
    let rawDistance = parseFloat(elements.distanceInput.value) || 0;
    let actualDistance = state.isRoundTrip ? rawDistance * 2 : rawDistance;
    let consumption = parseFloat(elements.consumptionInput.value) || 0;
    let directFuel = parseFloat(elements.directFuelInput.value) || 0;
    let fuelPrice = parseFloat(elements.fuelPriceInput.value) || 0;

    let tolls = parseFloat(elements.tollsInput.value) || 0;
    let parking = parseFloat(elements.parkingInput.value) || 0;
    let rawCarWear = parseFloat(elements.carWearInput.value) || 0;

    let fuelBurned = 0;
    let fuelCost = 0;

    if (state.mode === 'distance') {
      if (actualDistance > 0 && consumption > 0) {
        if (isMetric) {
          // Liters = (km * L/100km) / 100
          fuelBurned = (actualDistance * consumption) / 100;
        } else {
          // Gallons = miles / MPG
          fuelBurned = actualDistance / consumption;
        }
        fuelCost = fuelBurned * fuelPrice;
      }
    } else {
      // Direct fuel mode
      fuelBurned = directFuel;
      fuelCost = fuelBurned * fuelPrice;
    }

    // Maintenance cost: either % of fuel cost (scales with driven distance) or fixed amount
    let carWearCost = 0;
    if (state.wearMode === 'percent') {
      carWearCost = Math.max(0, (fuelCost * rawCarWear) / 100);
    } else {
      carWearCost = Math.max(0, rawCarWear);
    }

    let extraCosts = Math.max(0, tolls) + Math.max(0, parking) + carWearCost;
    const totalTripCost = Math.max(0, fuelCost + extraCosts);

    // Split calculations
    let payingPassengersCount = 0;
    let perPersonExact = 0;
    let driverCollects = 0;
    let driverPaysShare = 0;
    let splitDescription = '';

    if (includeDriver) {
      // Driver pays equal share
      payingPassengersCount = people - 1;
      perPersonExact = people > 0 ? (totalTripCost / people) : 0;
      driverPaysShare = perPersonExact;
      driverCollects = perPersonExact * payingPassengersCount;
      splitDescription = `${people} people split equally (Driver included)`;
    } else {
      // Driver rides free / passengers pay for car
      if (people > 1) {
        payingPassengersCount = people - 1;
        perPersonExact = totalTripCost / payingPassengersCount;
        driverPaysShare = 0;
        driverCollects = totalTripCost;
        splitDescription = `${payingPassengersCount} passenger${payingPassengersCount > 1 ? 's' : ''} pay (Driver rides free)`;
      } else {
        // Solo driver
        payingPassengersCount = 0;
        perPersonExact = 0;
        driverPaysShare = totalTripCost;
        driverCollects = 0;
        splitDescription = `Solo driver (100% covered by driver)`;
      }
    }

    // Apply Rounding
    let perPersonDisplay = perPersonExact;
    if (state.roundingRule === 0.5) {
      perPersonDisplay = Math.round(perPersonExact * 2) / 2;
    } else if (state.roundingRule === 1) {
      perPersonDisplay = Math.ceil(perPersonExact);
    } else if (state.roundingRule === 5) {
      perPersonDisplay = Math.ceil(perPersonExact / 5) * 5;
    }

    // Recalculate collected based on rounded amount
    const totalDriverCollectsRounded = perPersonDisplay * payingPassengersCount;

    // Save calculation snapshot
    calculationResult = {
      isMetric,
      distance: actualDistance,
      rawDistance,
      isRoundTrip: state.isRoundTrip,
      consumption,
      directFuel,
      fuelBurned,
      fuelPrice,
      fuelCost,
      tolls,
      parking,
      rawCarWear,
      carWearCost,
      wearMode: state.wearMode,
      extraCosts,
      totalTripCost,
      people,
      includeDriver,
      payingPassengersCount,
      perPersonExact,
      perPersonDisplay,
      driverCollects: totalDriverCollectsRounded,
      driverPaysShare,
      currency: state.currency
    };

    // Update UI elements
    updateUI();
  }

  function formatMoney(amount) {
    return isNaN(amount) ? '0.00' : Number(amount).toFixed(2);
  }

  function updateUI() {
    const r = calculationResult;
    const unitFuel = r.isMetric ? 'L' : 'gal';
    const unitDist = r.isMetric ? 'km' : 'mi';

    // Hero amounts
    elements.perPersonAmount.textContent = formatMoney(r.perPersonDisplay);
    elements.metricTotalCost.textContent = `${state.currency}${formatMoney(r.totalTripCost)}`;
    elements.metricFuelUsed.textContent = `${r.fuelBurned.toFixed(1)} ${unitFuel}`;
    elements.metricDriverCollects.textContent = `${state.currency}${formatMoney(r.driverCollects)}`;

    // Driver share subtext
    if (r.includeDriver) {
      elements.driverShareSubtext.textContent = `(Driver also pays ${state.currency}${formatMoney(r.perPersonDisplay)})`;
    } else {
      elements.driverShareSubtext.textContent = `(Driver pays ${state.currency}0.00)`;
    }

    // Split badge & labels
    elements.peopleCountLabel.textContent = `${r.people} Person${r.people > 1 ? 's' : ''}`;
    elements.splitBadge.textContent = r.includeDriver ? `${r.people} people equal split` : `${r.payingPassengersCount} paying passengers`;
    elements.driverSplitDesc.textContent = r.includeDriver
      ? `Driver pays equal share (Split by ${r.people})`
      : `Passengers cover costs (Split by ${Math.max(1, r.people - 1)} passenger${r.people > 2 ? 's' : ''})`;

    // Summary breakdown table
    elements.summaryFuelCost.textContent = `${state.currency}${formatMoney(r.fuelCost)} (${r.fuelBurned.toFixed(1)} ${unitFuel})`;
    
    let extraBreakdown = `${state.currency}${formatMoney(r.extraCosts)}`;
    if (r.carWearCost > 0) {
      if (r.wearMode === 'percent') {
        extraBreakdown += ` (${r.rawCarWear}% wear: ${state.currency}${formatMoney(r.carWearCost)})`;
      }
    }
    elements.summaryExtraCost.textContent = extraBreakdown;
    elements.summaryTotalCost.textContent = `${state.currency}${formatMoney(r.totalTripCost)}`;
    elements.summarySplitRule.textContent = r.includeDriver ? `Equal (${r.people} ways)` : `Passengers only (${r.payingPassengersCount} ways)`;
    elements.summaryPassengerOwes.textContent = `${state.currency}${formatMoney(r.perPersonDisplay)}`;
  }

  // --- EVENT LISTENERS ---
  function setupEventListeners() {
    // Mode switcher tabs
    elements.tabDistance.addEventListener('click', () => {
      vibrate(15);
      state.mode = 'distance';
      elements.tabDistance.classList.add('active');
      elements.tabDirectFuel.classList.remove('active');
      elements.tabDistance.setAttribute('aria-selected', 'true');
      elements.tabDirectFuel.setAttribute('aria-selected', 'false');
      elements.modeDistanceSection.style.display = 'block';
      elements.modeDirectSection.style.display = 'none';
      calculate();
    });

    elements.tabDirectFuel.addEventListener('click', () => {
      vibrate(15);
      state.mode = 'direct';
      elements.tabDirectFuel.classList.add('active');
      elements.tabDistance.classList.remove('active');
      elements.tabDirectFuel.setAttribute('aria-selected', 'true');
      elements.tabDistance.setAttribute('aria-selected', 'false');
      elements.modeDistanceSection.style.display = 'none';
      elements.modeDirectSection.style.display = 'block';
      calculate();
    });

    // Stepper buttons
    elements.peopleMinusBtn.addEventListener('click', () => {
      vibrate(15);
      if (state.peopleCount > 1) {
        state.peopleCount--;
        elements.peopleCountInput.value = state.peopleCount;
        calculate();
        saveSettings();
      }
    });

    elements.peoplePlusBtn.addEventListener('click', () => {
      vibrate(15);
      if (state.peopleCount < 50) {
        state.peopleCount++;
        elements.peopleCountInput.value = state.peopleCount;
        calculate();
        saveSettings();
      }
    });

    elements.peopleCountInput.addEventListener('input', (e) => {
      let val = parseInt(e.target.value, 10);
      if (!isNaN(val) && val >= 1) {
        state.peopleCount = val;
        calculate();
        saveSettings();
      }
    });

    // Driver include toggle
    elements.includeDriverToggle.addEventListener('change', (e) => {
      vibrate(15);
      state.includeDriver = e.target.checked;
      calculate();
    });

    // Round trip toggle button
    elements.roundTripBtn.addEventListener('click', () => {
      vibrate(15);
      state.isRoundTrip = !state.isRoundTrip;
      elements.roundTripBtn.style.color = state.isRoundTrip ? 'var(--primary)' : 'var(--text-muted)';
      elements.roundTripBtn.style.fontWeight = state.isRoundTrip ? '700' : '500';
      elements.roundTripBtn.textContent = state.isRoundTrip ? '🔄 Return Trip (2x Active)' : '🔄 Return Trip (2x)';
      calculate();
    });

    // Input changes triggers calculate
    const calculationInputs = [
      elements.distanceInput,
      elements.consumptionInput,
      elements.directFuelInput,
      elements.fuelPriceInput,
      elements.tollsInput,
      elements.parkingInput,
      elements.carWearInput
    ];

    calculationInputs.forEach(input => {
      input.addEventListener('input', () => {
        calculate();
      });
      input.addEventListener('change', () => {
        state.consumption = parseFloat(elements.consumptionInput.value) || state.consumption;
        state.fuelPrice = parseFloat(elements.fuelPriceInput.value) || state.fuelPrice;
        saveSettings();
      });
    });

    // Quick preset chips
    document.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (chip && chip.dataset.preset) {
        vibrate(15);
        elements.consumptionInput.value = chip.dataset.preset;
        document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        calculate();
        saveSettings();
      }
    });

    // Accordion for extra expenses
    elements.accordionToggleBtn.addEventListener('click', () => {
      vibrate(10);
      elements.extraExpensesAccordion.classList.toggle('open');
    });

    // Reset button
    elements.resetBtn.addEventListener('click', () => {
      vibrate(25);
      elements.distanceInput.value = '';
      elements.directFuelInput.value = '';
      elements.tollsInput.value = '';
      elements.parkingInput.value = '';
      elements.carWearInput.value = '';
      state.isRoundTrip = false;
      elements.roundTripBtn.textContent = '🔄 Return Trip (2x)';
      elements.roundTripBtn.style.color = 'var(--text-muted)';
      calculate();
      showToast('Values cleared');
    });

    // Share button
    elements.shareBtn.addEventListener('click', () => {
      vibrate(20);
      shareBreakdown();
    });

    // Save trip button
    elements.saveTripBtn.addEventListener('click', () => {
      vibrate(25);
      saveTripToHistory();
    });

    // View toggle (PC mockup vs full width)
    elements.toggleViewBtn.addEventListener('click', () => {
      document.body.classList.toggle('fullscreen-mode');
      vibrate(15);
    });

    // Modal Triggers
    elements.headerPhoneBtn.addEventListener('click', openPhoneModal);
    elements.openPhoneModalBtn.addEventListener('click', openPhoneModal);
    elements.carProfilesBtn.addEventListener('click', () => openModal(elements.carModal));
    if (elements.manageCarsBtn) {
      elements.manageCarsBtn.addEventListener('click', () => openModal(elements.carModal));
    }
    elements.historyBtn.addEventListener('click', () => openModal(elements.historyModal));
    elements.settingsBtn.addEventListener('click', () => openModal(elements.settingsModal));

    // Wear / Maintenance mode toggles
    if (elements.wearModePercentBtn && elements.wearModeFixedBtn) {
      elements.wearModePercentBtn.addEventListener('click', () => {
        vibrate(15);
        state.wearMode = 'percent';
        elements.wearModePercentBtn.classList.add('active');
        elements.wearModeFixedBtn.classList.remove('active');
        elements.wearSuffix.textContent = '%';
        elements.wearHelpText.innerHTML = '💡 Scales with driven km: adds a % of the total fuel cost';
        elements.carWearInput.placeholder = 'e.g. 2';
        calculate();
      });

      elements.wearModeFixedBtn.addEventListener('click', () => {
        vibrate(15);
        state.wearMode = 'fixed';
        elements.wearModeFixedBtn.classList.add('active');
        elements.wearModePercentBtn.classList.remove('active');
        elements.wearSuffix.textContent = state.currency;
        elements.wearHelpText.innerHTML = `💡 Fixed flat rate in ${state.currency}`;
        elements.carWearInput.placeholder = '0.00';
        calculate();
      });
    }

    // Modal Close buttons
    document.querySelectorAll('.close-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modalId = e.target.dataset.close;
        if (modalId) {
          closeModal(document.getElementById(modalId));
        }
      });
    });

    // Close modal on backdrop click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          closeModal(overlay);
        }
      });
    });

    // Copy URL button inside Phone modal
    elements.copyUrlBtn.addEventListener('click', () => {
      const url = elements.phoneUrlDisplay.textContent;
      navigator.clipboard.writeText(url).then(() => {
        showToast('Link copied to clipboard!');
      });
    });

    // Car profile save
    elements.saveCarBtn.addEventListener('click', () => {
      const name = elements.newCarName.value.trim();
      const economy = parseFloat(elements.newCarEconomy.value);
      if (!name || isNaN(economy) || economy <= 0) {
        showToast('Please enter a valid car name and economy');
        return;
      }
      state.cars.push({ id: Date.now(), name, economy });
      saveCars();
      elements.newCarName.value = '';
      elements.newCarEconomy.value = '';
      showToast(`Saved ${name}!`);
    });

    // History clear
    elements.clearHistoryBtn.addEventListener('click', () => {
      if (confirm('Clear all saved trips?')) {
        state.history = [];
        saveHistory();
        showToast('History cleared');
      }
    });

    // Settings listeners
    elements.unitMetricBtn.addEventListener('click', () => {
      if (state.unitSystem !== 'metric') {
        state.unitSystem = 'metric';
        applyUnitSystemUI();
        calculate();
        saveSettings();
      }
    });

    elements.unitImperialBtn.addEventListener('click', () => {
      if (state.unitSystem !== 'imperial') {
        state.unitSystem = 'imperial';
        applyUnitSystemUI();
        calculate();
        saveSettings();
      }
    });

    elements.currencySelect.addEventListener('change', (e) => {
      if (e.target.value === 'custom') {
        elements.customCurrencyWrap.style.display = 'block';
      } else {
        elements.customCurrencyWrap.style.display = 'none';
        state.currency = e.target.value;
        applyUnitSystemUI();
        calculate();
        saveSettings();
      }
    });

    elements.customCurrencyInput.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      if (val) {
        state.currency = val;
        applyUnitSystemUI();
        calculate();
        saveSettings();
      }
    });

    elements.roundingSelect.addEventListener('change', (e) => {
      state.roundingRule = parseFloat(e.target.value);
      calculate();
      saveSettings();
    });

    elements.darkThemeToggle.addEventListener('change', (e) => {
      state.darkTheme = e.target.checked;
      applyTheme();
      saveSettings();
    });
  }

  // --- MODAL HELPERS ---
  function openModal(modal) {
    if (modal) {
      modal.classList.add('active');
    }
  }

  function closeModal(modal) {
    if (modal) {
      modal.classList.remove('active');
    }
  }

  // --- PHONE / QR CODE MODAL ---
  function openPhoneModal() {
    vibrate(15);
    openModal(elements.phoneModal);

    // Secure HTTPS tunnel URL for seamless Android installation without SSL/HTTP errors
    const httpsTunnelUrl = 'https://f5132bd27df32e.lhr.life';
    let targetUrl = httpsTunnelUrl;

    elements.phoneUrlDisplay.textContent = targetUrl;

    // Render QR Code using qrcode.min.js
    if (window.QRCode) {
      elements.qrcodeCanvas.innerHTML = '';
      new window.QRCode(elements.qrcodeCanvas, {
        text: targetUrl,
        width: 180,
        height: 180,
        colorDark: "#0f172a",
        colorLight: "#ffffff",
        correctLevel: 0
      });
    }
  }

  // --- SHARE BREAKDOWN ---
  function shareBreakdown() {
    const r = calculationResult;
    const unitFuel = r.isMetric ? 'L' : 'gal';
    const unitDist = r.isMetric ? 'km' : 'mi';

    let tripDesc = '';
    if (state.mode === 'distance' && r.distance > 0) {
      tripDesc = `🛣️ Distance: ${r.distance} ${unitDist}${r.isRoundTrip ? ' (Round-trip)' : ''}\n`;
    }

    let extraDesc = '';
    if (r.extraCosts > 0) {
      extraDesc = `➕ Extra Costs: ${state.currency}${formatMoney(r.extraCosts)}\n`;
    }

    const shareText = 
`🚗 Carpool Fuel Split:
--------------------------------
${tripDesc}⛽ Fuel: ${r.fuelBurned.toFixed(1)} ${unitFuel} (${state.currency}${formatMoney(r.fuelCost)})
${extraDesc}💰 Total Trip Cost: ${state.currency}${formatMoney(r.totalTripCost)}
👥 Split among: ${r.people} people (${r.includeDriver ? 'driver included' : 'passengers only'})
--------------------------------
👉 EACH PASSENGER PAYS: ${state.currency}${formatMoney(r.perPersonDisplay)}
👤 Driver collects: ${state.currency}${formatMoney(r.driverCollects)} total
--------------------------------
Calculated with SplitRide 📱`;

    // Attempt native Web Share API (WhatsApp, Telegram, SMS, etc. on Poco X4 Pro)
    if (navigator.share) {
      navigator.share({
        title: 'Carpool Fuel Split',
        text: shareText
      }).catch(err => {
        // User cancelled or fallback
        if (err.name !== 'AbortError') {
          copyToClipboard(shareText);
        }
      });
    } else {
      // Fallback to clipboard on PC
      copyToClipboard(shareText);
    }
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast('Bill copied to clipboard! 📋');
      }).catch(() => {
        showToast('Could not copy text');
      });
    } else {
      showToast('Clipboard not supported');
    }
  }

  // --- TRIP HISTORY ---
  function saveTripToHistory() {
    const r = calculationResult;
    if (r.totalTripCost <= 0) {
      showToast('Enter trip details first');
      return;
    }

    const trip = {
      id: Date.now(),
      date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      perPerson: r.perPersonDisplay,
      totalCost: r.totalTripCost,
      people: r.people,
      fuelBurned: r.fuelBurned.toFixed(1),
      currency: state.currency,
      mode: state.mode
    };

    state.history.unshift(trip);
    if (state.history.length > 20) state.history.pop();
    saveHistory();
    showToast('Trip saved to History! 💾');
  }

  function renderHistoryList() {
    if (!elements.historyListContainer) return;

    if (state.history.length === 0) {
      elements.historyListContainer.innerHTML = `
        <div style="text-align: center; color: var(--text-muted); padding: 24px 0; font-size: 0.9rem;">
          No saved trips yet.<br>Calculate a split and tap "Save Trip".
        </div>
      `;
      return;
    }

    elements.historyListContainer.innerHTML = state.history.map(item => `
      <div class="history-item">
        <div class="history-info">
          <span class="history-details">${item.currency}${formatMoney(item.perPerson)} / person</span>
          <span class="history-date">${item.date} • ${item.people} people • ${item.fuelBurned} ${state.unitSystem === 'metric' ? 'L' : 'gal'}</span>
        </div>
        <div class="history-cost">
          <span class="history-total">Total: ${item.currency}${formatMoney(item.totalCost)}</span>
        </div>
      </div>
    `).join('');
  }

  // --- CAR PROFILES ---
  function renderCarsList() {
    if (!elements.carsList) return;

    const unitEconomy = state.unitSystem === 'metric' ? 'L/100km' : 'MPG';

    if (state.cars.length === 0) {
      elements.carsList.innerHTML = `<div style="text-align: center; color: var(--text-muted); font-size: 0.85rem; padding: 12px 0;">No car profiles added.</div>`;
      return;
    }

    elements.carsList.innerHTML = state.cars.map(car => `
      <div class="history-item" style="cursor: pointer;" data-car-economy="${car.economy}">
        <div class="history-info">
          <span class="history-details">${car.name}</span>
          <span class="history-date">${car.economy} ${unitEconomy}</span>
        </div>
        <div style="display: flex; gap: 8px; align-items: center;">
          <button class="pc-banner-btn use-car-btn" data-economy="${car.economy}" style="padding: 4px 8px; font-size: 0.75rem;">Use</button>
          <button class="close-btn delete-car-btn" data-id="${car.id}" style="color: var(--danger); font-size: 1.1rem;">&times;</button>
        </div>
      </div>
    `).join('');

    // Attach listeners to car items
    elements.carsList.querySelectorAll('.use-car-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        vibrate(15);
        const eco = parseFloat(e.target.dataset.economy);
        elements.consumptionInput.value = eco;
        closeModal(elements.carModal);
        calculate();
        showToast(`Loaded ${eco} ${unitEconomy}`);
      });
    });

    elements.carsList.querySelectorAll('.delete-car-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = parseInt(e.target.dataset.id, 10);
        state.cars = state.cars.filter(c => c.id !== id);
        saveCars();
      });
    });
  }

  // --- CAR SHORTCUTS ON MAIN SCREEN ---
  function renderCarShortcuts() {
    if (!elements.carShortcutsContainer) return;

    const unitEconomy = state.unitSystem === 'metric' ? 'L' : 'MPG';

    if (state.cars.length === 0) {
      elements.carShortcutsContainer.innerHTML = `
        <button type="button" class="car-shortcut-chip" id="addFirstCarBtn" style="color: var(--accent); border-style: dashed;">
          + Add Your Car
        </button>
      `;
      const addFirst = document.getElementById('addFirstCarBtn');
      if (addFirst) addFirst.addEventListener('click', () => openModal(elements.carModal));
      return;
    }

    const currentVal = parseFloat(elements.consumptionInput.value);

    elements.carShortcutsContainer.innerHTML = state.cars.map(car => {
      const isSelected = Math.abs(car.economy - currentVal) < 0.05;
      return `
        <button type="button" class="car-shortcut-chip ${isSelected ? 'active' : ''}" data-economy="${car.economy}">
          🚘 ${car.name} (${car.economy} ${unitEconomy})
        </button>
      `;
    }).join('') + `
      <button type="button" class="car-shortcut-chip" id="quickAddCarBtn" style="color: var(--accent); border-style: dashed;">
        + Add
      </button>
    `;

    // Listeners for car shortcut chips
    elements.carShortcutsContainer.querySelectorAll('.car-shortcut-chip[data-economy]').forEach(chip => {
      chip.addEventListener('click', () => {
        vibrate(15);
        const eco = parseFloat(chip.dataset.economy);
        elements.consumptionInput.value = eco;

        // Highlight this chip as active
        elements.carShortcutsContainer.querySelectorAll('.car-shortcut-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');

        // Unhighlight generic preset chips
        document.querySelectorAll('.preset-chips .chip').forEach(c => c.classList.remove('active'));

        calculate();
        saveSettings();
        showToast(`Loaded ${chip.textContent.trim()}`);
      });
    });

    const quickAdd = document.getElementById('quickAddCarBtn');
    if (quickAdd) quickAdd.addEventListener('click', () => openModal(elements.carModal));
  }

  // --- TOAST NOTIFICATIONS ---
  let toastTimeout = null;
  function showToast(msg) {
    if (elements.toastMessage && elements.toastText) {
      elements.toastText.textContent = msg;
      elements.toastMessage.classList.add('show');
      if (toastTimeout) clearTimeout(toastTimeout);
      toastTimeout = setTimeout(() => {
        elements.toastMessage.classList.remove('show');
      }, 2500);
    }
  }

  // --- SERVICE WORKER FOR OFFLINE SUPPORT & AUTO-UPDATES ---
  function initServiceWorker() {
    if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
      navigator.serviceWorker.register('./sw.js')
        .then((reg) => {
          console.log('SplitRide ServiceWorker registered');
          // Check for updates every time app opens
          reg.update();
        })
        .catch(err => {
          console.warn('ServiceWorker registration error:', err);
        });

      // Automatically reload to apply update when a new service worker takes over
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }
  }

  // --- PWA INSTALLATION PROMPT ---
  function setupPwaPrompt() {
    // If running inside native APK (file:///android_asset) or standalone PWA, hide banner
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         window.navigator.standalone === true ||
                         window.location.protocol === 'file:';

    if (isStandalone && elements.installBanner) {
      elements.installBanner.style.display = 'none';
      return;
    }

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      if (elements.installBanner) {
        elements.installBanner.style.display = 'flex';
      }
    });

    if (elements.pwaInstallBtn) {
      elements.pwaInstallBtn.addEventListener('click', async () => {
        vibrate(20);
        if (deferredPrompt) {
          deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          if (outcome === 'accepted') {
            if (elements.installBanner) elements.installBanner.style.display = 'none';
          }
          deferredPrompt = null;
        } else {
          // Chrome on Android disables the in-page JavaScript install trigger on plain HTTP (local IP)
          // Show the explicit 2-step visual guide pointing to the 3 dots
          openModal(elements.installGuideModal);
        }
      });
    }

    if (elements.closeInstallGuideBtn) {
      elements.closeInstallGuideBtn.addEventListener('click', () => {
        closeModal(elements.installGuideModal);
      });
    }
  }

  // Run on page load
  window.addEventListener('DOMContentLoaded', init);
})();
