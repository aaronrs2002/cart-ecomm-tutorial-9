import React, { useState, useEffect } from "react";
import axios from "axios";
import timestamp from "./timestamp";
import Validate from "./Validate";
import InventoryChart from "./InventoryChart";


const Inventory = (props) => {
    let [orderStatus, setOrderStatus] = useState("received");
    let [currentTime, setCurrentTime] = useState("");
    let [loaded, setLoaded] = useState(false);
    let [activeItem, setActiveItem] = useState();

    let [allProductOrders, setAllProductOrders] = useState([]);
    let [orderQtys, setOrderQtys] = useState([]);
    //let [months, setMonths] = useState([]);
    let [totalOrdered, setTotalOrdered] = useState(0);

    let [purchaseQtys, setPurchaseQtys] = useState([]);
    let [purchaseMonths, setPurchaseMonths] = useState([]);
    let [purchaseLog, setPurchaseLog] = useState([]);
    let [totalPurchased, setTotalPurchased] = useState(0);

    const grabOrders = (name, monthList) => {
        axios.get("/api/inventory/" + name, props.config).then(
            (res) => {
                try {
                    if (res.data[0].status) {

                        setOrderStatus((orderStatus) => res.data[0].status);
                        setActiveItem((activeItem) => res.data[0].userTimestamp);

                        setAllProductOrders((allProductOrders) => res.data);



                        let tempMonths = monthList;
                        let tempOrderQtys = [];
                        for (let i = 0; i < tempMonths.length; i++) {
                            tempOrderQtys.push(0);
                        }

                        console.log("tempMonths:  " + tempMonths);
                        for (let i = 0; i < res.data.length; i++) {
                            if (res.data[i].status.indexOf("received") !== -1) {
                                let theMonth = res.data[i].status.substring(res.data[i].status.length - 19, res.data[i].status.length - 12);

                                if (tempMonths.indexOf(theMonth) !== -1) {
                                    tempOrderQtys[tempMonths.indexOf(theMonth)] = res.data[i].quantity + tempOrderQtys[tempMonths.indexOf(theMonth)];

                                } else {
                                    tempMonths = [...tempMonths, theMonth];
                                    setPurchaseMonths((purchaseMonths) => tempMonths);
                                    tempOrderQtys = [...tempOrderQtys, res.data[i].quantity];
                                }
                            }
                        }
                        let tempTotal = 0;
                        for (let i = 0; i < tempOrderQtys.length; i++) {
                            tempTotal = tempTotal + tempOrderQtys[i];
                        }

                        setTotalOrdered((totalOrdered) => tempTotal);
                        setOrderQtys((orderQtys) => tempOrderQtys);

                    }
                } catch (error) {
                    props.showAlert("No ordering data yet", "warning");
                    console.log("error: " + error);
                }
            }, (error) => {
                props.showAlert("There was a server side error: " + error, "danger");
            }
        )

    }


    //CLIENT SIDE UPDATE ITEMS TABLE
    const updateItemsTable = (qty) => {

        let updateData = {
            itemName: props.selectionObj.itemName,
            stockQty: Number(qty)
        }

        axios.put("/api/items/updateQty/", updateData, props.config).then(
            (res) => {
                if (res.data.affectedRows === 1) {
                    props.showAlert("Your order was sent to the database", "success");
                    props.GrabAllItems(sessionStorage.getItem("token"));
                    props.switchFunc("add");
                } else {
                    props.showAlert("The items table did not update.", "warning");
                }

            }, (error) => {
                props.showAlert("There was a server side error: " + error, "danger");
            }
        )
    }


    const updateStatus = (status, userTimestamp) => {

        let tempTimestamp = timestamp();
        let tempQty;
        let orderLog = {};
        if (status === "ordering") {
            Validate(["orderQty"]);
            if (document.querySelector(".error")) {
                props.showAlert("Please type in a number.", "warning");
                return false;
            }
            tempQty = document.querySelector("[name='orderQty']").value;
        }




        try {
            tempQty = Number(tempQty);
        } catch (error) {
            console.log("That is not a number: " + error);
            return false;
        }

        if (status === "ordering") {



            orderLog = {
                userTimestamp: props.userEmail + ":" + tempTimestamp,
                itemName: props.selectionObj.itemName,
                quantity: tempQty,
                status: status + ":" + props.userEmail + ":" + tempTimestamp
            }

            axios.post("/api/inventory/order-product", orderLog, props.config).then(
                (res) => {
                    if (res.data.affectedRows === 1) {
                        props.showAlert("Your order was sent to the database", "success");
                        grabOrders(props.selectionObj.itemName, purchaseMonths);
                        setOrderStatus((orderStatus) => status);
                        props.GrabAllItems(sessionStorage.getItem("token"));
                        document.querySelector("[name='orderQty']").value = "";

                    } else {
                        props.showAlert("We didn't find your product", "warning");
                    }

                }, (error) => {
                    props.showAlert("There was a server side error: " + error, "danger");
                }
            );

        } else {
            //CLIENT SIDE SUBMIT STATUS UPDATE
            orderLog = {
                userTimestamp,
                status: status + ":" + props.userEmail + ":" + tempTimestamp
            }
            axios.put("/api/inventory/update-order-status/", orderLog, props.config).then(
                (res) => {
                    if (res.data.affectedRows === 1) {
                        props.showAlert("Your order was sent to the database", "success");
                        grabOrders(props.selectionObj.itemName, purchaseMonths);
                        setOrderStatus((orderStatus) => status);
                        //CLIENT SIDE UPDATE stockQty IN "items" table

                        let tempQtySum = 0;
                        for (let i = 0; i < allProductOrders.length; i++) {
                            tempQtySum = tempQtySum + allProductOrders[i].quantity;
                        }

                        updateItemsTable((parseInt(tempQtySum) - parseInt(totalPurchased)));
                        document.querySelector("[name='orderQty']").value = "";

                    } else {
                        props.showAlert("We didn't find your product", "warning");
                    }

                }, (error) => {
                    props.showAlert("There was a server side error: " + error, "danger");
                }
            );

        }

    }

    function parseDate(str) {

        console.log("str: " + str);

        var mdy = str.split('/');
        return new Date(mdy[2], mdy[0] - 1, mdy[1]);
    }


    const datediff = (orderDate, receiveDate) => {
        console.log("orderDate: " + orderDate);
        console.log("receiveDate: " + receiveDate);

        // orderDate = orderDate.substring(5,7)+"/"+orderDate.substring(8,10)+"/"+orderDate.substring(0,4);
        // receiveDate = receiveDate.substring(5,7)+"/"+receiveDate.substring(8,10)+"/"+receiveDate.substring(0,4);
        // Take the difference between the dates and divide by milliseconds per day.
        // Round to nearest whole number to deal with DST.


        return Math.round((orderDate - receiveDate) / (1000 * 60 * 60 * 24));

    }



    useEffect(() => {
        if (loaded === false && props.selectionObj.itemName) {


            axios.get("/api/purchaseLog/ordersByName/" + props.selectionObj.itemName, props.config).then(
                (res) => {

                    let tempMonths = [];
                    let tempSoldQtys = [];
                    let tempTotal = 0;

                    //BUILD THE MONTH LIST AND SORT IT FIRST, THEN APPLY VALUES TO THE INDEX AFTER THE DATES ARE IN ORDER
                    for (let i = 0; i < res.data.length; i++) {
                        let theMonth = res.data[i].saleId.substring(res.data[i].saleId.indexOf(":") + 1, res.data[i].saleId.indexOf(":") + 8);
                        if (tempMonths.indexOf(theMonth) === -1) {
                            tempMonths.push(theMonth);
                            tempSoldQtys.push(0);//PLACEHOLDER TO BE ADDED TO
                        }

                    }
                    tempMonths = tempMonths.reverse();
                    tempMonths = tempMonths.sort();
                    console.log("tempMonths: " + tempMonths);
                    for (let i = 0; i < res.data.length; i++) {
                        let theMonth = res.data[i].saleId.substring(res.data[i].saleId.indexOf(":") + 1, res.data[i].saleId.indexOf(":") + 8);
                        tempSoldQtys[tempMonths.indexOf(theMonth)] = 1 + tempSoldQtys[tempMonths.indexOf(theMonth)];
                        tempTotal = tempTotal + 1;
                    }
                    setPurchaseMonths((purchaseMonths) => tempMonths);
                    setTotalPurchased((totalPurchased) => tempTotal);
                    setPurchaseQtys((purchaseQtys) => tempSoldQtys);
                    setPurchaseLog((purchaseLog) => res.data);
                    grabOrders(props.selectionObj.itemName, tempMonths);
                }, (error) => {
                    props.showAlert("That did not work.", "danger");
                }
            )
            let tempTime = timestamp();

            setCurrentTime((currentTime) => tempTime.toString());
            setLoaded((loaded) => true);
        }
    });

    if (document.querySelector("[name='stockQty']")) {
        document.querySelector("[name='stockQty']").value = "In stock: " + (parseInt(totalOrdered) - parseInt(totalPurchased)) + " Total ordered: " + totalOrdered + " - Total sold: " + totalPurchased;
        //console.log("totalOrdered: " + totalOrdered + " - totalPurchased: " + totalPurchased + " - purchaseMonths: " + purchaseMonths);
        //console.log("totalOrdered - tempTotal: " + (parseInt(totalOrdered) - parseInt(tempTotal)));
    }


    return (
        <React.Fragment>

            <div className="col-md-12">
                <h3>Item Inventory</h3>
                {orderQtys.length > 0 && purchaseMonths.length > 0 && orderQtys.length > 0
                    ? <InventoryChart orderQtys={orderQtys} purchaseQtys={purchaseQtys} purchaseMonths={purchaseMonths} /> : <label>No orders</label>}
            </div>
            <div className="col-md-12">

                <h3 className={(parseInt(totalOrdered) - parseInt(totalPurchased)) < 5 ? "text-danger" : "text-muted"}>Order more</h3>
                <p className={(parseInt(totalOrdered) - parseInt(totalPurchased)) < 5 ? "text-danger" : "text-muted"}>Current Quantity: {(parseInt(totalOrdered) - parseInt(totalPurchased))}</p>



                <div className="input-group mb-3">
                    <input type="text" className="form-control" name="orderQty" placeholder="Number only" />
                    <button className={(parseInt(totalOrdered) - parseInt(totalPurchased)) < 5 ? "btn btn-danger" : "btn btn-secondary"} onClick={() => updateStatus("ordering", currentTime)} >Order more</button>
                </div>
            </div>
            <div className="col-md-12 pb-5">
                <h3>Order log:</h3>
                <div className="pb-5">
                    {allProductOrders.length > 0 ?

                        allProductOrders.map((item, i) => {
                            console.log("item.status: " + item.status);
                            return (
                                <div className="card">
                                    <div className="card-body">



                                        {item.status.indexOf("received:") !== -1 ?
                                            <ul className="list-unstyled">
                                                <li className="text-success">{item.status}
                                                    <p>{"Order quantity: " + item.quantity + " - Order info: " + item.userTimestamp}</p>
                                                    <span className="badge bg-success text-light">Days passed:
                                                        {


                                                            datediff(parseDate(item.userTimestamp.substring(item.userTimestamp.indexOf(":") + 1).substring(5, 7) + "/" + item.userTimestamp.substring(item.userTimestamp.indexOf(":") + 1).substring(8, 10) + "/" + item.userTimestamp.substring(item.userTimestamp.indexOf(":") + 1).substring(0, 4)),
                                                                parseDate(item.status.substring(item.status.length - 19, item.status.length).substring(5, 7) + "/" + item.status.substring(item.status.length - 19, item.status.length).substring(8, 10) + "/" + item.status.substring(item.status.length - 19, item.status.length).substring(0, 4)))}</span></li>
                                            </ul>
                                            //timestamp(): 2023-10-03T13:45:10
                                            : null}
                                        {item.status.indexOf("ordering:") !== -1 ?
                                            <ul className="list-unstyled">
                                                <li className="text-warning">Item has not arrived - <span className="badge bg-warning text-dark">Days passed since order: {datediff(parseDate(item.userTimestamp.substring(item.userTimestamp.indexOf(":") + 1).substring(5, 7) + "/" + item.userTimestamp.substring(item.userTimestamp.indexOf(":") + 1).substring(8, 10) + "/" + item.userTimestamp.substring(item.userTimestamp.indexOf(":") + 1).substring(0, 4)),
                                                    parseDate(currentTime.substring(5, 7) + "/" + currentTime.substring(8, 10) + "/" + currentTime.substring(0, 4)))}</span>

                                                    <div role="alert" className={orderStatus.indexOf("received") !== -1 ? "alert alert-warning" : "alert alert-info"}>

                                                        <ul className="list-unstyled">
                                                            <li><h4>Last Quantity Ordered: {item.quantity} {" - Order info: " + item.userTimestamp}</h4></li>
                                                            <li><label>Order Status: {orderStatus}</label></li>
                                                            <li><i>Once the order is fulfilled, select "order received" below.</i></li>

                                                            <li> <button className="btn btn-success w-100" onClick={() => updateStatus("received", item.userTimestamp)}>Order Received</button></li>
                                                            <li> <button className="btn btn-danger w-100" onClick={() => updateStatus("cancelled", item.userTimestamp)}>Cancel Order</button></li>
                                                        </ul>


                                                    </div>



                                                </li></ul> : null}

                                        {item.status.indexOf("cancelled") !== -1 ?
                                            <ul className="list-unstyled text-muted ">
                                                <li><h4>Last Quantity Ordered: {item.quantity} {" - Order info: " + item.userTimestamp}</h4></li>
                                                <li><label>Order Status:{item.status}</label></li>
                                                <li > <span className="badge bg-muted ">Days passed:
                                                    {datediff(parseDate(item.userTimestamp.substring(item.userTimestamp.indexOf(":") + 1).substring(5, 7) + "/" + item.userTimestamp.substring(item.userTimestamp.indexOf(":") + 1).substring(8, 10) + "/" + item.userTimestamp.substring(item.userTimestamp.indexOf(":") + 1).substring(0, 4)),
                                                        parseDate(item.status.substring(item.status.length - 19, item.status.length).substring(5, 7) + "/" + item.status.substring(item.status.length - 19, item.status.length).substring(8, 10) + "/" + item.status.substring(item.status.length - 19, item.status.length).substring(0, 4)))}</span></li>
                                            </ul>
                                            //timestamp(): 2023-10-03T13:45:10
                                            : null}

                                    </div>
                                </div>)
                        })

                        : null}
                </div>
            </div>
        </React.Fragment>
    )

}

export default Inventory;

/*
Ideas:
make each UI print friendly with a button 
show all item-stock-orders in a log format 
calculate and display how many days each item took from order to delivery
write a search in purchase logs
purchase and review history 
*/