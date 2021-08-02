//
//
//
// variantes

var checkOut = {};
var isCartPage;
var foodOrder = new Array();


//constructor 

class FoodObject{
    constructor(id, title, description, image, inStock, price, rating, stockColour){
        this.title = title;
        this.id = id;
        this.description = description;
        this.image = image;
        this.inStock = isInStock(inStock);
        this.stockBool = inStock;
        this.price = price;
        this.rating = rating;
        this.stockColour = stockColour;
    }
}

// array que tiene la informacion desde el json

$(()=>{ 
    $.getJSON("js/menu.json", function(data){
        var stockColour;
        for(d of data){
            if(d["In-Stock"]) stockColour = "inStock";
            else stockColour = "outStock";
            foodOrder.push(
                new FoodObject(
                    d.Id,
                    d.Title,
                    d.Description,
                    d.Image,
                    d["In-Stock"],
                    d.Price,
                    d.Ratings,
                    stockColour
                )
            )
        }
        
        if(document.getElementsByClassName("cartPage")[0] == undefined){
            isCartPage = false;
            populateMenu();
            $(".notInStock").on("mouseenter", ()=>{mousePopupSorry(true)});
            $(".notInStock").on("mouseout", ()=>{mousePopupSorry(false)});
        }else{
            isCartPage = true;
            populateCart();
        }
        $(".addToOrder").on("click", ()=>{
            addItemPopup();
            if(isCartPage)calcTotal();
        });  
    });
});


// funciones


function isInStock(stock){
    if(stock) return "In Stock";
    else return "Out of Stock";
}
function openClose(srt){
    if($(`#${srt}`).height() > 0){
        $(`#${srt}`).css("height", "0px");
        $(`#${srt}`).css("padding", "0px");
        
    }else{
        $(`#${srt}`).css("height", "auto");
        $(`#${srt}`).css("padding", "10px 2px");
    }
}

function populateMenu(){
    let addStyle = "";
    let addClass = "notInStock"
    for(f of foodOrder){
        if(!f.stockBool) {
            addStyle = 'style="text-decoration: line-through"';
            addClass = "notInStock";
        }
        else {
            addStyle = "";
            addClass = "addToOrder";
        }
        
        $("#menuItemList").append(`
            <div class="menuItem" onclick="openClose('more${f.id}')">
                <div class="itemTitle">
                    <div class="itemNameAndPrice">
                        <div><span>$${f.price}</span>${f.title}</div>
                        <div class="${f.stockColour}">${f.inStock}</div>
                    </div>
                    <div class="shopOptions">
                        <div class="quantity item${f.id} rmvItem" id="rmvItem(${f.id})" onclick="rmvItem(${f.id})"><span></span></div>
                        <span class="quantity item${f.id}" id="item${f.id}">0</span>                    
                        <div class="baseAddBtn ${addClass}" name="item${f.id}">
                            <div class="addBtn" ${addStyle}>agregado</div>
                        </div>
                    </div>
                </div>
                <div id="more${f.id}" class="moreDescription">
                    <content><span class="rating" >${f.rating}</span> ${f.description}</content>
                    <img src="${f.image}" />
                </div>
            </div>
        `);
    }
    $("#menuItemList").append('<div class="bumper">&nbsp</div>');
    $("#checkOutBtn").on("click", ()=>{submitCheckout()});
}

function mousePopupSorry(isOver){
    let popupBox = $("#popupMsg");
    let x = ($(event.target).offset().left - (1.5*$(event.target).width()));
    let y = ($(event.target).position().top + (2*$(event.target).height()));

    if(isOver){
        popupBox.css("display", "initial");
        popupBox.css("top", y);
        popupBox.css("left", x);
    }else{
        popupBox.css("display", "none");
    }
}

function addItemPopup(){
    let dirOffset = Math.random() * 50;
    let popupBox = $('<div id="popupMsgAdded">Agregado!</div>');
    $("#mainPageArea").append(popupBox);
    let x = ($(event.target).offset().left - (1*$(event.target).width()));
    let y = ($(event.target).position().top);

    popupBox.css("top", y);
    popupBox.css("left", x);
    
    popupBox.animate({
        "left": x-(5 + 4*dirOffset),
        "top": y-(75 - dirOffset),
        "opacity": 0  
    }, 1000, ()=>{x
        popupBox.remove();
    });   

    let itemName = $(event.target).attr('name'); 
    let itemQty = $("#"+ itemName);
    let itemInt = parseInt(itemQty.html());
    if(itemInt == 0){
        $("."+$(event.target).attr('name')).css("visibility", "visible");
    }
    itemInt++;
    localStorage.setItem(itemName, itemInt);
    checkOut[itemName] = itemInt; 
    itemQty.html(itemInt);

    updateCheckout();
    event.stopPropagation();
}

