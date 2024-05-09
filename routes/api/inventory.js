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
router.get("/:itemName", checkToken, (req, res) => {
    //let sql = `SELECT * FROM inventory WHERE itemName = '${req.params.itemName.replace(/[&\/\\#,+()$~%'"*?|<>{}“]/g, '')}' ORDER BY userTimestamp DESC`;
    let query = db.query(
        `SELECT * FROM inventory WHERE itemName = ? ORDER BY userTimestamp DESC`,
        [req.params.itemName],
        (err, results) => {
            if (err) {
                console.log("Error: " + err);
            } else {
                res.send(results);
            }
        })
});


//SERVER SIDE UPDATE ORDER STATUS

router.put("/update-order-status", checkToken, (req, res) => {
    // let sql = `UPDATE inventory SET status = '${req.body.status.replace(/[&\/\\#,+()$~%'"*?|<>{}“]/g, '')}' WHERE userTimestamp = '${req.body.userTimestamp.replace(/[&\/\\#,+()$~%'"*?|<>{}“]/g, '')}' ORDER BY userTimestamp DESC`;
    let query = db.query(
        `UPDATE inventory SET status = ? WHERE userTimestamp = ? ORDER BY userTimestamp DESC`,
        [req.body.status, req.body.userTimestamp],
        (err, result) => {
            if (err) {
                console.log("Error: " + err);
            } else {
                res.send(result);
            }
        });
})



module.exports = router;
