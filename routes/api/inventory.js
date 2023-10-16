const express = require("express");
const router = express.Router();
const db = require("../../config/db");
const { checkToken } = require("../../auth/token_validation");


//SERVER SIDE ADD INVENTORY
router.post("/order-product", checkToken, (req, res) => {
    let order = {
        userTimestamp: req.body.userTimestamp,
        itemName: req.body.itemName,
        quantity: req.body.quantity,
        status: req.body.status
    }

    let sql = "INSERT INTO inventory SET ?";
    let query = db.query(sql, order, (err, result) => {
        if (err) {
            console.log("Error: " + err);
        } else {
            res.send(result);
        }
    })
});


//SERVER SIDE GET INVENTORY LOG FOR SPECIFIC ITEM
router.get("/:itemName", (req, res) => {
    let sql = `SELECT * FROM inventory WHERE itemName = '${req.params.itemName}' ORDER BY userTimestamp DESC`;
    let query = db.query(sql, (err, results) => {
        if (err) {
            console.log("Error: " + err);
        } else {
            res.send(results);
        }
    })
});


//SERVER SIDE UPDATE ORDER STATUS

router.put("/update-order-status", checkToken, (req, res) => {
    let sql = `UPDATE inventory SET status = '${req.body.status}' WHERE userTimestamp = '${req.body.userTimestamp}' ORDER BY userTimestamp DESC`;
    let query = db.query(sql, (err, result) => {
        if (err) {
            console.log("Error: " + err);
        } else {
            res.send(result);
        }
    });
})



module.exports = router;