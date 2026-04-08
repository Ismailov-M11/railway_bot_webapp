/* ── Telegram Web App ── */
const tgApp = window.Telegram ? window.Telegram.WebApp : null;

/* ── App state ── */
const state = {
    user: null,        // { telegram_id, language, notify_mode }
    routes: [],        // [{ id, from_code, from_name, to_code, to_name, travel_date }]
    lang: 'ru',

    view: 'loading',   // loading | routes | detail | add | settings

    // Detail / check
    selectedRouteId: null,
    checkResult: null,  // null | { available, trains, checked_at }
    checkLoading: false,

    // Add / edit form
    form: {
        editId: null,         // null = add, number = edit
        step: 1,              // 1=from 2=to 3=date
        from: null,           // { code, name }
        to: null,             // { code, name }
        date: '',
        // search state
        searchQuery: '',
        searchResults: [],
        searchLoading: false,
        searchField: null,    // 'from' | 'to'
    },

    // Settings form
    settingsForm: {
        lang: 'ru',
        notify_mode: 'always',
    },
};

/* ──────────────────────────────────────
   Navigation helpers
────────────────────────────────────── */
function navigate(view, opts = {}) {
    state.view = view;

    if (view === 'routes') {
        hideTgBack();
        setTgMainBtn(null);
    } else if (view === 'detail') {
        state.selectedRouteId = opts.routeId;
        state.checkResult = null;
        state.checkLoading = false;
        showTgBack(() => navigate('routes'));
        setTgMainBtn(t('check'), doCheckRoute);
    } else if (view === 'add') {
        state.form = {
            editId: opts.editId || null,
            step: opts.editId ? (opts.startStep || 1) : 1,
            from: opts.from || null,
            to: opts.to || null,
            date: opts.date || '',
            searchQuery: '',
            searchResults: [],
            searchLoading: false,
            searchField: null,
        };
        showTgBack(onFormBack);
        updateFormMainBtn();
    } else if (view === 'settings') {
        state.settingsForm = {
            lang: state.user.language,
            notify_mode: state.user.notify_mode,
        };
        showTgBack(() => navigate('routes'));
        setTgMainBtn(t('save'), doSaveSettings);
    }

    render();
}

function onFormBack() {
    const f = state.form;
    if (f.step === 1) {
        navigate('routes');
    } else {
        f.step -= 1;
        f.searchQuery = '';
        f.searchResults = [];
        updateFormMainBtn();
        render();
    }
}

/* ──────────────────────────────────────
   Telegram button helpers
────────────────────────────────────── */
function showTgBack(cb) {
    if (!tgApp) return;
    tgApp.BackButton.show();
    tgApp.BackButton.offClick(tgApp._backCb);
    tgApp._backCb = cb;
    tgApp.BackButton.onClick(cb);
}

function hideTgBack() {
    if (!tgApp) return;
    tgApp.BackButton.hide();
}

function setTgMainBtn(text, cb) {
    if (!tgApp) return;
    if (!text) {
        tgApp.MainButton.hide();
        return;
    }
    tgApp.MainButton.setText(text);
    tgApp.MainButton.show();
    tgApp.MainButton.offClick(tgApp._mainCb);
    tgApp._mainCb = cb;
    tgApp.MainButton.onClick(cb);
}

function updateFormMainBtn() {
    const f = state.form;
    const isLastStep = f.step === 3;
    const label = isLastStep ? t('save') : t('next');
    setTgMainBtn(label, isLastStep ? doSaveRoute : doFormNext);
}

/* ──────────────────────────────────────
   Render dispatcher
────────────────────────────────────── */
function render() {
    const app = document.getElementById('app');
    switch (state.view) {
        case 'loading':  app.innerHTML = renderLoading(); break;
        case 'routes':   app.innerHTML = renderRoutes(); break;
        case 'detail':   app.innerHTML = renderDetail(); break;
        case 'add':      app.innerHTML = renderAddForm(); break;
        case 'settings': app.innerHTML = renderSettings(); break;
    }
    attachListeners();
}

