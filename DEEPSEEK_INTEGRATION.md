# Интеграция DeepSeek API через Google Apps Script

Данный документ описывает, как настроить интеграцию с DeepSeek API через Google Apps Script, чтобы обеспечить безопасность API-ключа.

## Зачем это нужно?

Для обеспечения безопасности API-ключей, мы не можем использовать их напрямую в клиентском JavaScript-коде (из-за возможности доступа к ним со стороны клиента). Google Apps Script позволяет создать посредника между нашим фронтендом и DeepSeek API.

## Настройка Google Apps Script

1. Перейдите на сайт [Google Apps Script](https://script.google.com/)
2. Нажмите "New Project"
3. Замените содержимое файла `Code.gs` следующим кодом:

```javascript
// Глобальная переменная для хранения API-ключа DeepSeek
const DEEPSEEK_API_KEY = PropertiesService.getScriptProperties().getProperty('DEEPSEEK_API_KEY');

function doPost(e) {
  // Получаем тело запроса
  const jsonString = e.postData.getDataAsString();
  const requestData = JSON.parse(jsonString);
  
  const prompt = requestData.prompt;
  const endpoint = requestData.endpoint || 'testcase';
  
  if (!DEEPSEEK_API_KEY) {
    return ContentService
      .createTextOutput(JSON.stringify({error: "API-ключ DeepSeek не настроен"}))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  // Подготовка данных для запроса к DeepSeek API
  let requestBody;
  let model;
  
  // Выбираем модель в зависимости от типа задачи
  if (endpoint === 'bugreport') {
    model = 'deepseek-chat'; // или другая подходящая модель
  } else {
    model = 'deepseek-chat'; // или другая подходящая модель
  }
  
  requestBody = {
    model: model,
    messages: [
      {
        role: "user",
        content: prompt
      }
    ],
    stream: false
  };
  
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + DEEPSEEK_API_KEY
    },
    payload: JSON.stringify(requestBody)
  };
  
  try {
    const response = UrlFetchApp.fetch("https://api.deepseek.com/chat/completions", requestOptions);
    const responseText = response.getContentText();
    const responseData = JSON.parse(responseText);
    
    return ContentService
      .createTextOutput(JSON.stringify({result: responseData.choices[0].message.content}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    console.error("Error:", error);
    return ContentService
      .createTextOutput(JSON.stringify({error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Функция для установки API-ключа
function setApiKey(key) {
  PropertiesService.getScriptProperties().setProperty('DEEPSEEK_API_KEY', key);
  return "API-ключ успешно сохранен";
}

// GET функция для проверки работоспособности
function doGet() {
  return HtmlService.createHtmlOutput("<h1>DeepSeek Proxy API работает!</h1>");
}
```

4. Сохраните проект (Ctrl+S), придумав ему имя (например, "DeepSeekProxy")

## Настройка API-ключа

1. В Google Apps Script перейдите в меню "Edit" → "Project properties" → "Script properties"
2. Добавьте новое свойство с именем `DEEPSEEK_API_KEY` и вставьте ваш API-ключ DeepSeek в качестве значения

## Публикация скрипта

1. Нажмите "Deploy" → "New Deployment"
2. Назовите развертывание (например, "DeepSeek Proxy")
3. В поле "Description" добавьте описание
4. В поле "Type" выберите "Web app"
5. Нажмите "Deploy"
6. В появившемся окне:
   - "Execute as" выберите "Me"
   - "Who has access" выберите "Anyone"
   - Нажмите "Authorize Access" и пройдите процесс авторизации Google
7. Скопируйте предоставленный URL (он будет выглядеть как `https://script.google.com/macros/s/.../exec`)
8. Этот URL содержит ваш Script ID, который нужно ввести на странице [deepseek.html](./deepseek.html)

## Использование

1. Откройте файл [deepseek.html](./deepseek.html) в браузере
2. Введите скопированный Script ID в поле ввода
3. Нажмите "Сохранить"
4. Теперь вы можете использовать формы для генерации тест-кейсов и баг-репортов через DeepSeek API

## Безопасность

Поскольку Google Apps Script работает на стороне сервера, ваш API-ключ не будет виден клиенту. Однако, поскольку в нашем случае доступ к скрипту открыт "для всех", злоумышленник может использовать ваш скрипт, если узнает его ID. Для большей безопасности:

1. Ограничьте использование Google Apps Script в настройках развертывания (ограничьте доступ к своей учетной записи)
2. Рассмотрите возможность добавления дополнительной аутентификации
3. Мониторьте использование API

## Возможные проблемы

- Убедитесь, что ваш API-ключ DeepSeek действителен и имеет необходимые права
- Проверьте, что вы не превышаете лимиты на количество запросов
- Убедитесь, что ваш Google Apps Script развернут и доступен по сети