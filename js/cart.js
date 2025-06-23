`use strict`

document.addEventListener("DOMContentLoaded", function (e) {
    // Получаем основные элементы DOM для работы с корзиной
    const cardsContainer = document.querySelector(".cart-content__added-products-cards");
    const selectedCardsContainer = document.querySelector(".wrapper-arrange__products");
    const numberOfProducts = document.querySelector(".header__nav-link-number-of-products");
    const selectedProductsDelete = document.querySelector(".cart-content__added-products-delete-selected-ones");
    const quantityAllSelectedProd = document.querySelector(".products-to-purchase__all-span");
    const quantityAllAmountSelectedProdprod = document.querySelector(".products-to-purchase__amount-span");
    const selectedContainer = document.querySelector(".wrapper-arrange__products");
    const btnDeleteSelectedCards = document.querySelector(".cart-content__added-products-delete-selected-ones");
    const btnAllSelectProducts = document.querySelector(".cart-content__added-products-select");


    // Класс для управления корзиной

    class CartManager {
        cardItems = [];
        selectedProducts = [];
        constructor() {
            cardsContainer.addEventListener("change", this.checkboxSelectedProducts.bind(this));
            btnDeleteSelectedCards.addEventListener("click", this.deleteSelectedCards.bind(this));
            cardsContainer.addEventListener("click", this.renderQuantityProduct.bind(this));
            btnAllSelectProducts.addEventListener("click", this.selectedAll.bind(this));
            cardsContainer.addEventListener("click", this.deleteOneProduct.bind(this));

        }

        loadCards() {
            const cards = JSON.parse(localStorage.getItem("cart")) || [];
            this.cardItems = cards;
            // console.log(this.cardItems);
            
            this.selectedProducts = JSON.parse(localStorage.getItem("selectedCards")) || [];
            numberOfProducts.textContent = this.cardItems.length;
            localStorage.setItem("cart", JSON.stringify(this.cardItems));
            this.renderCards();
            this.showBtnDeleteAll();
            this.renderSelectedCards();
            this.calcSelectedProducts();
        }

        renderCards() {
            const products = JSON.parse(localStorage.getItem("cart")) || [];
            const selectedProducts = JSON.parse(localStorage.getItem("selectedCards")) || [];
            let selectedId = [];
            if (selectedProducts && selectedProducts.length >= 1) {
                selectedId = selectedProducts.map(prod => {
                    return prod.id;
                });
            }

            // let checked;
            if (products.length >= 1) {
                cardsContainer.innerHTML = "";
                products.forEach(product => {

                // console.log(selectedId);
                



                    let html = `
                <div class="added-card" data-id="${product.id}">
                    <label class="added-card__select">
                        <input type="checkbox" class="added-card__checkbox"
                        ${selectedId.includes(product.id) ? "checked" : ""}
                        />
                        <span></span>
                    </label>
                    <div class="added-card__image">
                        <img src="${product.images}" alt="${product.title}" />
                    </div>
                    <div class="added-card__info">
                        <div class="added-card__title">${product.title}</div>
                        <div class="added-card__descr">${product.descr}</div>
                        <div class="added-card__price">${Math.round(product.price * 90)} ₽</div>
                    </div>
                    <div class="added-card__quantity">
                        <button class="quantity-btn quantity-btn--minus">−</button>
                        <span class="quantity-value">${product.quantity}</span>
                        <button class="quantity-btn quantity-btn--plus">+</button>
                    </div>
                    <button class="added-card__remove">
                        <i class="fa-solid fa-trash"></i> Удалить
                    </button>
                </div>`;
                    cardsContainer.insertAdjacentHTML("afterbegin", html);
                });
            } else {
                cardsContainer.innerHTML = "";
                cardsContainer.textContent = "Нет добавленных товаров";
            }
        }

        checkboxSelectedProducts(e) {
            const cardCheckbox = e.target.closest(".added-card");
            const idCardCheckbox = Number(cardCheckbox.dataset.id);

            if (e.target.checked) {
                this.cardItems.forEach(prod => {
                    if (prod.id === idCardCheckbox) {
                        this.selectedProducts.push(prod);
                    }
                });
                
                if (this.selectedProducts.length === 0) {
                    btnDeleteSelectedCards.classList.add("hidden");
                } else {
                    btnDeleteSelectedCards.classList.remove("hidden");
                }

                localStorage.setItem("selectedCards", JSON.stringify(this.selectedProducts));
                this.showBtnDeleteAll();
                this.renderSelectedCards();
                this.calcSelectedProducts();

            } else {
                const selectedCards = this.selectedProducts.filter(prod => {
                    return prod.id != idCardCheckbox;
                });

                this.selectedProducts = selectedCards;

                if (this.selectedProducts.length === 0) {
                    btnDeleteSelectedCards.classList.add("hidden");
                } else {
                    btnDeleteSelectedCards.classList.remove("hidden");
                }

                localStorage.setItem("selectedCards", JSON.stringify(this.selectedProducts));
                this.showBtnDeleteAll();
                this.renderSelectedCards();
                this.calcSelectedProducts();
            }
        }

        renderSelectedCards() {
            const products = JSON.parse(localStorage.getItem("selectedCards")) || [];

            if (products.length >= 1) {
                selectedContainer.innerHTML = "";
                products.forEach(selectProd => {
                    let html = `
                    <div class="arrange-card" data-id="${selectProd.id}">
                        <div class="arrange-card__image">
                            <img src="${selectProd.images}" alt="${selectProd.title}" />
                        </div>
                        <div class="arrange-card__info">
                            <div class="arrange-card__title">${selectProd.title}</div>
                            <div class="arrange-card__price">${Math.round(selectProd.price * 90)} ₽</div>
                        </div>
                        <div class="arrange-card__quantity">
                            <span class="arrange-card__quantity-value">${selectProd.quantity}</span> Шт
                        </div>
                    </div>`;

                    selectedContainer.insertAdjacentHTML("afterbegin", html);
                });
            } else {
                selectedContainer.innerHTML = "Нет выбранных товаров";
            }
        }

        calcSelectedProducts() {
            let AllSelectedProd = 0;
            let AllMoneys = 0;
            const selectedCards = JSON.parse(localStorage.getItem("selectedCards")) || [];
            if (selectedCards.length >= 1) {
                selectedCards.forEach(prod => {
                    AllSelectedProd += prod.quantity;
                    AllMoneys += Math.round(prod.price * 90) * prod.quantity;
                    quantityAllSelectedProd.textContent = AllSelectedProd;
                    quantityAllAmountSelectedProdprod.textContent = AllMoneys;
                });
            } else {
                AllSelectedProd = 0;
                AllMoneys = 0;
                quantityAllSelectedProd.textContent = AllSelectedProd;
                quantityAllAmountSelectedProdprod.textContent = AllMoneys;
            }
        }

        deleteSelectedCards(e) {
            const selectedCards = JSON.parse(localStorage.getItem("selectedCards")) || [];
            const idSelectedCards = selectedCards.map(prod => prod.id);
            this.cardItems = this.cardItems.filter(prod => {
                return !idSelectedCards.includes(prod.id);
            });
            this.selectedProducts = [];
            localStorage.setItem("cart", JSON.stringify(this.cardItems));
            localStorage.setItem("selectedCards", JSON.stringify(this.selectedProducts));
            numberOfProducts.textContent = this.cardItems.length;


            if (this.selectedProducts.length === 0) {
                btnDeleteSelectedCards.classList.add("hidden");
            } else {
                btnDeleteSelectedCards.classList.remove("hidden");
            }

            this.renderCards();
            this.renderSelectedCards();
            this.calcSelectedProducts();
        }

        renderQuantityProduct(e) {
            // const quantityValue = document.querySelector(".quantity-value");
            if (!e.target.classList.contains("quantity-btn")) return;

            const targetCardProd = e.target.closest(".added-card");
            const productId = Number(e.target.closest(".added-card").dataset.id);
            // console.log(productId);

            let quantityMinus;
            let quantityPlus;
            
            if (!productId) return;



            if (e.target.classList.contains("quantity-btn--minus")) {
                // console.log(this.cardItems);
                
                 this.cardItems.forEach(item => {
                    if (item.id === productId && item.quantity > 1) {
                        item.quantity -= 1;
                        targetCardProd.querySelector(".quantity-value").textContent = item.quantity;
                        quantityMinus = item.quantity;
                    } else if (item.id === productId && item.quantity === 1) {
                        item.quantity = 1;
                        targetCardProd.querySelector(".quantity-value").textContent = item.quantity;
                        quantityMinus = item.quantity;
                    }
                }); 

                this.selectedProducts.forEach(selectProd => {
                    if (selectProd.id === productId) {
                        selectProd.quantity = quantityMinus;

                        if (!selectedCardsContainer.querySelector(`.arrange-card[data-id="${productId}"]`)) return;

                        selectedCardsContainer.querySelector(`.arrange-card[data-id="${productId}"]`).querySelector(".arrange-card__quantity-value").textContent = selectProd.quantity;
                    }
                });


                localStorage.setItem("selectedCards", JSON.stringify(this.selectedProducts));
                localStorage.setItem("cart", JSON.stringify(this.cardItems));
                this.calcSelectedProducts();
            }

            if (e.target.classList.contains("quantity-btn--plus")) {

                this.cardItems.forEach(item => {
                    if (item.id === productId && item.quantity < 10) {
                        item.quantity += 1;
                        targetCardProd.querySelector(".quantity-value").textContent = item.quantity;
                        quantityPlus = item.quantity;
                    } else if (item.id === productId && item.quantity >= 10) {
                        item.quantity = 10;
                        targetCardProd.querySelector(".quantity-value").textContent = item.quantity;
                        quantityPlus = item.quantity;
                    }
                });

                this.selectedProducts.forEach(selectProd => {
                    if (selectProd.id === productId) {
                        selectProd.quantity = quantityPlus;

                        if (!selectedCardsContainer.querySelector(`.arrange-card[data-id="${productId}"]`)) return;

                        selectedCardsContainer.querySelector(`.arrange-card[data-id="${productId}"]`).querySelector(".arrange-card__quantity-value").textContent = selectProd.quantity;
                        
                    }
                });

                localStorage.setItem("selectedCards", JSON.stringify(this.selectedProducts));
                localStorage.setItem("cart", JSON.stringify(this.cardItems));

                this.calcSelectedProducts();

            }



        }

        selectedAll(e) {

             const allCheckbox = document.querySelectorAll(".added-card__checkbox");

            const selectProds = JSON.parse(localStorage.getItem("selectedCards")) || [];
            
           if (selectProds && selectProds.length === this.cardItems.length) {
                allCheckbox.forEach(check => {

                check.checked = false;
                });
                this.selectedProducts = [];
                localStorage.setItem("selectedCards", JSON.stringify(this.selectedProducts));
                this.showBtnDeleteAll();
                this.renderSelectedCards();
                this.calcSelectedProducts();
           }

           if (selectProds && selectProds.length < this.cardItems.length) {
                allCheckbox.forEach(check => {

                    check.checked = true;
                });
                this.selectedProducts = this.cardItems;
                
                localStorage.setItem("selectedCards", JSON.stringify(this.selectedProducts));
                this.showBtnDeleteAll();
                this.renderSelectedCards();
                this.calcSelectedProducts();
           }

            


  


        }


        showBtnDeleteAll() {
            const selectProds = JSON.parse(localStorage.getItem("selectedCards")) || [];
            if (selectProds && selectProds.length >= 1) {
                btnDeleteSelectedCards.classList.remove("hidden");
            } else {
                btnDeleteSelectedCards.classList.add("hidden");
            }
        }


        deleteOneProduct(e) {

            if (!e.target.classList.contains("added-card__remove")) return;

            const productCard = e.target.closest(".added-card");
            const productId = Number(productCard.dataset.id);
            
            
            

            if (e.target.classList.contains("added-card__remove")) {
                // console.log(productId);
                this.cardItems = this.cardItems.filter(prod => {
                    return prod.id != productId;
                });
                this.selectedProducts = this.selectedProducts.filter(prod => {
                    return prod.id != productId;
                });

                localStorage.setItem("cart", JSON.stringify(this.cardItems));
                localStorage.setItem("selectedCards", JSON.stringify(this.selectedProducts));

                this.renderCards();
                this.renderSelectedCards();
                this.calcSelectedProducts();
                this.showBtnDeleteAll();
            }
        }

        

    }

    // Инициализация менеджера корзины и загрузка корзины
    const cartManager = new CartManager();
    cartManager.loadCards();
});




                // let html = `
                //     <div class="cart-content__added-products-cards" id="${product.id}">
                //         <div class="added-card" data-id="${product.id}">
                //         <!-- Чекбокс для выбора товара -->
                //         <label class="added-card__select">
                //             <input type="checkbox" class="added-card__checkbox"  
                //             ${isChecked}/>
                //             <span></span>
                //         </label>
                //         <!-- Фото товара -->
                //         <div class="added-card__image">
                //             <img src="${product.images}" alt="${product.title}" />
                //         </div>
                //         <!-- Информация о товаре -->
                //         <div class="added-card__info">
                //             <div class="added-card__title">${product.title}</div>
                //             <div class="added-card__descr">${product.descr}</div>
                //             <div class="added-card__price">${Math.round(product.price * 90)} ₽</div>
                //         </div>
                //         <!-- Управление количеством -->
                //         <div class="added-card__quantity">
                //             <button class="quantity-btn quantity-btn--minus">−</button>
                //             <span class="quantity-value">${product.quantity}</span>
                //             <button class="quantity-btn quantity-btn--plus">+</button>
                //         </div>
                //         <!-- Кнопка удаления -->
                //         <button class="added-card__remove">
                //             <i class="fa-solid fa-trash"></i> Удалить
                //         </button>
                //         </div>
                //     </div>
                // `;
                // // Вставляем карточку в контейнер
                // cardsContainer.insertAdjacentHTML("afterbegin", html);



                    //                 let html = `
                    //     <div class="arrange-card" data-id="${prod.id}">
                    //         <div class="arrange-card__image">
                    //             <img src="${prod.images}" alt="${prod.title}" />
                    //         </div>
                    //         <div class="arrange-card__info">
                    //             <div class="arrange-card__title">${prod.title}</div>
                    //             <div class="arrange-card__price">${Math.round(prod.price * 90)} ₽</div>
                    //         </div>
                    //         <div class="arrange-card__quantity">
                    //             <span class="arrange-card__quantity-value">${prod.quantity}</span> Шт
                    //         </div>
                    //     </div>
                    // `;
                    // wrapperArrangeProducts.insertAdjacentHTML("afterbegin", html);