/* ──────────────────────────────────────
   View: Loading
────────────────────────────────────── */
function renderLoading() {
    return `<div class="loading-screen"><div class="spinner"></div></div>`;
}

/* ──────────────────────────────────────
   View: Routes list
────────────────────────────────────── */
function renderRoutes() {
    const lang = state.lang;

    let body = '';
    if (state.routes.length === 0) {
        body = `
        <div class="empty-state">
            <div class="empty-icon">🚆</div>
            <div class="empty-title">${t('no_routes')}</div>
        </div>`;
    } else {
        body = state.routes.map((route) => {
            const dateUi = fmtDate(route.travel_date, lang);
            return `
            <button class="route-card" data-action="open-route" data-id="${route.id}">
                <div class="route-card-icon">🚆</div>
                <div class="route-card-body">
                    <div class="route-card-title">${esc(route.from_name)} → ${esc(route.to_name)}</div>
                    <div class="route-card-sub">📅 ${dateUi}</div>
                </div>
                <div class="chevron">›</div>
            </button>`;
        }).join('');
    }

    const canAdd = state.routes.length < CONFIG.MAX_ROUTES;

    return `
    <div class="screen">
        <div class="header">
            <div class="header-title">🚆 ${t('my_routes')}</div>
            <button class="header-btn" data-action="go-settings">⚙️</button>
        </div>
        <div class="content">
            ${body}
        </div>
        ${canAdd ? `<button class="fab" data-action="go-add">＋</button>` : ''}
    </div>`;
}

/* ──────────────────────────────────────
   View: Route Detail
────────────────────────────────────── */
function renderDetail() {
    const route = state.routes.find(r => r.id === state.selectedRouteId);
    if (!route) return renderRoutes();

    const lang = state.lang;
    const dateUi = fmtDate(route.travel_date, lang);

    let checkSection = '';
    if (state.checkLoading) {
        checkSection = `
        <div class="inline-loading">
            <div class="spinner"></div>
            <span>${t('checking')}</span>
        </div>`;
    } else if (state.checkResult) {
        const cr = state.checkResult;
        const statusText = cr.available ? t('tickets_available') : t('tickets_none');
        const checkedAt = cr.checked_at ? fmtTime(cr.checked_at) : '';

        checkSection = `
        <div class="check-result-header">
            <div class="check-result-icon">${cr.available ? '🎉' : '😔'}</div>
            <div class="check-result-text">
                <div class="check-result-status">${statusText}</div>
                ${checkedAt ? `<div class="check-result-time">⏰ ${checkedAt}</div>` : ''}
            </div>
        </div>`;

        if (cr.available && cr.trains && cr.trains.length > 0) {
            checkSection += cr.trains.map(train => renderTrainCard(train, lang)).join('');
        }
    }

    return `
    <div class="screen">
        <div class="header">
            <div class="header-title">📍 ${esc(route.from_name)} → ${esc(route.to_name)}</div>
        </div>
        <div class="content">
            <div class="detail-section">
                <div class="detail-row">
                    <div class="detail-row-label">🚉 ${t('step_from')}</div>
                    <div class="detail-row-value">${esc(route.from_name)}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-row-label">🏁 ${t('step_to')}</div>
                    <div class="detail-row-value">${esc(route.to_name)}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-row-label">📅 ${t('travel_date')}</div>
                    <div class="detail-row-value">${dateUi}</div>
                </div>
            </div>

            <div class="action-row">
                <button class="btn btn-secondary btn-sm" data-action="edit-route" data-id="${route.id}">✏️ ${t('edit')}</button>
                <button class="btn btn-danger btn-sm" data-action="delete-route" data-id="${route.id}">🗑 ${t('delete')}</button>
            </div>

            ${checkSection}
        </div>
    </div>`;
}

