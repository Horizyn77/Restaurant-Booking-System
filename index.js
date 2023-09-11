import express from "express";
import pgp from "pg-promise";
import exphbs from "express-handlebars";
import bodyParser from "body-parser";
import session from "express-session"
import flash from "express-flash";
import 'dotenv/config';

import RestaurantTableBooking from "./services/restaurant.js";

const app = express()

const DATABASE_URL = '';

const connectionString = process.env.DATABASE_URL || DATABASE_URL;
const db = pgp()(connectionString);

const restaurantTableBooking = RestaurantTableBooking(db);

app.use(express.static('public'));
app.use(session({
    secret: 'secret key',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 60000
    }
}))
app.use(flash());

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const handlebarSetup = exphbs.engine({
    partialsDir: "./views/partials",
    viewPath: './views',
    layoutsDir: './views/layouts'
});

app.engine('handlebars', handlebarSetup);
app.set('view engine', 'handlebars');


//render the homepage with a list of all table and send flash messages in
app.get("/", async (req, res) => {
    const tables = await restaurantTableBooking.getTables();

    res.render('index', { tables, messages: req.flash() })
});

//book a table, check if booking size is more than table capacity then send an error
//otherwise book a table and send a success message and then redirect to homepage

app.post("/book", async (req, res) => {
    const { tableId, username, booking_size, phone_number } = req.body;

    if (booking_size > await restaurantTableBooking.checkTableCapacity(tableId)) {
        req.flash("error", "Number of customers is bigger than the tables capacity")
    } else {
        await restaurantTableBooking.bookTable(tableId, username, booking_size, phone_number);
        req.flash("success", "The selected table has been booked")
    }

    res.redirect("/")

    // await restaurantTableBooking.bookTable(tableId, username, booking_size, phone_number);



})


//call query that gets all booked tables and render the result on the bookings page
app.get("/bookings", async (req, res) => {
    const tables = await restaurantTableBooking.getBookedTables();

    res.render('bookings', { tables })
});


//check params for username and send that into function that gets the table booked for that
//username and render the page for it
app.get("/bookings/:username", async (req, res) => {

    const username = req.params.username;

    const tables = await restaurantTableBooking.getBookedTablesForUser(username)

    res.render("bookingsUser", { tables })
})


//get table id for table that is being cancelled and send that value into the function
//for cancelling the table and redirect afterwards to /bookings
app.post("/cancel", async (req, res) => {
    const tableId = req.body.tableId;

    await restaurantTableBooking.cancelTableBooking(tableId);

    res.redirect("/bookings")
})

var portNumber = process.env.PORT || 3000;

//start everything up
app.listen(portNumber, function () {
    console.log('🚀  server listening on:', portNumber);
});