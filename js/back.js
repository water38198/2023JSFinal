const token = 'V9Jv0QOOgFUjRtHtgNWqE5nfVHM2'
let orderData = [];

//取得path
function getPath(place, id, character = 'custom') {
    // 如果參數錯誤則不回傳
    if (!['products', 'carts', 'orders'].includes(place) || !['admin', 'custom'].includes(character)) {
        return
    }
    const apiPath = "payroom";
    const path = `https://livejs-api.hexschool.io/api/livejs/v1/${character}/${apiPath}/${place}`
    if (id) {
        return path + `/${id}`
    } else {
        return path
    }
}

// 取得訂單
function getOrders() {
    axios.get(getPath('orders', 0, 'admin'), {
        headers: {
            'Authorization': token
        }
    }).then(res => {
        orderData = [...res.data.orders]
        renderOrderTable();
        renderChart();
    }).catch(() => {
        Swal.fire('發生錯誤')
    })
}


getOrders();

// 時間轉換
function transformTime(time) {
    newTime = new Date(time * 1000)
    return `${newTime.getFullYear()}/${newTime.getMonth() + 1}/${newTime.getDate()}`
}

// 渲染表單
function renderOrderTable() {
    const orderTable = document.querySelector('.orderPage-table')
    // 先串出中間tr部分
    const orderTr = orderData.map(order => {
        return `                <tr>
                    <td>${order.createdAt}</td>
                    <td>
                        <p>${order.user.name}</p>
                        <p>${order.user.tel}</p>
                    </td>
                    <td>${order.user.address}</td>
                    <td>${order.user.email}</td>
                    <td>
                        ${order.products.map(products => `<p>${products.title}</p>`).join("")}
                    </td>
                    <td>${transformTime(order.createdAt)}</td>
                    <td class="orderStatus">
                        <a href="#" data-id=${order.id} data-behavior='edit'>${order.paid ? "已處理" : "未處理"}</a>
                    </td>
                    <td>
                        <input type="button" class="delSingleOrder-Btn" value="刪除" data-id=${order.id} data-behavior='delete'>
                    </td>
                </tr>`
    }).join("")
    // 再做出整個Table
    orderTable.innerHTML = `                <thead>
                    <tr>
                        <th>訂單編號</th>
                        <th>聯絡人</th>
                        <th>聯絡地址</th>
                        <th>電子郵件</th>
                        <th>訂單品項</th>
                        <th>訂單日期</th>
                        <th>訂單狀態</th>
                        <th>操作</th>
                    </tr>
                </thead>${orderTr}`
}

//點擊事件
const orderList = document.querySelector('.orderPage-list');
orderList.addEventListener('click', (e) => {
    e.preventDefault()
    // 用 behavior 判斷點擊的目的
    const { id, behavior } = e.target.dataset
    if (id && behavior === 'delete') {
        deleteOrder(id);
        return
    }
    if (id && behavior === 'edit') {
        editOrder(id)
        return
    }
    if (behavior === 'deleteAll') {
        deleteAllOrder()
        return
    }
})

// 修改狀態
function editOrder(id) {
    const editData = {
        data: {
            id: id,
            paid: !orderData.find(order => order.id === id).paid
        }
    }
    axios.put(getPath("orders", 0, "admin"), editData, {
        headers: {
            'Authorization': token
        }
    }).then(res => {
        console.log(res)
        getOrders();
    }).catch(err => {
        console.log(err)
    })
}

// 刪除單一訂單
function deleteOrder(id) {
    axios.delete(getPath("orders", id, "admin"), {
        headers: {
            'Authorization': token
        }
    }).then(() => {
        Swal.fire("刪除成功");
        getOrders();
    }).catch(() => {
        Swal.fire("發生錯誤");
    })
}

// 刪除全部訂單

function deleteAllOrder() {
    Swal.fire({
        title: '你確定要刪除全部訂單嗎?',
        confirmButtonText: "確定",
        showCancelButton: true,
        cancelButtonText: '取消'
    }).then((result) => {
        if (result.isConfirmed) {
            axios.delete(getPath("orders", 0, "admin"), {
                headers: {
                    'Authorization': token
                }
            }).then(() => {
                Swal.fire("成功刪除全部訂單!!");
                getOrders();
            }).catch(() => {
                Swal.fire("發生錯誤");
            })
        }
    })

}
// 渲染圖表
function renderChart() {
    const chartData = {};
    // 先將所有訂單資料整理為物件，例如: {Jordan雙人床架 : 3200 , Antony 床邊桌 : 5000 }
    orderData.forEach(order => {
        order.products.forEach(product => {
            chartData[product.title] = (chartData[product.title] || 0) + product.price * product.quantity
        })
    })
    // 物件轉成陣列並且照金額排序大到小
    const chartDataArray = Object.entries(chartData).sort((a, b) => b[1] - a[1])
    // 取前三
    const chartColum = chartDataArray.slice(0, 3)
    // 將剩下的品項總金額加總後放入
    chartColum.push(["其他", chartDataArray.slice(3).map(el => el[1]).reduce((a, b) => a + b)])
    console.log(chartColum)
    let chart = c3.generate({
        bindto: '#chart',
        data: {
            type: "pie",
            columns: chartColum,

        },
        color: {
            pattern: ["#301E5F", "#5434A7", "#9D7FEA", "#DACBFF"],
        }
    });
}












// C3.js