function renderTrainCard(train, lang) {
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.ru;
    const cars = (train.cars_data || []).map(car => {
        let details = '';
        if (car.up > 0)      details += `<span class="car-seat-info">⬆️ ${dict.seats_up}: ${car.up}</span>`;
        if (car.down > 0)    details += `<span class="car-seat-info">⬇️ ${dict.seats_down}: ${car.down}</span>`;
        if (car.lateral_up > 0) details += `<span class="car-seat-info">↖️ ${dict.seats_lat_up}: ${car.lateral_up}</span>`;
        if (car.lateral_down > 0) details += `<span class="car-seat-info">↙️ ${dict.seats_lat_dn}: ${car.lateral_down}</span>`;
        return `
        <div class="car-row">
            <div class="car-main">
                <div class="car-name">${carIcon(car.type)} ${esc(car.type)}</div>
                <div class="car-seats">${car.free} ${dict.seats_word}</div>
                <div class="car-price">${car.price} ${dict.currency}</div>
            </div>
            ${details ? `<div class="car-detail">${details}</div>` : ''}
        </div>`;
    }).join('');

    return `
    <div class="train-card">
        <div class="train-header">🚄 ${t('train_number')} ${esc(train.number)}${train.type ? ` (${esc(train.type)})` : ''}</div>
        <div class="train-route">🛤 ${esc(train.route_name)}</div>
        <div class="train-times">
            <div class="train-time-col">
                <div class="train-time-label">${t('departure')}</div>
                <div class="train-time-value">${esc(train.dep_time)}</div>
            </div>
            <div class="train-time-col">
                <div class="train-time-label">${t('arrival')}</div>
                <div class="train-time-value">${esc(train.arr_time)}</div>
            </div>
        </div>
        <div class="train-duration">⏳ ${t('travel_time')}: ${esc(train.duration)}</div>
        ${cars}
    </div>`;
}

/* ──────────────────────────────────────
   View: Add / Edit Route
────────────────────────────────────── */
function renderAddForm() {
    const f = state.form;
    const isEdit = !!f.editId;
    const title = isEdit ? `✏️ ${t('edit')}` : `➕ ${t('add_route')}`;

    // Step indicator
    const steps = [t('step_from'), t('step_to'), t('step_date')];
    const stepDots = steps.map((_label, i) => {
        const idx = i + 1;
        const cls = idx < f.step ? 'done' : (idx === f.step ? 'active' : '');
        return `<div class="step ${cls}"></div>`;
    }).join('');
    const stepLabels = steps.map((label, i) => {
        const idx = i + 1;
        const cls = idx < f.step ? 'done' : (idx === f.step ? 'active' : '');
        return `<span class="step-label ${cls}">${label}</span>`;
    }).join('');

    let content = '';

    if (f.step === 1) {
        content = renderStationStep('from');
    } else if (f.step === 2) {
        content = renderStationStep('to');
    } else if (f.step === 3) {
        content = renderDateStep();
    }

    return `
    <div class="screen">
        <div class="header">
            <div class="header-title">${title}</div>
        </div>
        <div style="padding: 12px 16px 0">
            <div class="steps">${stepDots}</div>
            <div class="step-labels">${stepLabels}</div>
        </div>
        <div class="content">
            ${content}
        </div>
    </div>`;
}

function renderStationStep(field) {
    const f = state.form;
    const selected = f[field]; // { code, name } or null

    if (selected) {
        // Show selected chip + option to change
        return `
        <div class="selected-station">
            <span>🚉 ${esc(selected.name)}</span>
            <span class="selected-station-change">${esc(selected.code)}</span>
            <button class="btn btn-ghost btn-sm" data-action="clear-station" data-field="${field}" style="margin-left:auto;width:auto;padding:6px 10px">✕</button>
        </div>
        <p style="font-size:13px;color:var(--hint);padding-top:8px;text-align:center">
            ${field === 'from' ? t('enter_from') : t('enter_to')} ${t('next').toLowerCase()} →
        </p>`;
    }

    const placeholder = t('search_placeholder');

    return `
    <div class="form-group">
        <label class="form-label">${field === 'from' ? t('step_from') : t('step_to')}</label>
        <div class="search-wrapper">
            <input
                class="form-input"
                id="station-input"
                type="text"
                placeholder="${placeholder}"
                value="${esc(f.searchQuery)}"
                data-field="${field}"
                autocomplete="off"
                autocorrect="off"
                autocapitalize="off"
                spellcheck="false"
                dir="ltr"
                autofocus
            >
            <div class="search-results" id="search-results-box"></div>
        </div>
    </div>`;
}

