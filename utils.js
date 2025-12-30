// Утилиты для QA Assistant

// Конфигурация по умолчанию
const DEFAULT_CONFIG = {
    openai: {
        apiUrl: 'https://api.openai.com/v1/chat/completions',
        headers: {
            'Content-Type': 'application/json',
        }
    },
    anthropic: {
        apiUrl: 'https://api.anthropic.com/v1/messages',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': '',
            'anthropic-version': '2023-06-01'
        }
    },
    google: {
        apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
        headers: {
            'Content-Type': 'application/json',
        }
    }
};

/**
 * Функция для форматирования тест-кейса
 * @param {string} id - ID тест-кейса
 * @param {string} name - Название тест-кейса
 * @param {string} precondition - Предусловия
 * @param {string} steps - Шаги выполнения
 * @param {string} expectedResult - Ожидаемый результат
 * @returns {string} Форматированный тест-кейс
 */
function formatTestCase(id, name, precondition, steps, expectedResult) {
    return `ID: ${id}
Название: ${name}
Предусловия: ${precondition}
Шаги: 
${steps}
Ожидаемый результат: ${expectedResult}`;
}

/**
 * Функция для форматирования баг-репорта
 * @param {string} id - ID баг-репорта
 * @param {string} title - Заголовок
 * @param {string} description - Описание
 * @param {string} steps - Шаги воспроизведения
 * @param {string} expected - Ожидаемый результат
 * @param {string} actual - Фактический результат
 * @param {string} priority - Приоритет
 * @param {string} severity - Серьезность
 * @returns {string} Форматированный баг-репорт
 */
function formatBugReport(id, title, description, steps, expected, actual, priority, severity) {
    return `ID: ${id}
Заголовок: ${title}
Описание: ${description}
Шаги воспроизведения:
${steps}
Ожидаемый результат: ${expected}
Фактический результат: ${actual}
Приоритет: ${priority}
Серьезность: ${severity}`;
}

/**
 * Проверка валидности API-ключа (упрощенная проверка)
 * @param {string} apiKey - API-ключ для проверки
 * @param {string} provider - Провайдер ИИ (openai, anthropic, google)
 * @returns {boolean} Валиден ли ключ
 */
function validateApiKey(apiKey, provider) {
    if (!apiKey || typeof apiKey !== 'string') {
        return false;
    }
    
    // Для OpenAI ключ обычно начинается с "sk-"
    if (provider === 'openai') {
        return apiKey.startsWith('sk-') && apiKey.length > 20;
    }
    
    // Для Anthropic - без специфичных требований
    if (provider === 'anthropic') {
        return apiKey.length > 5;
    }
    
    // Для Google - может быть просто строка или ключ определенного формата
    if (provider === 'google') {
        return apiKey.length > 5;
    }
    
    return true;
}

/**
 * Экспорт функций для использования в основном скрипте
 */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DEFAULT_CONFIG,
        formatTestCase,
        formatBugReport,
        validateApiKey
    };
}