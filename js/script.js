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


    let objFilter = {
        category: [],
        brands: [],
        priceMin: null,
        priceMax: null,

    };

    let flagFilter = false;


   class Product {
    constructor(id, title, price, brand, category, color, thumbnail, descr) {
        this.id = id;
        this.title = title;
        this.price = price;
        this.brand = brand;
        this.category = category;
        this.color = color;
        this.thumbnail = thumbnail;
        this.descr = descr;
    }
   }

   class ProductManager {
    allProduct = [];
    
    constructor() {
        this.loadProducts();
        // this.filterManager = new FilterManager();

    }

    // Загрузка с API
    loadProducts(objFilter, flagF) {
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
                        throw new Error('Ошибка сети: ' + response.status);
                    }
                    return response.json();
                })
                .then(data => data.products)
                .catch(error => {
                    console.error('Произошла ошибка: ', error.message);
                    return [];
                });
        });

        Promise.all(fetchPromises)
        .then(products => {
            this.allProduct = products.flat();
            console.log(this.allProduct);
            
            if (!flagF && !objFilter) {
                this.renderProducts(this.allProduct);
            }

            if (flagF && objFilter) {
                const productsFilters = this.allProduct.filter((prod) => {
                   const filterCategory = objFilter.category.length === 0 || objFilter.category.includes(prod.category);
                   const filterBrands = objFilter.brands.length === 0 || objFilter.brands.includes(prod.brand);
                   const filterMinPrice = !objFilter.priceMin || prod.price >= objFilter.priceMin;
                   const filterMaxPrice = !objFilter.priceMax || prod.price <= objFilter.priceMax;
                   return filterCategory && filterBrands && filterMinPrice && filterMaxPrice;
                });
            productsContainer.innerHTML = "";
            this.renderProducts(productsFilters);
            }

        


           

                
            
        });

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

                    <div class="product-card__price">${Math.round(prod.price * 90)} ₽уб</div>
                    <button class="product-card__btn-add-to-cart">В корзину</button>
                    <div class="product-card__hover">
                        <div class="product-card__preview-description">${prod.description}</div>
                    </div>
                </div>
            </div>
        
        `;

        
        productsContainer.insertAdjacentHTML("afterbegin", html);

        });



    }

    clearProducts() {

    }

   }

   class FilterManager {

    constructor(productManager) {
        this.productManager = productManager;
        filterContainer.addEventListener("click", this.getActiveCategory.bind(this));
        brandCheckboxesContainer.addEventListener("change", this.changeBrandCheckboxes.bind(this));
        priceMinInput.addEventListener("input", this.getPriceFilter.bind(this));
        priceMaxInput.addEventListener("input", this.getPriceFilter.bind(this));
        resetPricesInputs.addEventListener("click", this.resetPricesInputsForm.bind(this));
        quickPriceContainer.addEventListener("click", this.quickPricesForm.bind(this));

    }
// Фильтры бренды
    changeBrandCheckboxes(e) {
        const value = e.target.value;
        console.log(value);
        
        if (!value) return;

        if (!objFilter.brands.includes(value)) {
            objFilter.brands.unshift(value);
        } else {
            objFilter.brands = objFilter.brands.filter(elem => elem !== value);
        }
        this.productManager.loadProducts(objFilter, true);

    }

// Фильтр по категориям
    getActiveCategory(e) {
    const target = e.target;

    // Категории
    if (target.classList.contains("filters-category-btn")) {
        if (!objFilter.category.includes(target.dataset.category)) {
            objFilter.category.unshift(target.dataset.category);
            target.classList.add("filters-btn_active");
        } else {
            objFilter.category = objFilter.category.filter(elem => elem !== target.dataset.category);
            target.classList.remove("filters-btn_active");
        }
        this.productManager.loadProducts(objFilter, true);
    }

}

// Цены ручной ввод
getPriceFilter(e) {
        // Цены
        
        const minPriceRub = Number(priceMinInput.value);
        const maxPriceRub = Number(priceMaxInput.value);

        // Переводим рубли в доллары
        const conversionRate = 90;
        if (objFilter.priceMin) objFilter.priceMin = null;
        if (objFilter.priceMax) objFilter.priceMax = null;
        objFilter.priceMin = minPriceRub > 0 ? minPriceRub / conversionRate : null;
        objFilter.priceMax = maxPriceRub > 0 ? maxPriceRub / conversionRate : null;


        console.log(objFilter); 
        
        this.productManager.loadProducts(objFilter, true);


}

// Сбросить значение интпутов цен
resetPricesInputsForm(e) {
    priceMaxInput.value = null;
    priceMinInput.value = null;
    objFilter.priceMin = null;
    objFilter.priceMax = null;
    this.productManager.loadProducts(objFilter, true);
    allQuickPriceBtn.forEach(btn => {
        btn.classList.remove("filter__price-quick-wrapper-btn-active");
    });
}

// Авто подставка цен
quickPricesForm(e) {
    if (e.target.classList.contains("filter__price-quick-wrapper-btn")) {
        allQuickPriceBtn.forEach(btn => {
            btn.classList.remove("filter__price-quick-wrapper-btn-active");
        });
        // Переводим рубли в доллары
        const conversionRate = 90;
        priceMinInput.value = e.target.dataset.min;
        priceMaxInput.value = e.target.dataset.max;

        objFilter.priceMin = Number(priceMinInput.value) / conversionRate;
        objFilter.priceMax = Number(priceMaxInput.value) / conversionRate;
        e.target.classList.add("filter__price-quick-wrapper-btn-active");

        this.productManager.loadProducts(objFilter, true);

    }
}

}



    


const productManager = new ProductManager(objFilter, false);
const filterManager = new FilterManager(productManager);

    
});