function rmvItem(rmv){
    let itemName = "item"+rmv;
    let dirOffset = Math.random() * 50;
    let popupBox = $('<div id="popupMsgDropped">Cancelado!</div>');
    $("#mainPageArea").append(popupBox);
    let x = ($(event.target).offset().left - (4*$(event.target).width()));
    let y = ($(event.target).position().top);

    popupBox.css("top", y);
    popupBox.css("left", x);
    
    popupBox.animate({
        "left": x-(5 + 4*dirOffset),
        "top": y+(75 - dirOffset),
        "opacity": 0  
    }, 1000, ()=>{
        popupBox.remove();
    });  

    let itemQty = $("#"+itemName);
    let itemInt = parseInt(itemQty.html());
    itemInt--;
    localStorage.setItem(itemName, itemInt); 
    checkOut[itemName] = itemInt; 
    if(itemInt <= 0){
        itemInt = 0; 
        delete(checkOut[itemName]);
        $("."+itemName).css("visibility", "hidden");
    }
    itemQty.html(itemInt);

    if(isCartPage)calcTotal();
    else updateCheckout();
    event.stopPropagation();
}

function updateCheckout(){
    let totalItems = 0;
    for(let c in checkOut){
        totalItems += checkOut[c];
    }
    $("#totalItems").html(totalItems);
}

function submitCheckout(){
    let ready = false;
    let itemsInCart = "";
    for(let c in checkOut){
        if(ready){
            itemsInCart +=",";
        }
        ready = true;
        itemsInCart +=c;
    }
    if(ready){
        localStorage.setItem("checkInItems", itemsInCart);
        window.location.href = "cart.html";
    }else{
        $("#checkOutItems").css("color", "red");
        setTimeout(()=>{
            $("#checkOutItems").css("transition", "1s");
            $("#checkOutItems").css("color", "black");
        }, 500);
        $("#checkOutItems").css("transition", "0s");
    }
}

//funciones de cart

 function populateCart(){


     checkOut = "";
     let checkIn = localStorage.getItem("checkInItems");
     if(checkIn == undefined || checkIn == null){
        console.log("check In null");
        return;
     }
     checkIn = checkIn.split(",");
     for(let food of foodOrder){
        if(checkIn.includes("item"+food.id)){
            let amount = localStorage.getItem("item"+food.id);

            $("#menuItemList").append(`
            <div class="menuItem" onclick="openClose('more${food.id}')">
                <div class="itemTitle">
                    <div class="itemNameAndPrice">
                        <div><span>$${food.price}</span>${food.title}</div>
                    </div>
                    <div class="shopOptions">
                        <div class="removeButton item${food.id}" onclick="RemoveItem(${food.id})">Cancelar</div>
                        <div class="quantity item${food.id} rmvItem" id="rmvItem(${food.id})" onclick="rmvItem(${food.id})"><span></span></div>
                        <span class="quantity sumItms item${food.id}" id="item${food.id}">${amount}</span>                    
                        <div class="baseAddBtn addToOrder" name="item${food.id}">
                            <div class="addBtn">Seleccionado</div>
                        </div>
                    </div>
                </div>
                <div id="more${food.id}" class="moreDescription">
                    <content><span class="rating" >${food.rating}</span> ${food.description}</content>
                    <img src="${food.image}" />
                </div>
            </div>
        `);
        $(".item"+food.id).css("visibility", "visible");
        }
     }
     $("#menuItemList").append(`
            <div id="finalBill">
                <div>
                    <div>Sin impuestos</div>
                    <div>$<span id="sinimpuestos">0</span></div>
                </div>
                <div>
                    <div>Descuentos</div>
                    <div><span id="descuento">0</span>%</div>
                </div>
                <div>
                    <div>Impuesto</div>
                    <div>$<span id="impuestos">0</span></div>
                </div>
                <div>
                    <div>Total</div>
                    <div>$<span id="finalcuenta">0</span></div>
                </div>
            </div>
            <button class="btnClass" id="backBtn">Volver a la tienda</button>
     `);
     calcTotal();
     $("#backBtn").on("click", ()=>{window.location.href = "index.html";})
 }

 function RemoveItem(itm){

    let itemName = "item"+itm;

    let itemQty = $("#"+itemName);
    let itemInt = parseInt(itemQty.html());
    itemInt = 0;
    localStorage.setItem(itemName, itemInt);  
    checkOut[itemName] = itemInt; 
    if(itemInt <= 0){
        itemInt = 0; 
        delete(checkOut[itemName]);
        $("."+itemName).css("visibility", "hidden");
    }
    
     itemQty.html(itemInt);
    
     updateCheckout();

     event.stopPropagation();
 }

//pagos

function calcTotal(){
    let items = $(".sumItms");
    let imp = $("#impuestos");
    let sin = $("#sinimpuesto");
    let des = $("#descuento");
    let final = $("#finalcuenta");

    let grossAmt = 0; //grossAmt
    let hstAmt = 0;
    let disct = 0;
    let trueFinal = 0;
    for(let i of items){
        let num = parseInt(i.innerHTML);
        grossAmt += num * foodOrder[i.id.split("item")[1]-1].price;
    }
    grs.html(grossAmt);

    if(grossAmt >= 100) disct = 0.3;
    else if(grossAmt >= 70) disct = 0.3;
    else if(grossAmt >= 30) disct = 0.3;
    dsc.html(disct*100);

    hstAmt = (grossAmt*(1-disct))*0.13;
    hst.html(hstAmt.toFixed(2));

    trueFinal = (grossAmt*(1-disct)) + hstAmt;
    final.html(trueFinal.toFixed(2));
 }
