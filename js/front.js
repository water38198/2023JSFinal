const apiPath = "payroom";
const baseUrl = `https://livejs-api.hexschool.io/api/livejs/v1/`;

let isLoading = false;
let productsData = [];
let cartsData = [];



//取得產品資料
function getProducts() {
    const url = `${baseUrl}customer/${apiPath}/products`;
    axios
        .get(url)
        .then((res) => {
            productsData = res.data.products;
            renderProducts(productsData);
        })
        .catch((err) => {
            Swal.fire("錯誤發生!");
        });
}

//取得購物車資料
function getCarts() {
    const url = `${baseUrl}customer/${apiPath}/carts`;
    axios
        .get(url)
        .then((res) => {
            cartsData = res.data;
            renderCarts();
        })
        .catch((err) => {
            Swal.fire("錯誤發生!");
        });
}

getProducts();
getCarts();

//  渲染產品列表
const productsList = document.querySelector(".productWrap");

function renderProducts(data) {
    let listHTML = "";
    data.forEach((product) => {
        const productHTML = ` <li class="productCard">
                <h4 class="productType">新品</h4>
                <img src="${product.images}" alt="">
                <a href="#" class="addCardBtn" data-id='${product.id}'>加入購物車</a>
                <h3>${product.title}</h3>
                <del class="originPrice">NT$${product.origin_price}</del>
                <p class="nowPrice">NT$${product.price}</p>
            </li>`;
        listHTML += productHTML;
    });
    productsList.innerHTML = listHTML;
}
// 點擊加入購物車
productsList.addEventListener("click", (e) => {
    e.preventDefault();
    const { id } = e.target.dataset;
    if (id) {
        addCart(id);
    }
});

// 篩選功能
const filterProduct = document.querySelector(".productSelect");
filterProduct.addEventListener("change", (e) => {
    if (e.target.value === "全部") {
        renderProducts(productsData);
    } else {
        const filterData = productsData.filter(
            (product) => product.category === e.target.value
        );
        renderProducts(filterData);
    }
});
// 加入購物車
function addCart(id) {
    if (isLoading) return;
    isLoading = true;
    const url = `${baseUrl}customer/${apiPath}/carts`;
    const quantity =
        (cartsData.carts.find((item) => item.product.id === id)?.quantity || 0) + 1;
    let newPost = {
        data: {
            productId: id,
            quantity
        }
    };
    axios
        .post(url, newPost)
        .then((res) => {
            cartsData = res.data;
            renderCarts();
            const Toast = Swal.mixin({
                toast: true,
                position: "bottom-end",
                showConfirmButton: false,
                timer: 1000,
                didOpen: (toast) => {
                    toast.onmouseenter = Swal.stopTimer;
                    toast.onmouseleave = Swal.resumeTimer;
                }
            });
            Toast.fire({
                icon: "success",
                title: "加入成功！！d(`･∀･)b"
            });

        })
        .catch(() => {
            Swal.fire("錯誤發生!");
        }).finally(() => {
            isLoading = false;
        });
}

//  渲染購物車
const cartTable = document.querySelector(".shoppingCart-table");
function renderCarts() {
    if (cartsData.carts.length === 0) {
        cartTable.innerHTML = "目前沒有東西在購物車！！▼・ᴥ・▼";
        return;
    }
    let cartsList = "";
    cartsData.carts.forEach((item) => {
        cartsList += `<tr>
                    <td>
                        <div class="cardItem-title">
                            <img src=${item.product.images} alt="">
                            <p>${item.product.title}</p>
                        </div>
                    </td>
                    <td>NT$${item.product.price}</td>
                    <td>${item.quantity}</td>
                    <td>NT$${item.product.price * item.quantity}</td>
                    <td class="discardBtn">
                        <a href="#" class="material-icons" data-behavior='delete' data-id=${item.id
            }>
                            clear
                        </a>
                    </td>
                </tr>`;
    });
    const cartsHTML = `                <tr>
                    <th width="40%">品項</th>
                    <th width="15%">單價</th>
                    <th width="15%">數量</th>
                    <th width="15%">金額</th>
                    <th width="15%"></th>
                </tr>
                ${cartsList}
                <tr>
                    <td>
                        <a href="#" class="discardAllBtn" data-behavior='deleteAll'>刪除所有品項</a>
                    </td>
                    <td></td>
                    <td></td>
                    <td>
                        <p>總金額</p>
                    </td>
                    <td>NT$${cartsData.finalTotal}</td>
                </tr>`;
    cartTable.innerHTML = cartsHTML;
}

// 購物車綁定-刪除、清空
cartTable.addEventListener("click", (e) => {
    e.preventDefault();
    const { behavior, id } = e.target.dataset;
    if (behavior === "deleteAll") {
        deleteAllCarts();
        return;
    }
    if (behavior === "delete") {
        deleteSingle(id);
    }
});

//清空購物車
function deleteAllCarts() {
    if (isLoading) return;
    isLoading = true;
    const url = `${baseUrl}customer/${apiPath}/carts`;
    axios
        .delete(url)
        .then((res) => {
            cartsData = res.data;
            renderCarts();
            Swal.fire(res.data.message);
        })
        .catch((err) => {
            Swal.fire({
                icon: "error",
                title: "錯誤發生",
                text: `${err.response.data.message}`
            })
        }).finally(() => {
            isLoading = false;
        });
}

//刪除單一商品
function deleteSingle(id) {
    if (isLoading) return;
    isLoading = true;
    const url = `${baseUrl}customer/${apiPath}/carts/${id}`;
    axios
        .delete(url)
        .then((res) => {
            cartsData = res.data;
            renderCarts();
            Swal.fire("刪除成功！！(◉３◉)");
        })
        .catch((err) => {
            Swal.fire(err.response.data.message);
        }).finally(() => {
            isLoading = false;
        });
}


// 表單
const form = document.querySelector(".orderInfo-form");
const submitOrder = document.querySelector(".orderInfo-btn");
submitOrder.addEventListener("click", (e) => {
    e.preventDefault();
    const data = getFormValue();
    //檢查是否有空值
    if (Object.values(data).includes("")) {
        Swal.fire("您有東西沒有填到呦！(；´ﾟωﾟ｀人)");
        return;
    }
    if (isLoading) return;
    isLoading = true;
    const url = `${baseUrl}customer/${apiPath}/orders`;
    const orderData = { data: { user: data } };
    axios
        .post(url, orderData)
        .then((res) => {
            //重新渲染購物車
            getCarts();
            //清空表單
            form.reset();
            Swal.fire("送出訂單成功!!");
        })
        .catch((err) => {
            Swal.fire(err.response.data.message)
        }).finally(() => {
            isLoading = false;
        });
});

// 取得表單資料
function getFormValue() {
    const formData = new FormData(form);
    // 將 FormData 轉換為物件
    const formObject = {};
    formData.forEach((value, key) => {
        formObject[key] = value;
    });
    return formObject;
}
