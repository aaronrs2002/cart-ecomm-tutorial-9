const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const path = require("path");
const db = require("./config/db");
const { checkToken } = require("./auth/token_validation");
const { genSaltSync, hashSync, compareSync } = require("bcrypt");
const { sign } = require("jsonwebtoken");
const jwtKey = require("./config/jwt-key");

const app = express();

app.use(bodyParser.json());


//START CREATE USER
const create = (data, callback) => {
    db.query(
        `insert into user(email,level,password)
                      values(?,?,?)`,
        [data.email, data.level, data.password],
        (error, results, fields) => {
            if (error) {
                return callback(error);
            }
            return callback(null, results);
        }
    );
};

app.post("/newUser", (req, res) => {
    const body = req.body;

    console.log("JSON.stringify(req.body): " + JSON.stringify(req.body));


    const salt = genSaltSync(10);
    body.password = hashSync(body.password, salt);
    create(body, (err, results) => {
        if (err) {
            return res.status(500).json({
                success: 0,
                message: "There was 500 error: " + err,
            });
        }
        return res.status(200).json({
            success: 1,
            data: results,
        });
    });
});

//END CREATE USER


const getUserByUserEmail = (email, callback) => {
    db.query(
        `SELECT * FROM user WHERE email = ?`,
        [email],
        (error, results, fields) => {
            if (error) {
                return callback(error);
            }
            return callback(null, results[0]);

        }
    )
}

app.post("/login", (req, res) => {
    const body = req.body;
    getUserByUserEmail(body.email.replace(/[&\/\\#,+()$~%'"*?|<>{}“]/g, ''), (err, results) => {
        if (err) {
            console.log(err);
            if (err === "ECONNRESET") {
                console.log("WAKE UP CONNECTION! " + err);
            }
        }
        if (!results) {
            return res.json({
                success: 0,
                data: "Invalid email or password NO RESULTS: " + body.email,
            })
        }
        const result = compareSync(body.password, results.password);
        if (result) {
            results.password = undefined;
            const jsontoken = sign(
                {
                    results: results
                },
                jwtKey,
                {
                    expiresIn: "1h",
                }
            );

            if (jsontoken) {
                //let sql = `UPDATE user SET token = '${jsontoken}' WHERE email = "${body.email.replace(/[&\/\\#,+()$~%'"*?|<>{}“]/g, '')}"`;
                let query = db.query(
                    `UPDATE user SET token = ? WHERE email = ?`,
                    [jsontoken, body.email],
                    (err, result) => {
                        if (err) {
                            console.log("There was an error on the server side: " + err);
                        } else {
                            console.log("Here is the token result: " + JSON.stringify(result));
                        }
                    });
                console.log("trying to fire saved token.");
            }

            return res.json({
                success: 1,
                message: "Login Successful",
                token: jsontoken,
                id: results.id,
            })
        } else {
            return res.json({
                success: 0,
                data: "Invalid email or password COMPARISON FAIL."
            });
        }
    });
});

//START LOGOUT

app.put("/logout-uuid", checkToken, (req, res) => {
    //let sql = `UPDATE user SET token = '${req.body.uuid.replace(/[&\/\\#,+()$~%'"*?|<>{}“]/g, '')}' WHERE email = "${req.body.email.replace(/[&\/\\#,+()$~%'"*?|<>{}“]/g, '')}"`;
    let query = db.query(
        `UPDATE user SET token = ? WHERE email = ?`,
        [req.body.uuid, req.body.email],
        (err, result) => {
            if (err) {
                res.send("Setting logout token failed. " + err);
            } else {

                res.send("logout uuid saved.");
            }
        })
});


//START DELETE USER
app.delete("/delete-user/:email", checkToken, (req, res) => {
    //let sql = "DELETE FROM user WHERE email = '" + req.params.email.replace(/[&\/\\#,+()$~%'"*?|<>{}“]/g, '') + "'";
    let query = db.query(
        "DELETE FROM user WHERE email = ?",
        [req.params.email],
        (err, result) => {
            if (err) {
                console.log(err);
            } else {
                console.log(result);
                res.send(req.params);
            }
        })
});


//START EDIT LEVEL 
app.put("/edit-level", checkToken, (req, res) => {
    //let sql = `UPDATE user SET level = '${req.body.level.replace(/[&\/\\#,+()$~%'"*?|<>{}“]/g, '')}WHERE email = "${req.body.email.replace(/[&\/\\#,+()$~%'"*?|<>{}“]/g, '')}"`;
    let query = db.query(
        `UPDATE user SET level = ? WHERE email = ?`,
        [req.body.level, req.body.email],
        (err, result) => {
            if (err) {
                console.log(err);
            } else {
                console.log(result);
                res.send(result);
            }
        });
});

//START GET LEVEL
app.get("/level/:email", checkToken, (req, res) => {
    //let sql = `SELECT level FROM user WHERE email = '${req.params.email.replace(/[&\/\\#,+()$~%'"*?|<>{}“]/g, '')}'`;
    let query = db.query(
        `SELECT level FROM user WHERE email = ?`,
        [req.params.email],
        (err, result) => {
            if (err) {
                console.log(err);
            } else {
                res.json(results);
            }
        });
});

//START REFRESH
app.get("/check-token/:email", checkToken, (req, res) => {

    //let sql = `SELECT token FROM user WHERE email = '${req.params.email.replace(/[&\/\\#,+()$~%'"*?|<>{}“]/g, '')}'`;
    let query = db.query(
        `SELECT token FROM user WHERE email = ?`,
        [req.params.email],
        (err, results) => {
            if (err) {
                console.log("check for token: " + err);
            } else {
                res.send(results);
            }
        });
});

//START CHANGE PASSWORD

app.put("/change-password", checkToken, (req, res) => {
    const body = req.body;
    const salt = genSaltSync(10);
    body.password = hashSync(body.password, salt);
    //let sql = `UPDATE user SET password = '${body.password}' WHERE email = '${body.email.replace(/[&\/\\#,+()$~%'"*?|<>{}“]/g, '')}'`;
    let query = db.query(
        `UPDATE user SET password = ? WHERE email = ?`,
        [body.password, body.email],
        (err, result) => {
            if (err) {
                console.log(err);
            } else {
                console.log(result);
                res.send(result);
            }
        })

});


///start api routes
app.use("/api/purchaseLog/", require("./routes/api/purchaseLog"));
app.use("/api/items/", require("./routes/api/items"));
app.use("/api/reviews/", require("./routes/api/reviews"));
app.use("/api/inventory/", require("./routes/api/inventory"));


if (process.env.NODE_ENV === "production") {
    app.use(express.static("client/build"));

    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));

    });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`You fired up PORT ${PORT} successfully.`));
