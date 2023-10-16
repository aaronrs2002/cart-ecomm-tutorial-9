import React, { useEffect, useState } from "react";
import axios from "axios";


const PurchaseHistory = (props) => {
    let [itemSearch, setItemSearch] = useState("");
    let [loaded, setLoaded] = useState(false);
    let [ratingsLoaded, setRatingsLoaded] = useState(false);
    const stars = [1, 2, 3, 4, 5];


    const filterItems = () => {
        let searchTxt = document.querySelector("[name='filterItems']").value;
        searchTxt = searchTxt.toLowerCase();
        setItemSearch((itemSearch) => searchTxt);
    }


    useEffect(() => {

        if (loaded === false && props.userPurchases.length > 0) {

            setTimeout(() => {
                axios.get("/api/reviews/user/" + props.userEmail, props.config).then(
                    (res) => {
                        for (let i = 0; i < res.data.length; i++) {
                            if (document.querySelector("[data-review='" + res.data[i].itemName + "']")) {
                                [].forEach.call(document.querySelectorAll("[data-review='" + res.data[i].itemName + "']"), (e) => {
                                    e.innerHTML = "Your review stated: " + decodeURI(res.data[i].comment);
                                });
                            }

                            let tempStars = ""
                            for (let j = 0; j < stars.length; j++) {
                                let standard = "fas fa-star pointer";
                                if (res.data[i].rating >= stars[j]) {
                                    standard = "fas fa-star pointer yellowStar";
                                }
                                tempStars = tempStars + "<i  class='" + standard + "' ></i>";
                            }
                            [].forEach.call(document.querySelectorAll("[data-rating='" + res.data[i].itemName + "']"), (e) => {
                                e.innerHTML = "Your gave a rating of: " + res.data[i].rating + " out of 5: " + tempStars;
                            });
                        }
                        setRatingsLoaded((ratingsLoaded) => true);

                    },
                    (error) => {
                        console.log(error);
                        props.showAlert("There was a problem getting your reviews: " + error, "danger");
                    }
                );
            }, 1000);




            setLoaded((loaded) => true);

        }
    });
    console.log("JSON.stringify(props.userPurchases): " + JSON.stringify(props.userPurchases));
    return (<div className="col-md-12">
        <h2>Your Order History and Reviews</h2>
        <div className="col-md-12 py-2">

            <input type="text" name="filterItems" placeholder="Search Items" className="form-control" onChange={() => filterItems()} />

        </div>

        <div className="col-md-12 pb-5 mb-5">
            {props.userPurchases.length > 0 ?

                props.userPurchases.map((purchase, i) => {
                    return (
                        <div className={purchase.itemName.indexOf(itemSearch) !== -1 ? "card" : "hide"}>
                            <div className="card-body">
                                <div className="card-title">{purchase.itemName}</div>
                                <ul className="list-unstyled">

                                    <li>Price: ${purchase.price}</li>
                                    <li>Purchase info: {purchase.saleId}</li>
                                    <li data-rating={purchase.itemName}>You have not rated this item.</li>
                                    <li data-review={purchase.itemName}>You have not reviewed this item.</li>

                                </ul></div></div>)
                })



                :
                <label>No purchases yet</label>

            }
        </div>


    </div>)

}

export default PurchaseHistory;