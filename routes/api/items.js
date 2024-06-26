const express = require("express");
const router = express.Router();
const db = require("../../config/db");
const { checkToken } = require("../../auth/token_validation");


//SERVER SIDE GET ALL PRODUCTS
router.get("/all-items/", checkToken, (req, res) => {
    let sql = `SELECT * FROM items`;
    let query = db.query(sql, (err, result) => {
        if (err) {
            console.log("Error: " + err);
        } else {
            res.send(result);
        }
    });
});


//SERVER SIDE POST NEW ITEM
router.post("/post-item", checkToken, (req, res) => {
    let sql = `INSERT INTO  items SET ?`;
    let query = db.query(sql, {
        itemName: req.body.itemName,
        category: req.body.category,
        price: req.body.price,
        details: req.body.details,
        searchWords: req.body.searchWords,
        images: req.body.images
    }, (err, result) => {
        if (err) {
            console.log("Error: " + err);
        } else {
            res.send(result);
        }
    });
});

//SERVER SIDE PUT/UPDATE ITEM
router.put("/updateItem/", checkToken, (req, res) => {
    if ((typeof req.body.price) === "number") {
        //let sql = `UPDATE items SET  price = '${req.body.price}', category = '${req.body.category.replace(/[&\/\\#,+()$~%'"*?|<>{}“]/g, '')}', details = '${req.body.details.replace(/[&\/\\#,+()$~%'"*?|<>{}“]/g, '')}',  searchWords= '${req.body.searchWords.replace(/[&\/\\#,+()$~'"*?|<>{}“]/g, '')}', images= '${req.body.images.replace(/[&#+()$~'"*?|<>{}“]/g, '')}' WHERE itemName = '${req.body.itemName.replace(/[&\/\\#,+()$~%'"*?|<>{}“]/g, '')}'`;
        let query = db.query(
            `UPDATE items SET  price = ?, category = ?, details = ?,  searchWords= ?, images= ? WHERE itemName = ?`,
            [req.body.price, req.body.category, req.body.details, req.body.searchWords, req.body.images, req.body.itemName],
            (err, result) => {
                if (err) {
                    console.log("Error: " + err);
                } else {
                    res.send(result);
                }
            });
    }

});


//SERVER SIDE UPDATE REVIEW 

router.put("/update-review/", checkToken, (req, res) => {
    //let sql = `UPDATE items SET reviewData = '${req.body.reviewData.replace(/[&\/\\#+()$~%'*?|<>“]/g, '')}' WHERE itemName = '${req.body.itemName.replace(/[&\/\\#,+()$~%'"*?|<>{}“]/g, '')}'`;
    let query = db.query(
        `UPDATE items SET reviewData = ? WHERE itemName = ?`,
        [req.body.reviewData, req.body.itemName],
        (err, result) => {
            if (err) {
                console.log("Error: " + err);
            } else {
                res.send(result);
            }
        });
});



//SERVER SIDE UPDATE updateQty
router.put("/updateQty/", checkToken, (req, res) => {
    // let sql = `UPDATE items SET stockQty = '${req.body.stockQty.replace(/[&\/\\#,+()$~%'"*?|<>{}“]/g, '')}' WHERE itemName = '${req.body.itemName.replace(/[&\/\\#,+()$~%'"*?|<>{}“]/g, '')}'`;
    let query = db.query(
        `UPDATE items SET stockQty = ? WHERE itemName = ?`,
        [req.body.stockQty, req.body.itemName],
        (err, result) => {
            if (err) {
                console.log("Error: " + err);
            } else {
                res.send(result);
            }
        });
});

//SERVER SIDE UPDATE STOCK QUANTITY AFTER PURCHASE
router.put("/minus-one/", checkToken, (req, res) => {
    // let sql = `UPDATE items SET stockQty = stockQty-1 WHERE itemName = '${req.body.itemName.replace(/[&\/\\#,+()$~%'"*?|<>{}“]/g, '')}'`;
    let query = db.query(
        `UPDATE items SET stockQty = stockQty-1 WHERE itemName = ?`,
        [req.body.itemName],
        (err, result) => {
            if (err) {
                console.log("Error: " + err);
            } else {
                res.send(result);
            }
        });
});


//SERVER SIDE DELETE ITEM BY NAME
router.delete("/delete-item/:itemName", checkToken, (req, res) => {
    //let sql = `DELETE FROM items WHERE itemName = '${req.params.itemName.replace(/[&\/\\#,+()$~%'"*?|<>{}“]/g, '')}'`;
    let query = db.query(
        `DELETE FROM items WHERE itemName = ?`,
        [req.params.itemName],
        (err, result) => {
            if (err) {
                console.log("Error: " + err);
            }
            else {
                res.send(result);
            }
        });
});

module.exports = router;





