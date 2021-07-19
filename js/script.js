//
//
//
//

var checkOut = {};
var isCartPage;
var foodOrder = new Array();

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

/**
 * Generate array on page creation
 */

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


// End page creation


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

//
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
                            <div class="addBtn" ${addStyle}>Add</div>
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

/**
 * Increase "item quantity" and reward user with success animation
 */
function addItemPopup(){
    let dirOffset = Math.random() * 50;
    let popupBox = $('<div id="popupMsgAdded">Added!</div>');
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

    let itemName = $(event.target).attr('name'); //item3
    let itemQty = $("#"+ itemName);
    let itemInt = parseInt(itemQty.html());
    if(itemInt == 0){
        $("."+$(event.target).attr('name')).css("visibility", "visible");
    }
    itemInt++;
    localStorage.setItem(itemName, itemInt);
    checkOut[itemName] = itemInt; //Add to checkout Object
    itemQty.html(itemInt);

    updateCheckout();
    event.stopPropagation();
}

/**
 * Decrease "item quantity" and remove  at item number == 0
 */
function rmvItem(rmv){
    let itemName = "item"+rmv;
    let dirOffset = Math.random() * 50;
    let popupBox = $('<div id="popupMsgDropped">Dropped!</div>');
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
    localStorage.setItem(itemName, itemInt);  //Update local storage for item
    checkOut[itemName] = itemInt; //Add to checkout Object
    if(itemInt <= 0){
        itemInt = 0; //reduce possibility of values < 0
        delete(checkOut[itemName]);
        $("."+itemName).css("visibility", "hidden");
    }
    itemQty.html(itemInt);

    if(isCartPage)calcTotal();
    else updateCheckout();
    event.stopPropagation();
}

/**
 * Keep running total of items
 */
function updateCheckout(){
    let totalItems = 0;
    for(let c in checkOut){
        totalItems += checkOut[c];
    }
    $("#totalItems").html(totalItems);
}

/**
 * Submit from index.html
 */
function submitCheckout(){
    let ready = false;
    let itemsInCart = "";
    for(let c in checkOut){
        if(ready){
            itemsInCart +=",";
        }
        ready = true;
        // localStorage.setItem(c, checkOut[c]);
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


/**
 *  -=| CART PAGE |=-
 */

/**
 * Populate cart page with selections
 */
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
                        <div class="removeButton item${food.id}" onclick="RemoveItem(${food.id})">Remove</div>
                        <div class="quantity item${food.id} rmvItem" id="rmvItem(${food.id})" onclick="rmvItem(${food.id})"><span></span></div>
                        <span class="quantity sumItms item${food.id}" id="item${food.id}">${amount}</span>                    
                        <div class="baseAddBtn addToOrder" name="item${food.id}">
                            <div class="addBtn">Add</div>
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
                    <div>Gross Bill Amount</div>
                    <div>$<span id="grossBill">0</span></div>
                </div>
                <div>
                    <div>Discount</div>
                    <div><span id="discountAmt">0</span>%</div>
                </div>
                <div>
                    <div>HST</div>
                    <div>$<span id="hstAmt">0</span></div>
                </div>
                <div>
                    <div>Total</div>
                    <div>$<span id="finalBillAmt">0</span></div>
                </div>
            </div>
            <button class="btnClass" id="backBtn">Back to Shopping</button>
     `);
     $("#backBtn").on("click", ()=>{window.location.href = "index.html";})
 }

 function RemoveItem(itm){

    let itemName = "item"+itm;

    let itemQty = $("#"+itemName);
    let itemInt = parseInt(itemQty.html());
    itemInt = 0;
    localStorage.setItem(itemName, itemInt);  //Update local storage for item
    checkOut[itemName] = itemInt; //Add to checkout Object
    if(itemInt <= 0){
        itemInt = 0; //reduce possibility of values < 0
        delete(checkOut[itemName]);
        $("."+itemName).css("visibility", "hidden");
    }
    itemQty.html(itemInt);

    
    updateCheckout();

    event.stopPropagation();
 }

 