function renderDateStep() {
    const f = state.form;
    const today = new Date().toISOString().split('T')[0];

    // Display formatted date for the label
    let dateLabel = '';
    if (f.date) {
        dateLabel = fmtDate(f.date, state.lang);
    }

    return `
    <div class="form-group">
        <label class="form-label">${t('step_date')}</label>
        <div class="date-picker-wrap">
            <input
                class="date-input"
                id="date-input"
                type="date"
                value="${f.date}"
                min="${today}"
            >
            <div class="date-display ${f.date ? 'has-value' : ''}" id="date-display-btn">
                <span class="date-display-icon">📅</span>
                <span id="date-display-text" class="date-display-text">${dateLabel || t('enter_date')}</span>
                <span class="date-display-arrow">›</span>
            </div>
        </div>
    </div>
    ${f.from ? `
    <div class="detail-section" style="margin-top:4px">
        <div class="detail-row">
            <div class="detail-row-label">🚉 ${t('step_from')}</div>
            <div class="detail-row-value">${esc(f.from.name)}</div>
        </div>
        <div class="detail-row">
            <div class="detail-row-label">🏁 ${t('step_to')}</div>
            <div class="detail-row-value">${esc(f.to ? f.to.name : '—')}</div>
        </div>
    </div>` : ''}`;
}

/* ──────────────────────────────────────
   View: Settings
────────────────────────────────────── */
function renderSettings() {
    const sf = state.settingsForm;

    const langs = [
        { code: 'ru', label: '🇷🇺 Русский' },
        { code: 'uz', label: '🇺🇿 O\'zbekcha' },
        { code: 'en', label: '🇬🇧 English' },
    ];

    const langOptions = langs.map(l => `
        <button class="setting-option${sf.lang === l.code ? ' selected' : ''}" data-action="set-lang" data-value="${l.code}">
            <span>${l.label}</span>
            ${sf.lang === l.code ? '<span class="setting-option-check">✓</span>' : ''}
        </button>`).join('');

    const notifyOptions = [
        { value: 'always', label: t('notify_always'), icon: '⏰' },
        { value: 'on_available', label: t('notify_on_available'), icon: '⚡' },
    ].map(o => `
        <button class="setting-option${sf.notify_mode === o.value ? ' selected' : ''}" data-action="set-notify" data-value="${o.value}">
            <span>${o.icon} ${o.label}</span>
            ${sf.notify_mode === o.value ? '<span class="setting-option-check">✓</span>' : ''}
        </button>`).join('');

    return `
    <div class="screen">
        <div class="header">
            <div class="header-title">⚙️ ${t('settings')}</div>
        </div>
        <div class="content">
            <div class="section-header">${t('language')}</div>
            <div class="setting-select">${langOptions}</div>

            <div class="section-header" style="margin-top:8px">${t('notifications')}</div>
            <div class="setting-select">${notifyOptions}</div>
        </div>
    </div>`;
}

