let score = 0;
let fishCaught = 0;
let level = 1;
let fishInCage = [];
let isFishing = false;
let isBite = false;
let bobberX = 0;
let bobberY = 0;
let bobberMaxDistance = 90; // Уменьшено на 90
let bobberSpeed = 2; // Скорость движения поплавка
let reelDifficulty = 5; // Сложность вытягивания
let currentReelEffort = 0;
let biteTimeout; // Переменная для хранения таймера клёва
let biteInterval; // Переменная для хранения интервала клёва
let shoreX = 250;  // Координата X для расположения берега
let shoreWidth = 50; // Ширина области, которая считается берегом


const rodImage = document.getElementById('rod');
const bobberImage = document.getElementById('bobber');
const progressBar = document.getElementById('progress-bar');
const levelText = document.getElementById('level-text');
const invisibleLine = document.getElementById('invisibleLine');

// Устанавливаем начальные координаты для поплавка
const rodX = rodImage.offsetLeft + rodImage.offsetWidth / 2;
const rodY = rodImage.offsetTop;

// Массив с рыбами
const fishTypes = [
    { name: 'Окунь', weightRange: [0.5, 2.5], pointsRange: [5, 8] },
    { name: 'Щука', weightRange: [1.0, 5.0], pointsRange: [7, 15] },
    { name: 'Карп', weightRange: [2.0, 6.0], pointsRange: [3, 12] },
    { name: 'Сом', weightRange: [3.0, 8.0], pointsRange: [12, 18] },
    { name: 'Треска', weightRange: [1.5, 4.5], pointsRange: [4, 7] },
    { name: 'Форель', weightRange: [0.8, 3.0], pointsRange: [20, 32] },
    { name: 'Судак', weightRange: [1.5, 4.0], pointsRange: [7, 15] }
];

// Задаем границы для поплавка
const bobberMinX = 50; // Минимальное значение X (отступ от левой границы)
const bobberMaxX = 300; // Максимальное значение X (отступ от правой границы)
const bobberInitialY = rodY - 90; // Фиксированное значение Y для поплавка

// Функция закидывания удочки
function castLine() {
    if (isFishing) return;

    isFishing = true;
    currentReelEffort = 0;
    document.getElementById('castBtn').disabled = true;
    document.getElementById('reelBtn').disabled = true; // Блокируем кнопку "Тянуть"
    document.getElementById('pullBtn').disabled = false; // Активируем кнопку "Вытащить"

    // Устанавливаем случайные позиции в пределах заданных границ
    const positionType = Math.floor(Math.random() * 3); // 0 - левая, 1 - правая, 2 - центр

    if (positionType === 0) {
        bobberX = bobberMinX + Math.random() * (bobberMaxX / 2 - bobberMinX);
    } else if (positionType === 1) {
        bobberX = bobberMaxX / 2 + Math.random() * (bobberMaxX - bobberMaxX / 2);
    } else {
        bobberX = (bobberMinX + bobberMaxX) / 2; // Центр
    }

    bobberY = bobberInitialY; // Устанавливаем фиксированную высоту для поплавка

    moveBobber(bobberX, bobberY);
    bobberImage.style.display = 'block'; // Показываем поплавок

    // Симуляция клёва через случайное время (от 10 секунд до 2 минут)
    const biteDelay = Math.random() * (120000 - 10000) + 10000; // Рандомное время клёва от 10 секунд до 2 минут

    biteTimeout = setTimeout(() => {
        isBite = true;
        document.getElementById('reelBtn').disabled = false; // Активируем кнопку "Тянуть"
        simulateBite();
    }, biteDelay); // Используем случайное время клёва
}

// Функция для остановки рыбалки
function stopFishing() {
    if (!isFishing) return; // Если не ловим, ничего не делаем

    isFishing = false;
    isBite = false;
    bobberImage.style.display = 'none'; // Скрываем поплавок
    document.getElementById('castBtn').disabled = false; // Разрешаем закидывать снова
    document.getElementById('reelBtn').disabled = true; // Блокируем кнопку "Тянуть"
    document.getElementById('pullBtn').disabled = true; // Блокируем кнопку "Вытащить"

    // Восстанавливаем состояние после остановки
    clearTimeout(biteTimeout); // Останавливаем таймер клёва
    clearInterval(biteInterval); // Останавливаем клёв (если это возможно)
    bobberY = bobberInitialY; // Возвращаем поплавок на начальную высоту
    moveBobber(bobberX, bobberY); // Перемещаем поплавок
}

// Симуляция клёва
function simulateBite() {
    if (!isBite) return;

    let direction = 1;
    biteInterval = setInterval(() => {
        moveBobber(bobberX, bobberY + direction * 5);
        direction *= -1;
    }, 100); // Заменено на 100 мс для более быстрой анимации

    // Через 5 секунд рыба сорвётся, если не потянуть
    setTimeout(() => {
        clearInterval(biteInterval);
        if (isBite) {
            showFishEscapedModal(); // Показываем модальное окно "рыба сорвалась"
        }
    }, 5000);
}

// Функция для показа окна "рыба сорвалась"
function showFishEscapedModal() {
    const modal = document.getElementById('fishEscapedModal');
    modal.style.display = 'block';
}

// Функция для закрытия окна
function closeFishEscapedModal() {
    const modal = document.getElementById('fishEscapedModal');
    modal.style.display = 'none';
    resetFishing();
}

// Изменение логики в reelFish
function reelFish() {
    if (!isBite || currentReelEffort >= reelDifficulty) return;

    currentReelEffort++;

    const gameAreaHeight = document.querySelector('.game-area').offsetHeight;
    bobberY += bobberSpeed;

    if (bobberY >= gameAreaHeight - 30) {
        bobberY = gameAreaHeight - 30; // Коррекция y-координаты
        checkForCatch();
        return;
    }

    if (currentReelEffort >= reelDifficulty) {
        catchFish();
    } else {
        bobberY += 10; // Если не достигли сложности, поплавок немного отдаляется
    }

    moveBobber(bobberX, bobberY);
}

