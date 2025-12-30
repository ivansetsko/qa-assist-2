// Конфигурация для DeepSeek версии
let SCRIPT_ID = localStorage.getItem('deepSeekScriptId') || '';

// DOM элементы
const scriptIdInput = document.getElementById('scriptId');
const saveScriptIdBtn = document.getElementById('saveScriptId');
const testCasePrompt = document.getElementById('testCasePrompt');
const generateTestCaseBtn = document.getElementById('generateTestCase');
const testCaseResult = document.getElementById('testCaseResult');
const bugReportPrompt = document.getElementById('bugReportPrompt');
const generateBugReportBtn = document.getElementById('generateBugReport');
const bugReportResult = document.getElementById('bugReportResult');

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Загрузка сохраненного Script ID
    if (SCRIPT_ID) {
        scriptIdInput.value = SCRIPT_ID;
    }
    
    // Обработчики событий
    saveScriptIdBtn.addEventListener('click', saveScriptId);
    generateTestCaseBtn.addEventListener('click', generateTestCaseWithDeepSeek);
    generateBugReportBtn.addEventListener('click', generateBugReportWithDeepSeek);
});

// Функция для сохранения Script ID
function saveScriptId() {
    SCRIPT_ID = scriptIdInput.value.trim();
    if (SCRIPT_ID) {
        localStorage.setItem('deepSeekScriptId', SCRIPT_ID);
        alert('ID скрипта сохранен!');
    } else {
        alert('Пожалуйста, введите действительный ID скрипта Google Apps Script');
    }
}

// Функция для генерации тест-кейсов с использованием DeepSeek
async function generateTestCaseWithDeepSeek() {
    const prompt = testCasePrompt.value.trim();
    
    if (!prompt) {
        alert('Пожалуйста, введите описание для генерации тест-кейсов');
        return;
    }
    
    if (!SCRIPT_ID) {
        alert('Пожалуйста, введите и сохраните ID вашего Google Apps Script');
        return;
    }
    
    // Показываем индикатор загрузки
    testCaseResult.classList.add('loading');
    testCaseResult.textContent = 'Генерация тест-кейсов с помощью DeepSeek...';
    
    try {
        const fullPrompt = `Напиши подробные тест-кейсы для следующего функционала: ${prompt}\n\nТест-кейс должен содержать: ID, название, предусловия, шаги, ожидаемый результат.`;
        
        const response = await sendToDeepSeekGAS({
            prompt: fullPrompt,
            endpoint: 'testcase'
        });
        
        testCaseResult.classList.remove('loading');
        testCaseResult.textContent = response;
    } catch (error) {
        testCaseResult.classList.remove('loading');
        testCaseResult.textContent = `Ошибка: ${error.message}`;
        console.error('Ошибка при генерации тест-кейсов:', error);
    }
}

// Функция для генерации баг-репортов с использованием DeepSeek
async function generateBugReportWithDeepSeek() {
    const prompt = bugReportPrompt.value.trim();
    
    if (!prompt) {
        alert('Пожалуйста, опишите проблему для создания баг-репорта');
        return;
    }
    
    if (!SCRIPT_ID) {
        alert('Пожалуйста, введите и сохраните ID вашего Google Apps Script');
        return;
    }
    
    // Показываем индикатор загрузки
    bugReportResult.classList.add('loading');
    bugReportResult.textContent = 'Создание баг-репорта с помощью DeepSeek...';
    
    try {
        const fullPrompt = `Создай подробный баг-репорт для следующей проблемы: ${prompt}\n\nБаг-репорт должен содержать: ID, заголовок, описание, шаги воспроизведения, ожидаемый результат, фактический результат, приоритет, серьезность.`;
        
        const response = await sendToDeepSeekGAS({
            prompt: fullPrompt,
            endpoint: 'bugreport'
        });
        
        bugReportResult.classList.remove('loading');
        bugReportResult.textContent = response;
    } catch (error) {
        bugReportResult.classList.remove('loading');
        bugReportResult.textContent = `Ошибка: ${error.message}`;
        console.error('Ошибка при создании баг-репорта:', error);
    }
}

// Функция для отправки запроса к DeepSeek через Google Apps Script
async function sendToDeepSeekGAS(data) {
    // URL для вызова Google Apps Script
    const url = `https://script.google.com/macros/s/${SCRIPT_ID}/exec`;
    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            prompt: data.prompt,
            endpoint: data.endpoint
        })
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `Ошибка Google Apps Script: ${response.status}`);
    }
    
    const responseData = await response.json();
    
    if (responseData.error) {
        throw new Error(responseData.error);
    }
    
    return responseData.result || responseData.choices?.[0]?.message?.content || "Нет ответа от API";
}