/* ──────────────────────────────────────
   Event delegation
────────────────────────────────────── */
function attachListeners() {
    const app = document.getElementById('app');

    // Delegated clicks
    app.addEventListener('click', handleClick);

    // Station search input
    const stationInput = document.getElementById('station-input');
    if (stationInput) {
        stationInput.addEventListener('input', handleStationInput);
        stationInput.focus();
    }

    // Date picker — click on display triggers native picker via showPicker()
    const dateInput   = document.getElementById('date-input');
    const dateDisplay = document.getElementById('date-display-btn');
    if (dateInput && dateDisplay) {
        dateDisplay.addEventListener('click', () => {
            try {
                dateInput.showPicker();        // Chrome 99+, Firefox 101+, Safari 16+
            } catch {
                dateInput.focus();             // fallback for older browsers
            }
        });
        dateInput.addEventListener('change', (e) => {
            state.form.date = e.target.value;
            if (e.target.value) {
                dateDisplay.classList.add('has-value');
                document.getElementById('date-display-text').textContent =
                    fmtDate(e.target.value, state.lang);
            }
        });
    }
}

function handleClick(e) {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const action = el.dataset.action;

    switch (action) {
        case 'go-settings': navigate('settings'); break;
        case 'go-add':      navigate('add'); break;
        case 'open-route':  navigate('detail', { routeId: parseInt(el.dataset.id) }); break;
        case 'edit-route':  startEditRoute(parseInt(el.dataset.id)); break;
        case 'delete-route': confirmDeleteRoute(parseInt(el.dataset.id)); break;

        case 'select-station': {
            const field = el.dataset.field;
            const code = el.dataset.code;
            const name = el.dataset.name;
            state.form[field] = { code, name };
            state.form.searchQuery = '';
            state.form.searchResults = [];
            // If 'from' selected, auto-advance to step 2
            if (field === 'from' && state.form.step === 1) {
                state.form.step = 2;
                updateFormMainBtn();
            }
            render();
            break;
        }
        case 'clear-station': {
            const field = el.dataset.field;
            state.form[field] = null;
            state.form.searchQuery = '';
            state.form.searchResults = [];
            render();
            break;
        }
    }
}

/* ──────────────────────────────────────
   Station search (debounced, partial DOM update)
────────────────────────────────────── */
let _searchTimer = null;

// Updates ONLY the results box — never re-creates the input element
function _renderSearchResults(field) {
    const box = document.getElementById('search-results-box');
    if (!box) return;
    const f = state.form;
    let html = '';
    if (f.searchLoading) {
        html = `<div class="search-hint">${t('searching')}</div>`;
    } else if (f.searchQuery.length >= 2 && f.searchResults.length === 0) {
        html = `<div class="search-hint">${t('no_stations')}</div>`;
    } else if (f.searchResults.length > 0) {
        html = f.searchResults.slice(0, 8).map(s =>
            `<button class="search-item" data-action="select-station"
                data-field="${field}" data-code="${esc(s.code)}" data-name="${esc(s.name)}">
                <span>${esc(s.name)}</span>
                <span class="search-item-code">${esc(s.code)}</span>
            </button>`
        ).join('');
    }
    box.innerHTML = html;
    box.style.display = html ? 'block' : 'none';
}

function handleStationInput(e) {
    const query = e.target.value;
    const field = e.target.dataset.field;
    state.form.searchQuery = query;

    clearTimeout(_searchTimer);

    if (query.length < 2) {
        state.form.searchResults = [];
        state.form.searchLoading = false;
        _renderSearchResults(field);
        return;
    }

    state.form.searchLoading = true;
    _renderSearchResults(field);

    _searchTimer = setTimeout(async () => {
        try {
            const res = await API.searchStations(query, state.lang);
            state.form.searchResults = res.stations || [];
        } catch {
            state.form.searchResults = [];
        }
        state.form.searchLoading = false;
        _renderSearchResults(field);
    }, 400);
}

/* ──────────────────────────────────────
   Form navigation
────────────────────────────────────── */
function doFormNext() {
    const f = state.form;

    if (f.step === 1) {
        if (!f.from) { showToast(t('station_required'), 'error'); return; }
        f.step = 2;
        f.searchQuery = '';
        f.searchResults = [];
        updateFormMainBtn();
        render();
    } else if (f.step === 2) {
        if (!f.to) { showToast(t('station_required'), 'error'); return; }
        f.step = 3;
        f.searchQuery = '';
        f.searchResults = [];
        updateFormMainBtn();
        render();
    }
}

