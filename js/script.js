`use strict`

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

    const objFilter = {
        priceMin: null,
        priceMax: null,
        category: [],
        brands: [],
    }

    let flagFilter = false;

    class ProductManager {
        allProducts = [];
        constructor () {
            this.loadProducts();

        }

        async loadProducts() {
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

            const fetchPromises = categories.map(category => {
                return fetch(`https://dummyjson.com/products/category/${category}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Ошибка сети: '+ response.status);
                    }
                    return response.json();
                })
                .then((data) => {
                    return data.products;
                })
                .catch(error => {
                    console.error('Произошла ошибка:', error.message);
                    return [];
                })
            });

            console.log(fetchPromises);
            


            this.allProducts = await Promise.all(fetchPromises).then(products => products.flat());

            console.log(this.allProducts);
            

            if (!flagFilter) {
                this.renderProducts(this.allProducts);
            }



        }

        allFilters(objFilter, flagF) {
            if (flagF && objFilter) {
                const productsFilters = this.allProducts.filter((prod) => {

                    const filterCategory = objFilter.category.length === 0 || objFilter.category.includes(prod.category);

                    const filterMinPrice = !objFilter.priceMin || prod.price >= objFilter.priceMin;

                    const filterMaxPrice = !objFilter.priceMax || prod.price <= objFilter.priceMax;

                    const filterBrands = objFilter.brands.length === 0 || objFilter.brands.includes(prod.brand);


                    return filterCategory && filterMinPrice && filterMaxPrice && filterBrands;
                });
                productsContainer.innerHTML = "";
                this.renderProducts(productsFilters);
            }
        }

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

                            <div class="product-card__price">${Math.round(prod.price * 90)} Руб</div>
                            <button class="product-card__btn-add-to-cart">В корзину</button>
                            <div class="product-card__hover">
                                <div class="product-card__preview-description">
                                ${prod.description}
                                </div>
                            </div>
                        </div>
                    </div>


                `;

                productsContainer.insertAdjacentHTML("afterbegin", html);
            });
        }


    }

    class FilterManager {
        constructor (productManager) {
            this.productManager = productManager;
            categoryContainer.addEventListener("click", this.getActiveCategory.bind(this));
            priceMinInput.addEventListener("input", this.getPriceFilter.bind(this));
            priceMaxInput.addEventListener("input", this.getPriceFilter.bind(this));
            quickPriceContainer.addEventListener("click", this.quickPricesForm.bind(this));
            resetPricesInputs.addEventListener("click", this.resetPricesInputsForm.bind(this));
            brandCheckboxesContainer.addEventListener("change", this.changeBrandCheckboxes.bind(this));

        }

        getActiveCategory(e) {
            

            if (e.target.classList.contains("filters-category-btn")) {

                if (!objFilter.category.includes(e.target.dataset.category)) {
                    objFilter.category.unshift(e.target.dataset.category);
                    e.target.classList.add("filters-btn_active");
                } else {
                    objFilter.category = objFilter.category.filter(function (categor) {
                        return categor != e.target.dataset.category;
                    });

                    e.target.classList.remove("filters-btn_active");
                }

                flagFilter = true;
                this.productManager.allFilters(objFilter, flagFilter);
                
            }

        }

        getPriceFilter(e) {

            // Переводим рубли в доллары
            const conversionRate = 90;

            const min = Number(priceMinInput.value);
            const max = Number(priceMaxInput.value);

            if (objFilter.priceMin) objFilter.priceMin = null;
            if (objFilter.priceMax) objFilter.priceMax = null;

            objFilter.priceMin = min > 0 ? min  / conversionRate : null;
            objFilter.priceMax = max > 0 ? max  / conversionRate : null;

            allQuickPriceBtn.forEach(function (btn) {
                btn.classList.remove("filter__price-quick-wrapper-btn-active");
            });

            flagFilter = true;

            this.productManager.allFilters(objFilter, flagFilter);

        }

        quickPricesForm(e) {

            if (e.target.classList.contains("filter__price-quick-wrapper-btn")) {

            // Переводим рубли в доллары
            const conversionRate = 90;

            allQuickPriceBtn.forEach(function (btn) {
                btn.classList.remove("filter__price-quick-wrapper-btn-active");
            });

            priceMinInput.value = e.target.dataset.min;
            priceMaxInput.value = e.target.dataset.max;

            objFilter.priceMin = Number(priceMinInput.value) / conversionRate;
            objFilter.priceMax = Number(priceMaxInput.value) / conversionRate;

            e.target.classList.add("filter__price-quick-wrapper-btn-active");

            flagFilter = true;

            this.productManager.allFilters(objFilter, flagFilter);

            }


        }

        resetPricesInputsForm(e) {

            priceMinInput.value = null;
            priceMaxInput.value = null;

            objFilter.priceMin = null;
            objFilter.priceMax = null;

            allQuickPriceBtn.forEach(function (btn) {
                btn.classList.remove("filter__price-quick-wrapper-btn-active");
            });

            flagFilter = true;
            this.productManager.allFilters(objFilter, flagFilter);

        }

        changeBrandCheckboxes(e) {
            const value = e.target.value;

            if (!value) return;

            if (!objFilter.brands.includes(value)) {
                objFilter.brands.unshift(value);
            } else {
                objFilter.brands = objFilter.brands.filter(brand => {
                    return brand != value;
                });
            }
            flagFilter = true;
            this.productManager.allFilters(objFilter, flagFilter);
        }
    }

    const productManager = new ProductManager();
    const filterManager = new FilterManager(productManager);
});