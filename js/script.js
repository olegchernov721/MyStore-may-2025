`use strict`

// После загрузки страницы

// После загрузки страницы

document.addEventListener("DOMContentLoaded", function (e) {

    const filterContainer = document.querySelector(".product-section__filter");
    // Категории (кнопки)
    const categoryContainer = document.querySelector(".product-section__filter-category-wrapper");
    const categoryButtons = document.querySelectorAll('.filters-category-btn');

    // Инпуты цены
    const quickPriceContainer = document.querySelector(".filter__price-quick-wrapper");
    const allQuickPriceBtn = document.querySelectorAll(".filter__price-quick-wrapper-btn");
    const priceMinInput = document.querySelector('#filter-price-min');
    const priceMaxInput = document.querySelector('#filter-price-max');
    const resetPricesInputs = document.querySelector(".filter__price-form-btn");
    const priceForm = document.querySelector('.filter__price-form');

    // Чекбоксы брендов
    const brandCheckboxesContainer = document.querySelector('.filter__brands-list');

    // Чекбоксы цветов
    const colorCheckboxes = document.querySelectorAll('.filter__color-list input[type="checkbox"]');

    // Контейнер карточек
    const productsContainer = document.querySelector('.product-section__wrapper');

    // Кнопка "Показать ещё" (если будешь реализовывать)
    const showMoreBtn = document.querySelector('.product-section__btn-show-more');


// Объект, в котором хранятся текущие параметры фильтрации, выбранные пользователем
let objFilter = {
    category: [],  
    brands: [],       
    priceMin: null,  
    priceMax: null   
};

// Флаг, указывающий, был ли уже применён фильтр
// Используется для управления логикой отображения отфильтрованных товаров
let flagFilter = false;


class ProductManager {
    // Хранит все загруженные товары (до фильтрации)
    allProduct = [];

    constructor() {
        // При создании экземпляра класса сразу загружаем товары
        this.loadProducts();
    }

    // Загружает товары с API по заданным категориям
    async loadProducts() {
        // Категории товаров, которые нужно загрузить
        const categories = [
            'womens-dresses',
            'womens-shoes',
            'womens-watches',
            'womens-bags',
            'tops',
            'mens-shirts',
            'mens-shoes',
            'mens-watches',
            'smartphones',
            'laptops',
            'lighting'
        ];

        // Массив промисов fetch-запросов для каждой категории
        const fetchPromises = categories.map(category => {
            return fetch(`https://dummyjson.com/products/category/${category}`)
                .then(response => {
                    if (!response.ok) {
                        // Если запрос неудачный, выбрасываем ошибку
                        throw new Error('Ошибка сети: ' + response.status);
                    }
                    return response.json(); // Преобразуем ответ в JSON
                })
                .then(data => data.products) // Получаем только массив товаров
                .catch(error => {
                    console.error('Произошла ошибка: ', error.message);
                    return []; // В случае ошибки возвращаем пустой массив, чтобы не прерывать цепочку
                });
        });

        // Ждём завершения всех запросов и объединяем массивы товаров
        this.allProduct = await Promise.all(fetchPromises).then(products => products.flat());

        // Если фильтрация ещё не применялась, сразу рендерим все товары
        if (!flagFilter) {
            this.renderProducts(this.allProduct);
        }
    }

    // Применяет фильтрацию по переданному объекту objFilter
    allFilters(objFilter, flagF) {
        if (flagF && objFilter) {
            // Фильтрация массива по категориям, брендам и цене
            const productsFilters = this.allProduct.filter((prod) => {
                const filterCategory = objFilter.category.length === 0 || objFilter.category.includes(prod.category);
                const filterBrands = objFilter.brands.length === 0 || objFilter.brands.includes(prod.brand);
                const filterMinPrice = !objFilter.priceMin || prod.price >= objFilter.priceMin;
                const filterMaxPrice = !objFilter.priceMax || prod.price <= objFilter.priceMax;

                return filterCategory && filterBrands && filterMinPrice && filterMaxPrice;
            });

            // Очищаем контейнер и отображаем отфильтрованные товары
            productsContainer.innerHTML = "";
            this.renderProducts(productsFilters);
        }
    }

    // Отображает список карточек товаров
    renderProducts(products) {
        products.forEach(function (prod) {
            const html = `
                <div class="product-section__wrapper-card product-card" id="${prod.id}">
                    <div class="product-card__top">
                        <img class="product-card__top-img" src="${prod.images[0]}" alt="">
                    </div>
                    <div class="product-card__top-content">
                        <div class="product-card__detail">
                            <a href="product-detail.html">${prod.title}</a>
                        </div>
                        <div class="product-card__price">${Math.round(prod.price * 90)} ₽уб</div>
                        <button class="product-card__btn-add-to-cart">В корзину</button>
                        <div class="product-card__hover">
                            <div class="product-card__preview-description">${prod.description}</div>
                        </div>
                    </div>
                </div>
            `;

            // Вставляем карточку в контейнер с товарами (в начало)
            productsContainer.insertAdjacentHTML("afterbegin", html);
        });
    }
}


   class FilterManager {
    constructor(productManager) {
        // Сохраняем ссылку на экземпляр ProductManager, чтобы вызывать отбор товаров
        this.productManager = productManager;

        // Назначаем обработчики событий на контейнеры фильтров
        filterContainer.addEventListener("click", this.getActiveCategory.bind(this));
        brandCheckboxesContainer.addEventListener("change", this.changeBrandCheckboxes.bind(this));
        priceMinInput.addEventListener("input", this.getPriceFilter.bind(this));
        priceMaxInput.addEventListener("input", this.getPriceFilter.bind(this));
        resetPricesInputs.addEventListener("click", this.resetPricesInputsForm.bind(this));
        quickPriceContainer.addEventListener("click", this.quickPricesForm.bind(this));
    }

    // === Обработка фильтрации по брендам ===
    changeBrandCheckboxes(e) {
        const value = e.target.value;
        if (!value) return;

        // Если бренд не выбран — добавляем его в начало массива
        if (!objFilter.brands.includes(value)) {
            objFilter.brands.unshift(value);
        } else {
            // Если выбран — убираем
            objFilter.brands = objFilter.brands.filter(elem => elem !== value);
        }

        flagFilter = true;
        this.productManager.allFilters(objFilter, flagFilter);
    }

    // === Обработка клика по кнопкам категорий ===
    getActiveCategory(e) {
        const target = e.target;

        if (target.classList.contains("filters-category-btn")) {
            const category = target.dataset.category;

            // Добавляем или удаляем категорию из фильтра
            if (!objFilter.category.includes(category)) {
                objFilter.category.unshift(category);
                target.classList.add("filters-btn_active");
            } else {
                objFilter.category = objFilter.category.filter(elem => elem !== category);
                target.classList.remove("filters-btn_active");
            }

            flagFilter = true;
            this.productManager.allFilters(objFilter, flagFilter);
        }
    }

    // === Обработка ввода вручную минимальной и максимальной цены ===
    getPriceFilter(e) {
        const minPriceRub = Number(priceMinInput.value);
        const maxPriceRub = Number(priceMaxInput.value);

        const conversionRate = 90; // руб → доллары

        // Сброс значений фильтра перед пересчётом
        objFilter.priceMin = null;
        objFilter.priceMax = null;

        // Перевод в доллары (по API цены в $)
        objFilter.priceMin = minPriceRub > 0 ? minPriceRub / conversionRate : null;
        objFilter.priceMax = maxPriceRub > 0 ? maxPriceRub / conversionRate : null;

        flagFilter = true;
        this.productManager.allFilters(objFilter, flagFilter);
    }

    // === Сброс значений фильтра по цене ===
    resetPricesInputsForm(e) {
        // Очищаем поля ввода
        priceMaxInput.value = null;
        priceMinInput.value = null;

        // Очищаем фильтр в объекте
        objFilter.priceMin = null;
        objFilter.priceMax = null;

        // Убираем выделение с быстрых кнопок цен
        allQuickPriceBtn.forEach(btn => {
            btn.classList.remove("filter__price-quick-wrapper-btn-active");
        });

        flagFilter = true;
        this.productManager.allFilters(objFilter, flagFilter);
    }

    // === Быстрая установка цен с кнопок "от-до" ===
    quickPricesForm(e) {
        if (e.target.classList.contains("filter__price-quick-wrapper-btn")) {
            allQuickPriceBtn.forEach(btn => {
                btn.classList.remove("filter__price-quick-wrapper-btn-active");
            });

            const conversionRate = 90;

            // Устанавливаем значения из кнопки
            priceMinInput.value = e.target.dataset.min;
            priceMaxInput.value = e.target.dataset.max;

            objFilter.priceMin = Number(priceMinInput.value) / conversionRate;
            objFilter.priceMax = Number(priceMaxInput.value) / conversionRate;

            e.target.classList.add("filter__price-quick-wrapper-btn-active");

            flagFilter = true;
            this.productManager.allFilters(objFilter, flagFilter);
        }
    }
}

// === Инициализация классов ===

// Создаём менеджер товаров, загружаем их
const productManager = new ProductManager(objFilter, false);

// Подключаем фильтрацию, передав менеджер товаров
const filterManager = new FilterManager(productManager);

});