/* ──────────────────────────────────────
   Save route
────────────────────────────────────── */
async function doSaveRoute() {
    const f = state.form;

    // Read date from DOM if not yet synced
    const dateEl = document.getElementById('date-input');
    if (dateEl) f.date = dateEl.value;

    if (!f.date) { showToast(t('date_required'), 'error'); return; }

    // Validate date not in past
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const selected = new Date(f.date);
    if (selected < today) { showToast(t('date_past'), 'error'); return; }

    if (!f.from || !f.to) { showToast(t('station_required'), 'error'); return; }

    setTgMainBtn(t('save'), null);
    if (tgApp) tgApp.MainButton.showProgress();

    try {
        if (f.editId) {
            await API.updateRoute(f.editId, {
                from_code: f.from.code,
                from_name: f.from.name,
                to_code: f.to.code,
                to_name: f.to.name,
                travel_date: f.date,
            });
            showToast(t('route_updated'), 'success');
        } else {
            if (state.routes.length >= CONFIG.MAX_ROUTES) {
                showToast(t('max_routes'), 'error');
                return;
            }
            await API.createRoute({
                from_code: f.from.code,
                from_name: f.from.name,
                to_code: f.to.code,
                to_name: f.to.name,
                travel_date: f.date,
            });
            showToast(t('route_saved'), 'success');
        }
        await loadRoutes();
        navigate('routes');
    } catch (err) {
        showToast(err.message || t('error_save'), 'error');
    } finally {
        if (tgApp) tgApp.MainButton.hideProgress();
    }
}

/* ──────────────────────────────────────
   Edit route
────────────────────────────────────── */
function startEditRoute(routeId) {
    const route = state.routes.find(r => r.id === routeId);
    if (!route) return;
    navigate('add', {
        editId: routeId,
        from: { code: route.from_code, name: route.from_name },
        to:   { code: route.to_code,   name: route.to_name   },
        date: route.travel_date,
    });
}

/* ──────────────────────────────────────
   Delete route
────────────────────────────────────── */
function confirmDeleteRoute(routeId) {
    showConfirmSheet(t('confirm_delete'), () => doDeleteRoute(routeId));
}

async function doDeleteRoute(routeId) {
    try {
        await API.deleteRoute(routeId);
        await loadRoutes();
        showToast(t('route_deleted'), 'success');
        navigate('routes');
    } catch (err) {
        showToast(err.message || t('error_generic'), 'error');
    }
}

/* ──────────────────────────────────────
   Check route
────────────────────────────────────── */
async function doCheckRoute() {
    if (state.checkLoading) return;
    state.checkLoading = true;
    state.checkResult = null;
    render();

    try {
        const result = await API.checkRoute(state.selectedRouteId);
        state.checkResult = result; // { available, trains, checked_at }
    } catch (err) {
        showToast(err.message || t('error_check'), 'error');
        state.checkResult = null;
    } finally {
        state.checkLoading = false;
        render();
    }
}

/* ──────────────────────────────────────
   Settings save
────────────────────────────────────── */
async function doSaveSettings() {
    if (tgApp) tgApp.MainButton.showProgress();
    try {
        await API.updateSettings({
            language: state.settingsForm.lang,
            notify_mode: state.settingsForm.notify_mode,
        });
        state.user.language = state.settingsForm.lang;
        state.user.notify_mode = state.settingsForm.notify_mode;
        state.lang = state.settingsForm.lang;
        window._appLang = state.lang;
        showToast(t('settings_saved'), 'success');
        navigate('routes');
    } catch (err) {
        showToast(err.message || t('error_save'), 'error');
    } finally {
        if (tgApp) tgApp.MainButton.hideProgress();
    }
}

