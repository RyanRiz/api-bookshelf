import db from "../configs/db.js";

async function borrowBook(req, res) {
    try {
        const { bookId, borrowedDate, dueDate } = req.body;
        const { userId } = req.params;
        const created = new Date().toISOString();
        const updated = created;
        const bookRef = db.collection("books").doc(bookId);
        const bookDoc = await bookRef.get();

        if (!bookDoc.exists) {
            return res.status(404).json({
                status: "error",
                error: "Book not found"
            });
        }

        await db.collection("users").doc(userId).collection("borrowedBooks").doc(bookId).set({
            borrowedDate: borrowedDate,
            dueDate: dueDate,
            createdAt: created,
            updatedAt: updated
        });

        res.status(201).json({
            status: "success",
            message: "Book borrowed successfully"
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            error: error.message
        });
    }
}

async function returnBook(req, res) {
    try {
        const { bookId, userId } = req.params;
        const borrowedBookRef = db.collection("users").doc(userId).collection("borrowedBooks").doc(bookId);
        const borrowedBookDoc = await borrowedBookRef.get();

        if (!borrowedBookDoc.exists) {
            return res.status(404).json({
                status: "error",
                error: "Book not found"
            });
        }

        await borrowedBookRef.delete();

        res.status(200).json({
            status: "success",
            message: "Book returned successfully"
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            error: error.message
        });
    }
}

export default { 
    borrowBook, 
    returnBook 
};