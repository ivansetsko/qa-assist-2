// Загрузка конфигурации
fetch('config.json')
    .then(response => response.json())
    .then(config => {
        window.appConfig = config;
    })
    .catch(error => {
        console.error('Ошибка загрузки конфигурации:', error);
        // Используем базовую конфигурацию по умолчанию
        window.appConfig = {
            apiConfig: {
                defaultProvider: 'openai',
                defaultModel: 'gpt-3.5-turbo',
                maxTokens: 1000,
                temperature: 0.7
            },
            features: {
                testCaseGenerator: {
                    enabled: true,
                    promptTemplate: "Напиши подробные тест-кейсы для следующего функционала: {prompt}\n\nТест-кейс должен содержать: ID, название, предусловия, шаги, ожидаемый результат."
                },
                bugReportGenerator: {
                    enabled: true,
                    promptTemplate: "Создай подробный баг-репорт для следующей проблемы: {prompt}\n\nБаг-репорт должен содержать: ID, заголовок, описание, шаги воспроизведения, ожидаемый результат, фактический результат, приоритет, серьезность."
                }
            }
        };
    });

// Конфигурация API
let API_KEY = localStorage.getItem('qaApiKey') || '';
const API_BASE_URL = 'https://api.openai.com/v1'; // Используем OpenAI API как пример

// DOM элементы
const apiKeyInput = document.getElementById('apiKey');
const saveApiKeyBtn = document.getElementById('saveApiKey');
const testCasePrompt = document.getElementById('testCasePrompt');
const generateTestCaseBtn = document.getElementById('generateTestCase');
const testCaseResult = document.getElementById('testCaseResult');
const bugReportPrompt = document.getElementById('bugReportPrompt');
const generateBugReportBtn = document.getElementById('generateBugReport');
const bugReportResult = document.getElementById('bugReportResult');

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Загрузка сохраненного API ключа
    if (API_KEY) {
        apiKeyInput.value = API_KEY;
    }
    
    // Обработчики событий
    saveApiKeyBtn.addEventListener('click', saveApiKey);
    generateTestCaseBtn.addEventListener('click', generateTestCase);
    generateBugReportBtn.addEventListener('click', generateBugReport);
});

// Функция для сохранения API ключа
function saveApiKey() {
    const newApiKey = apiKeyInput.value.trim();
    
    // Простая проверка валидности API ключа
    if (validateApiKey(newApiKey, window.appConfig?.apiConfig.defaultProvider || 'openai')) {
        API_KEY = newApiKey;
        localStorage.setItem('qaApiKey', API_KEY);
        alert('API ключ успешно сохранен!');
    } else {
        alert('Пожалуйста, введите действительный API ключ');
    }
}

// Функция для генерации тест-кейсов
async function generateTestCase() {
    const prompt = testCasePrompt.value.trim();
    
    if (!prompt) {
        alert('Пожалуйста, введите описание для генерации тест-кейсов');
        return;
    }
    
    if (!API_KEY) {
        alert('Пожалуйста, введите и сохраните ваш API ключ');
        return;
    }
    
    // Проверяем, включена ли функция генерации тест-кейсов
    if (!window.appConfig?.features?.testCaseGenerator?.enabled) {
        testCaseResult.textContent = 'Функция генерации тест-кейсов временно отключена';
        return;
    }
    
    // Показываем индикатор загрузки
    testCaseResult.classList.add('loading');
    testCaseResult.textContent = 'Генерация тест-кейсов...';
    
    try {
        // Подставляем пользовательский промт в шаблон
        const template = window.appConfig?.features?.testCaseGenerator?.promptTemplate || 
            "Напиши подробные тест-кейсы для следующего функционала: {prompt}\n\nТест-кейс должен содержать: ID, название, предусловия, шаги, ожидаемый результат.";
        const fullPrompt = template.replace('{prompt}', prompt);
        
        const response = await sendToAI({
            prompt: fullPrompt
        });
        
        testCaseResult.classList.remove('loading');
        testCaseResult.textContent = response;
    } catch (error) {
        testCaseResult.classList.remove('loading');
        testCaseResult.textContent = `Ошибка: ${error.message}`;
        console.error('Ошибка при генерации тест-кейсов:', error);
    }
}

// Функция для генерации баг-репортов
async function generateBugReport() {
    const prompt = bugReportPrompt.value.trim();
    
    if (!prompt) {
        alert('Пожалуйста, опишите проблему для создания баг-репорта');
        return;
    }
    
    if (!API_KEY) {
        alert('Пожалуйста, введите и сохраните ваш API ключ');
        return;
    }
    
    // Проверяем, включена ли функция генерации баг-репортов
    if (!window.appConfig?.features?.bugReportGenerator?.enabled) {
        bugReportResult.textContent = 'Функция генерации баг-репортов временно отключена';
        return;
    }
    
    // Показываем индикатор загрузки
    bugReportResult.classList.add('loading');
    bugReportResult.textContent = 'Создание баг-репорта...';
    
    try {
        // Подставляем пользовательский промт в шаблон
        const template = window.appConfig?.features?.bugReportGenerator?.promptTemplate || 
            "Создай подробный баг-репорт для следующей проблемы: {prompt}\n\nБаг-репорт должен содержать: ID, заголовок, описание, шаги воспроизведения, ожидаемый результат, фактический результат, приоритет, серьезность.";
        const fullPrompt = template.replace('{prompt}', prompt);
        
        const response = await sendToAI({
            prompt: fullPrompt
        });
        
        bugReportResult.classList.remove('loading');
        bugReportResult.textContent = response;
    } catch (error) {
        bugReportResult.classList.remove('loading');
        bugReportResult.textContent = `Ошибка: ${error.message}`;
        console.error('Ошибка при создании баг-репорта:', error);
    }
}

// Функция для отправки запроса к ИИ API
async function sendToAI(data) {
    // Используем OpenAI API как пример
    const response = await fetch(`${API_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            model: window.appConfig?.apiConfig?.defaultModel || 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: data.prompt }],
            max_tokens: window.appConfig?.apiConfig?.maxTokens || 1000,
            temperature: window.appConfig?.apiConfig?.temperature || 0.7
        })
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `Ошибка API: ${response.status}`);
    }
    
    const responseData = await response.json();
    return responseData.choices[0].message.content.trim();
}

// Функция для проверки валидности API-ключа
function validateApiKey(apiKey, provider) {
    if (!apiKey || typeof apiKey !== 'string') {
        return false;
    }
    
    // Для OpenAI ключ обычно начинается с "sk-"
    if (provider === 'openai') {
        return apiKey.startsWith('sk-') && apiKey.length > 20;
    }
    
    // Для других провайдеров можно добавить проверки
    
    return true;
}