/* ──────────────────────────────────────
   Settings option handlers (via delegation)
────────────────────────────────────── */
const _origHandleClick = handleClick;
document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const action = el.dataset.action;

    if (action === 'set-lang') {
        state.settingsForm.lang = el.dataset.value;
        window._appLang = el.dataset.value; // preview
        render();
    } else if (action === 'set-notify') {
        state.settingsForm.notify_mode = el.dataset.value;
        render();
    }
}, true); // capture phase so it runs before the per-render listeners

/* ──────────────────────────────────────
   Data loading
────────────────────────────────────── */
async function loadRoutes() {
    const data = await API.getRoutes();
    state.routes = data.routes || [];
}

async function loadUser() {
    const data = await API.getUser();
    state.user = data.user;
    state.lang = data.user.language || 'ru';
    window._appLang = state.lang;
}

/* ──────────────────────────────────────
   Confirm bottom sheet (replaces tg.showConfirm
   so buttons are always in the correct language)
────────────────────────────────────── */
function showConfirmSheet(message, onConfirm) {
    // Remove any existing sheet
    document.getElementById('confirm-sheet-overlay')?.remove();

    const overlay = document.createElement('div');
    overlay.id = 'confirm-sheet-overlay';
    overlay.className = 'confirm-overlay';
    overlay.innerHTML = `
        <div class="confirm-sheet">
            <div class="confirm-message">${esc(message)}</div>
            <button class="btn btn-danger" id="confirm-yes-btn">${t('yes')}</button>
            <button class="btn btn-secondary" id="confirm-no-btn">${t('cancel')}</button>
        </div>`;
    document.body.appendChild(overlay);

    document.getElementById('confirm-yes-btn').addEventListener('click', () => {
        overlay.remove();
        onConfirm();
    });
    document.getElementById('confirm-no-btn').addEventListener('click', () => {
        overlay.remove();
    });
    // Tap outside to dismiss
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.remove();
    });
}

/* ──────────────────────────────────────
   Toast notifications
────────────────────────────────────── */
function showToast(msg, type = '') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.textContent = msg;
    container.appendChild(el);
    setTimeout(() => el.remove(), 2800);
}

/* ──────────────────────────────────────
   Utility helpers
────────────────────────────────────── */
function esc(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function fmtTime(isoStr) {
    try {
        const d = new Date(isoStr);
        return d.toLocaleTimeString(state.lang === 'en' ? 'en-US' : 'ru-RU', { hour: '2-digit', minute: '2-digit' });
    } catch {
        return isoStr;
    }
}

function carIcon(type) {
    const s = (type || '').toLowerCase();
    if (s.includes('плацкарт') || s.includes('plackart')) return '🛏';
    if (s.includes('купе') || s.includes('kupe'))           return '🚪';
    if (s.includes('люкс') || s.includes('sv'))             return '💎';
    if (s.includes('сидяч') || s.includes('o\'rindiq'))     return '💺';
    return '🚃';
}

/* ──────────────────────────────────────
   App init
────────────────────────────────────── */
async function init() {
    // Setup Telegram Web App
    if (tgApp) {
        tgApp.ready();
        tgApp.expand();
    }

    // Show initial loading
    render();

    // Check API is configured
    if (!CONFIG.API_BASE_URL) {
        document.getElementById('app').innerHTML = `
        <div class="loading-screen" style="flex-direction:column;gap:16px;padding:32px;text-align:center">
            <div style="font-size:40px">⚙️</div>
            <div style="font-size:17px;font-weight:600">API not configured</div>
            <div style="font-size:14px;color:var(--hint)">Set CONFIG.API_BASE_URL in js/config.js</div>
        </div>`;
        return;
    }

    try {
        await Promise.all([loadUser(), loadRoutes()]);
        navigate('routes');
    } catch (err) {
        document.getElementById('app').innerHTML = `
        <div class="empty-state">
            <div class="empty-icon">⚠️</div>
            <div class="empty-title">${t('error_load')}</div>
            <div class="empty-sub">${esc(err.message)}</div>
            <button class="btn btn-primary" onclick="init()" style="margin-top:16px;max-width:200px">${'Retry'}</button>
        </div>`;
    }
}

// Start
init();