// Проверка на ловлю
function checkForCatch() {
    if (isBite) {
        catchFish();
    }
}

// Функция для ловли рыбы
function catchFish() {
    isFishing = false;
    isBite = false;
    bobberImage.style.display = 'none'; // Скрываем поплавок
    document.getElementById('castBtn').disabled = false; // Разрешаем закидывать снова
    document.getElementById('reelBtn').disabled = true; // Блокируем кнопку "Тянуть"
    document.getElementById('pullBtn').disabled = true; // Блокируем кнопку "Вытащить"

    // Выбор случайной рыбы
    const fishIndex = Math.floor(Math.random() * fishTypes.length);
    const fish = fishTypes[fishIndex];

    // Генерация случайного веса и очков
    const weight = (Math.random() * (fish.weightRange[1] - fish.weightRange[0]) + fish.weightRange[0]).toFixed(2); // Вес с двумя знаками после запятой
    const points = Math.floor(Math.random() * (fish.pointsRange[1] - fish.pointsRange[0] + 1)) + fish.pointsRange[0];

    // Добавляем очки
    score += points;
    fishCaught++;

    // Обновляем счет и уровень
    document.getElementById('score').innerText = score;
    document.getElementById('playerScore').innerText = score;
    document.getElementById('fishCaught').innerText = fishCaught;

    // Показать информацию о пойманной рыбе
    document.getElementById('caughtFishDetails').innerText = `Вы поймали ${fish.name} весом ${weight} кг. Прибыль ${points} очков.`;
    document.getElementById('caughtFishModal').style.display = 'block';

    // Проверка на уровень
    checkLevelUp();

    // Добавляем рыбу в садок
    addFishToCage(fish, weight, points);

    // Обновляем уровень
    updateLevel();
}
// Проверка уровня
function checkLevelUp() {
    if (score >= level * 20) { // Например, 20 очков на уровень
        level++;
        levelText.innerText = `Уровень ${level}`;
        progressBar.style.width = `${(score / (level * 20)) * 100}%`; // Обновляем прогресс бар
        progressBar.style.backgroundColor = 'green'; // Увеличиваем цвет
    }
}

// Движение поплавка
function moveBobber(x, y) {
    bobberImage.style.left = `${x}px`;
    bobberImage.style.top = `${y}px`;
}

// Закрыть модальное окно
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Закрытие модального окна пойманной рыбы
function closeCaughtFishModal() {
    document.getElementById('caughtFishModal').style.display = 'none';
    resetFishing(); // Сброс игры к состоянию готовности к следующему закидыванию
}

// Сброс состояния рыбалки
function resetFishing() {
    isFishing = false;
    isBite = false;
    bobberImage.style.display = 'none'; // Скрыть поплавок
    document.getElementById('castBtn').disabled = false; // Разрешить закинуть снова
    document.getElementById('reelBtn').disabled = true; // Заблокировать тянуть
    document.getElementById('pullBtn').disabled = true; // Заблокировать вытащить
}

// Показать профиль игрока
function showProfile() {
    document.getElementById('profileModal').style.display = 'flex';
    document.getElementById('playerScore').innerText = score;
    document.getElementById('fishCaught').innerText = fishCaught;
}

// Показать садок
function showCage() {
    const cageContent = document.getElementById('cageContent');
    cageContent.innerHTML = ''; // Очищаем содержимое

    fishInCage.forEach(fish => {
        const fishInfo = document.createElement('div');
        fishInfo.innerText = `${fish.name}, вес: ${fish.weight} кг, очки: ${fish.points}`;
        cageContent.appendChild(fishInfo);
    });

    document.getElementById('cageModal').style.display = 'flex';
}

// Обновляем уровни и прогресс
function updateLevel() {
    const progress = Math.min(score / 100, 1); // Максимум 100 очков на уровень
    progressBar.style.width = `${progress * 100}%`; // Установка ширины прогресс-бара

    // Обновление уровня
    if (progress === 1) {
        level++;
        score = 0; // Сбросить очки для следующего уровня
        progressBar.style.width = '0%'; // Сброс прогресс-бара
    }
    levelText.innerText = `Уровень ${level}`;
}

// Обновляем функцию добавления рыбы в садок
function addFishToCage(fish, weight, points) {
    const fishInCageItem = {
        name: fish.name,
        weight: weight,
        points: points
    };
    fishInCage.push(fishInCageItem);
    const cageContent = document.getElementById('cageContent');
    cageContent.innerHTML += `<p>${fishInCageItem.name}, вес: ${fishInCageItem.weight} кг, очки: ${fishInCageItem.points}</p>`;
}

function checkIfBobberTouchesShore() {
    const bobberLeft = bobberX - bobberImage.offsetWidth / 2;
    const bobberRight = bobberX + bobberImage.offsetWidth / 2;

    if (bobberRight > shoreX && bobberLeft < shoreX + shoreWidth) {
        showShoreTouchModal(); // Показать окно при касании берега
    }
}

function showShoreTouchModal() {
    const modal = document.getElementById('shoreTouchModal');
    modal.style.display = 'block';
}

function closeShoreTouchModal() {
    const modal = document.getElementById('shoreTouchModal');
    modal.style.display = 'none';
}

function moveBobber(x, y) {
    bobberImage.style.left = `${x}px`;
    bobberImage.style.top = `${y}px`;

    checkIfBobberTouchesShore(); // Проверяем касание берега при перемещении
}



