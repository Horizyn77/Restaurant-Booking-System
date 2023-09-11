const restaurant = (db) => {

    async function getTables() {
        // get all the available tables

        const selectQuery = `SELECT * FROM table_booking;`

         const result = await db.many(selectQuery)

         return result
    }

    async function checkTableCapacity(tableId) {

        //check capacity for table using the tableId

        const selectQuery = `SELECT capacity FROM table_booking WHERE id = $1;`

        const result =  await db.one(selectQuery, [tableId]);

        return result.capacity;
    }

    async function bookTable(tableId, username, booking_size, phone_number) {
        // book a table by name

        //update the table in the database after booking with the username, booking_size and phone_number
        //set to the values inputted

        const updateQuery = `UPDATE table_booking 
        SET booked = 'true', username = $1, number_of_people = $2, contact_number = $3 
        WHERE id = $4;`

        await db.none(updateQuery, [username, booking_size, phone_number, tableId])


    }

    async function getBookedTables() {
        // get all the booked tables

        const selectQuery = `SELECT * FROM table_booking WHERE booked = 'true';`;

        const result = db.manyOrNone(selectQuery)

        return result
    }

    async function isTableBooked(tableName) {
        // get booked table by name

        const selectQuery = `SELECT booked FROM table_booking WHERE table_name = $1;`

        const result = await db.one(selectQuery, [tableName])

        return result.booked;
    }

    async function cancelTableBooking(tableName) {
        // cancel a table by name

        //cancel a table booking by updating the table record and setting booked to false
        //and username, number_of_people and contact_number to null

        const updateQuery = `UPDATE table_booking 
        SET booked = 'false', username = null, number_of_people = null, contact_number = null 
        WHERE id = $1;`

        await db.none(updateQuery, [tableName]);
    }

    async function getBookedTablesForUser(username) {
        // get user table booking

        const selectQuery = `SELECT * FROM table_booking WHERE username = $1;`

        const result = await db.manyOrNone(selectQuery, [username]);

        return result;

    }

    return {
        getTables,
        bookTable,
        getBookedTables,
        isTableBooked,
        cancelTableBooking,
        getBookedTablesForUser,
        checkTableCapacity
    }
}

export default restaurant;