import react, { useEffect, useState } from "react";

const PurchaseLog = (props) => {
    let [loaded, setLoaded] = useState(false);
    let [userList, setUserList] = useState([]);
    let [search, setSearch] = useState("default");
    let sumTotal = 0;

    const filter = (whichFilter) => {
        let tempUserSearch = document.querySelector("select[name='selectUser']").value;
        if (tempUserSearch === "default") {
            setSearch((search) => "default");
        }
        if (whichFilter === "item") {
            document.querySelector("select[name='selectUser']").selectedIndex = 0;
            tempUserSearch = document.querySelector("[name='filterItems']").value;

            if (tempUserSearch === "") {
                setSearch((search) => "default");
            }


        }

        setSearch((search) => tempUserSearch);
        sumTotal = 0;

    }




    useEffect(() => {
        if (props.timeSelected.length > 0 && loaded === false) {
            let tempUsers = [];
            let tempPrice = 0;
            for (let i = 0; i < props.timeSelected.length; i++) {
                let userEmail = props.timeSelected[i].saleId.substring(0, props.timeSelected[i].saleId.indexOf(":"));
                tempPrice = parseInt(tempPrice) + parseInt(props.timeSelected[i].price);
                if (tempUsers.indexOf(userEmail) === -1) {
                    tempUsers.push(userEmail);
                }
            }
            setUserList((userList) => tempUsers);
            sumTotal = tempPrice;
            setLoaded((loaded) => true);
        }
    });

    return (

        <div className="row pb-5">
            {userList.length > 0 ?
                <div className="col-md-12">
                    <h2 className="mt-3">Search Items</h2>
                    <input type="text" name="filterItems" placeholder="Search Items" className="form-control" onChange={() => filter("item")} />

                </div> : null}
            <div className="col-md-12">
                <h1 className="my-3">Purchase Log</h1>
                <select className="form-control" name="selectUser" onChange={() => filter("user")}>
                    <option value="default">All Users</option>
                    {userList.length > 0 ? userList.map((email, i) => { return <option key={i} value={email}>{email}</option> }) : null}
                </select>
            </div>
            <div className="col-md-12 py-1">
                <ul className="list-group ">
                    {props.timeSelected ?
                        props.timeSelected.map((sale, i) => {
                            if ((sale.itemName + sale.saleId).indexOf(search) !== -1 || search === "default") {
                                sumTotal = Number(sumTotal) + Number(sale.price);
                            }
                            return <li key={i} className={(sale.itemName + sale.saleId).indexOf(search) !== -1 || search === "default" ? "list-group-item" : "hide"} ><span className="capitalize">{sale.itemName}</span>{" - $" + sale.price} <span className="badge badge-secondary">{sale.saleId}</span></li>
                        })
                        : null}
                </ul>
            </div>{sumTotal > 0 ?
                <div className="col-md-12  mb-5 pb-5 " >
                    <div className="alert alert-info w-100">
                        <h3>Total: ${sumTotal.toFixed(2)}</h3>
                    </div>
                </div> : null}
        </div>)
}

export default PurchaseLog;
