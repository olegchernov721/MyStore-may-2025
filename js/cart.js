`use strict`

document.addEventListener("DOMContentLoaded", function (e) {
    // Получаем основные элементы DOM для работы с корзиной
    const cardsContainer = document.querySelector(".cart-content__added-products-cards");
    const numberOfProducts = document.querySelector(".header__nav-link-number-of-products");
    const selectedProductsDelete = document.querySelector(".cart-content__added-products-delete-selected-ones");
    const prodAllSpan = document.querySelector(".products-to-purchase__all-span");
    const prodAmountSpan = document.querySelector(".products-to-purchase__amount-span");
    const wrapperArrangeProducts = document.querySelector(".wrapper-arrange__products");
    const btnDeleteSelectedCards = document.querySelector(".cart-content__added-products-delete-selected-ones");

    // Класс для управления корзиной
    class CartManager {
        cartItems = []; // Товары в корзине
        cartStorageKey = "dnr-sale-cart"; // Ключ для хранения корзины в localStorage
        selectedProducts = []; // Массив выбранных товаров (отмеченных чекбоксами)
        selectedProductIds = []; // Массив id выбранных товаров

        constructor() {
            // Привязываем обработчики событий
            this.loadCart.bind(this);
            cardsContainer.addEventListener("change", this.changeProductCheckboxes.bind(this));
            btnDeleteSelectedCards.addEventListener("click", this.btnDeleteSelectedProducts.bind(this));
        }

        // Загружает корзину из localStorage и отображает товары
        loadCart() {
            // localStorage.removeItem("selectedProd");
            const cartItems = JSON.parse(localStorage.getItem('cart'));
            if (!cartItems) return;
            this.cartItems = cartItems;
            cardsContainer.innerHTML = "";

            // 🟢 Вот эта строка добавит правильное поведение
            this.selectedProducts = JSON.parse(localStorage.getItem("selectedProd")) || [];

            // Обновляем число товаров в иконке корзины
            this.updateCartIconCount();

            // Отрисовываем карточки товаров в корзине
            this.renderCartItems();

            // Отрисовываем выбранные товары для оформления
            this.renderArrangeProducts();
            // Подсчитываем количество и сумму выбранных товаров
            this.selectedQuantityAndAmount();
        }

        saveCart() {
            // Заглушка для сохранения корзины (реализация не добавлена)
        }

        removeFromCart() {
            // Заглушка для удаления товара из корзины (реализация не добавлена)
        }

        clearCart() {
            // Заглушка для очистки корзины (реализация не добавлена)
        }

        // Отображает карточки товаров в корзине
        renderCartItems() {
            console.log(this.cartItems);
            

            if (this.cartItems.length <= 0) return; 

            // Получаем товары отмеченные чекбоксами из localStorage
            const checkboxCards = JSON.parse(localStorage.getItem("selectedProd")) || [];


            this.cartItems.forEach((product, i) => {
                // Определяем, отмечен ли чекбокс для товара

                let isChecked = checkboxCards.some(item => item.id === product.id) ? "checked" : "";


                
                // Формируем HTML карточки товара
                let html = `
                    <div class="cart-content__added-products-cards" id="${product.id}">
                        <div class="added-card" data-id="${product.id}">
                        <!-- Чекбокс для выбора товара -->
                        <label class="added-card__select">
                            <input type="checkbox" class="added-card__checkbox"  
                            ${isChecked}/>
                            <span></span>
                        </label>
                        <!-- Фото товара -->
                        <div class="added-card__image">
                            <img src="${product.images}" alt="${product.title}" />
                        </div>
                        <!-- Информация о товаре -->
                        <div class="added-card__info">
                            <div class="added-card__title">${product.title}</div>
                            <div class="added-card__descr">${product.descr}</div>
                            <div class="added-card__price">${Math.round(product.price * 90)} ₽</div>
                        </div>
                        <!-- Управление количеством -->
                        <div class="added-card__quantity">
                            <button class="quantity-btn quantity-btn--minus">−</button>
                            <span class="quantity-value">${product.quantity}</span>
                            <button class="quantity-btn quantity-btn--plus">+</button>
                        </div>
                        <!-- Кнопка удаления -->
                        <button class="added-card__remove">
                            <i class="fa-solid fa-trash"></i> Удалить
                        </button>
                        </div>
                    </div>
                `;
                // Вставляем карточку в контейнер
                cardsContainer.insertAdjacentHTML("afterbegin", html);
            });
        }

        // Обработка выбора товаров через чекбоксы
        changeProductCheckboxes(e) {
        const product = e.target.closest(".added-card");
        const productId = Number(product.dataset.id);

        const foundProduct = this.cartItems.find(p => p.id === productId);
        if (!foundProduct) return;

        if (e.target.checked) {
            // Добавляем, если ещё не добавлен
            const alreadySelected = this.selectedProducts.some(p => p.id === productId);
            if (!alreadySelected) this.selectedProducts.push(foundProduct);
        } else {
            // Удаляем
            this.selectedProducts = this.selectedProducts.filter(p => p.id !== productId);
        }

        // Сохраняем обновлённый массив
        localStorage.setItem("selectedProd", JSON.stringify(this.selectedProducts));

        // Обновляем интерфейс
        this.selectedQuantityAndAmount();
        this.renderArrangeProducts();
        }



        // Подсчёт количества и суммы выбранных товаров
        selectedQuantityAndAmount() {
            const products = JSON.parse(localStorage.getItem("selectedProd")) || [];

            if (products.length >= 1) {
                let prodAll = 0;
                let prodAmount = 0;

                // Показываем кнопку удаления выбранных товаров
                selectedProductsDelete.classList.remove("hidden");
                products.forEach((prod) => {
                    prodAmount += Math.round(prod.price * 90) * prod.quantity;
                    prodAll += prod.quantity;
                });

                // Обновляем отображение количества и суммы
                prodAllSpan.textContent = prodAll;
                prodAmountSpan.textContent = `${prodAmount} ₽`;

            } 
            if (products.length <= 0) {
                // Если ничего не выбрано — скрываем кнопку и сбрасываем значения
                selectedProductsDelete.classList.add("hidden");
                prodAllSpan.textContent = "0";
                prodAmountSpan.textContent = `0 ₽`;
            }
        }

        // Удаляет выбранные товары из корзины
        btnDeleteSelectedProducts(e) {
            localStorage.removeItem("cart");
            // Собираем id выбранных товаров
            const selectedIds = new Set(this.selectedProducts.map(prod => prod.id));
            // Оставляем только те товары, которые не были выбраны
            this.cartItems = this.cartItems.filter(item => !selectedIds.has(item.id));
            // Сохраняем обновлённую корзину
            localStorage.setItem("cart", JSON.stringify(this.cartItems));

            // Очищаем и перерисовываем карточки
            cardsContainer.innerHTML = "";
            this.renderCartItems();

            // Очищаем массив выбранных товаров
            this.selectedProducts = [];
            localStorage.setItem("selectedProd", JSON.stringify(this.selectedProducts));

            // Обновляем отображение выбранных товаров для оформления
            this.renderArrangeProducts();
        }

        // Отображение выбранных товаров для оформления заказа
        renderArrangeProducts() {
            // wrapperArrangeProducts.innerHTML = "";

            const products = JSON.parse(localStorage.getItem("selectedProd"));

            if (products.length >= 1) {

                // console.log("Product");
                

                // console.log(products);
                


                wrapperArrangeProducts.innerHTML = "";
                products.forEach((prod) => {
                    let html = `
                        <div class="arrange-card" data-id="${prod.id}">
                            <div class="arrange-card__image">
                                <img src="${prod.images}" alt="${prod.title}" />
                            </div>
                            <div class="arrange-card__info">
                                <div class="arrange-card__title">${prod.title}</div>
                                <div class="arrange-card__price">${Math.round(prod.price * 90)} ₽</div>
                            </div>
                            <div class="arrange-card__quantity">
                                <span class="arrange-card__quantity-value">${prod.quantity}</span> Шт
                            </div>
                        </div>
                    `;
                    wrapperArrangeProducts.insertAdjacentHTML("afterbegin", html);
                });
            } 
            if (products.length <= 0) {
                // Если ничего не выбрано — выводим сообщение
                wrapperArrangeProducts.innerHTML = "";
                wrapperArrangeProducts.textContent = "Нет выбранных товаров";
            }
        }

        // Обновляет число товаров в иконке корзины
        updateCartIconCount() {
            numberOfProducts.textContent = this.cartItems.length;
        }
    }

    // Инициализация менеджера корзины и загрузка корзины
    const cartManager = new CartManager();
    cartManager.loadCart();
});