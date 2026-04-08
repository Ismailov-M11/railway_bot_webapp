const TRANSLATIONS = {
    ru: {
        // Navigation
        app_title: 'ЖД Билеты',
        my_routes: 'Мои маршруты',
        add_route: 'Добавить маршрут',
        settings: 'Настройки',
        back: 'Назад',
        save: 'Сохранить',
        cancel: 'Отмена',
        delete: 'Удалить',
        edit: 'Изменить',
        check: 'Проверить',
        check_all: 'Проверить все',
        next: 'Далее',
        yes: 'Да',
        no: 'Нет',

        // Routes list
        no_routes: 'У вас нет маршрутов.\nНажмите «+», чтобы добавить.',
        routes_count: (n) => `${n} маршрут${n === 1 ? '' : n < 5 ? 'а' : 'ов'}`,
        route_n: (n) => `Маршрут №${n}`,

        // Add route form
        step_from: 'Откуда',
        step_to: 'Куда',
        step_date: 'Дата',
        enter_from: 'Введите город отправления',
        enter_to: 'Введите город назначения',
        enter_date: 'Выберите дату поездки',
        search_placeholder: 'Начните вводить название...',
        searching: 'Поиск...',
        no_stations: 'Ничего не найдено',
        date_past: 'Дата уже прошла',
        date_required: 'Выберите дату',
        station_required: 'Выберите станцию из списка',
        max_routes: 'Достигнут лимит маршрутов (5)',
        route_saved: 'Маршрут сохранён',
        route_updated: 'Маршрут обновлён',
        route_deleted: 'Маршрут удалён',
        confirm_delete: 'Удалить этот маршрут?',

        // Route detail
        travel_date: 'Дата поездки',
        last_check: 'Последняя проверка',
        not_checked: 'Ещё не проверялся',
        checking: 'Проверяю…',
        tickets_available: '✅ Билеты есть',
        tickets_none: '❌ Билетов нет',
        notif_count: (n) => `Уведомлений отправлено: ${n}`,

        // Check results
        train_number: 'Поезд',
        departure: '🟢 Отбытие',
        arrival: '🔴 Прибытие',
        travel_time: '⏳ Время в пути',
        seats_up: 'Верхние',
        seats_down: 'Нижние',
        seats_lat_up: 'Боковые верхние',
        seats_lat_dn: 'Боковые нижние',
        seats_word: 'мест',
        currency: 'сум',

        // Settings
        language: 'Язык',
        notifications: 'Тип уведомлений',
        notify_always: 'Каждые 30 минут',
        notify_on_available: 'Только при появлении билетов',
        settings_saved: 'Настройки сохранены',

        // Errors
        error_load: 'Не удалось загрузить данные',
        error_save: 'Не удалось сохранить',
        error_check: 'Ошибка проверки',
        error_api: 'Ошибка соединения',
        error_generic: 'Что-то пошло не так',

        // Months
        months: ['', 'янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'],
        months_full: ['', 'Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня', 'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'],
    },
    uz: {
        app_title: 'Temir yo\'l chiptalari',
        my_routes: 'Mening yo\'nalishlarim',
        add_route: 'Yo\'nalish qo\'shish',
        settings: 'Sozlamalar',
        back: 'Orqaga',
        save: 'Saqlash',
        cancel: 'Bekor qilish',
        delete: 'O\'chirish',
        edit: 'O\'zgartirish',
        check: 'Tekshirish',
        check_all: 'Barchasini tekshirish',
        next: 'Keyingisi',
        yes: 'Ha',
        no: 'Yo\'q',

        no_routes: 'Yo\'nalishlar yo\'q.\n«+» tugmasini bosing.',
        routes_count: (n) => `${n} ta yo\'nalish`,
        route_n: (n) => `Yo\'nalish №${n}`,

        step_from: 'Qayerdan',
        step_to: 'Qayerga',
        step_date: 'Sana',
        enter_from: 'Jo\'nab ketish shahrini kiriting',
        enter_to: 'Manzil shahrini kiriting',
        enter_date: 'Sayohat sanasini tanlang',
        search_placeholder: 'Nom kiritishni boshlang...',
        searching: 'Qidirmoqda...',
        no_stations: 'Hech narsa topilmadi',
        date_past: 'Sana o\'tib ketgan',
        date_required: 'Sanani tanlang',
        station_required: 'Ro\'yxatdan stansiyani tanlang',
        max_routes: 'Yo\'nalishlar chegarasiga yetildi (5)',
        route_saved: 'Yo\'nalish saqlandi',
        route_updated: 'Yo\'nalish yangilandi',
        route_deleted: 'Yo\'nalish o\'chirildi',
        confirm_delete: 'Bu yo\'nalishni o\'chirishni xohlaysizmi?',

        travel_date: 'Sayohat sanasi',
        last_check: 'Oxirgi tekshiruv',
        not_checked: 'Hali tekshirilmagan',
        checking: 'Tekshiryapman…',
        tickets_available: '✅ Bilet bor',
        tickets_none: '❌ Bilet yo\'q',
        notif_count: (n) => `Yuborilgan bildirishnomalar: ${n}`,

        train_number: 'Poyezd',
        departure: '🟢 Jo\'nash',
        arrival: '🔴 Yetib borish',
        travel_time: '⏳ Yo\'l vaqti',
        seats_up: 'Yuqori',
        seats_down: 'Past',
        seats_lat_up: 'Yon yuqori',
        seats_lat_dn: 'Yon past',
        seats_word: 'ta',
        currency: 'so\'m',

        language: 'Til',
        notifications: 'Bildirishnoma turi',
        notify_always: 'Har 30 daqiqada',
        notify_on_available: 'Faqat bilet paydo bo\'lsa',
        settings_saved: 'Sozlamalar saqlandi',

        error_load: 'Ma\'lumotlarni yuklab bo\'lmadi',
        error_save: 'Saqlab bo\'lmadi',
        error_check: 'Tekshiruv xatosi',
        error_api: 'Ulanish xatosi',
        error_generic: 'Nimadir xato ketdi',

        months: ['', 'yan', 'fev', 'mar', 'apr', 'may', 'iyun', 'iyul', 'avg', 'sen', 'okt', 'noy', 'dek'],
        months_full: ['', 'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'],
    },
    en: {
        app_title: 'Railway Tickets',
        my_routes: 'My Routes',
        add_route: 'Add Route',
        settings: 'Settings',
        back: 'Back',
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        check: 'Check',
        check_all: 'Check All',
        next: 'Next',
        yes: 'Yes',
        no: 'No',

        no_routes: 'No routes yet.\nTap «+» to add one.',
        routes_count: (n) => `${n} route${n === 1 ? '' : 's'}`,
        route_n: (n) => `Route #${n}`,

        step_from: 'From',
        step_to: 'To',
        step_date: 'Date',
        enter_from: 'Enter departure city',
        enter_to: 'Enter destination city',
        enter_date: 'Select travel date',
        search_placeholder: 'Start typing a name...',
        searching: 'Searching...',
        no_stations: 'Nothing found',
        date_past: 'Date has already passed',
        date_required: 'Please select a date',
        station_required: 'Please select a station from the list',
        max_routes: 'Route limit reached (5)',
        route_saved: 'Route saved',
        route_updated: 'Route updated',
        route_deleted: 'Route deleted',
        confirm_delete: 'Delete this route?',

        travel_date: 'Travel date',
        last_check: 'Last checked',
        not_checked: 'Not checked yet',
        checking: 'Checking…',
        tickets_available: '✅ Tickets available',
        tickets_none: '❌ No tickets',
        notif_count: (n) => `Notifications sent: ${n}`,

        train_number: 'Train',
        departure: '🟢 Departure',
        arrival: '🔴 Arrival',
        travel_time: '⏳ Travel time',
        seats_up: 'Upper',
        seats_down: 'Lower',
        seats_lat_up: 'Lat. Upper',
        seats_lat_dn: 'Lat. Lower',
        seats_word: 'seats',
        currency: 'UZS',

        language: 'Language',
        notifications: 'Notification mode',
        notify_always: 'Every 30 minutes',
        notify_on_available: 'Only when tickets appear',
        settings_saved: 'Settings saved',

        error_load: 'Failed to load data',
        error_save: 'Failed to save',
        error_check: 'Check failed',
        error_api: 'Connection error',
        error_generic: 'Something went wrong',

        months: ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        months_full: ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    },
};

function t(key, ...args) {
    const lang = window._appLang || 'ru';
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.ru;
    const val = dict[key] !== undefined ? dict[key] : (TRANSLATIONS.ru[key] || key);
    if (typeof val === 'function') return val(...args);
    return val;
}

function fmtDate(dateStr, lang) {
    // dateStr = YYYY-MM-DD
    try {
        const [y, m, d] = dateStr.split('-').map(Number);
        const dict = TRANSLATIONS[lang] || TRANSLATIONS.ru;
        const mName = dict.months_full[m] || m;
        return `${d} ${mName} ${y}`;
    } catch {
        return dateStr;
    }
}
