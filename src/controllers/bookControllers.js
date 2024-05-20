import db from "../configs/db.js";

async function getBooks(req, res) {
    try {
        const books = [];
        const booksRef = db.collection("books");
        const snapshot = await booksRef.get();
        snapshot.forEach((doc) => {
            books.push({ _id: doc.id, ...doc.data() });
        });
        res.status(200).json({
            status: "success",
            data: books
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            error: error.message
        });
    }
}

async function createBooks(req, res) {
    try {
        const { title, author, year } = req.body;
        const created = new Date().toISOString();
        const updated = created;
        const book = {
            title: title,
            author: author,
            year: year,
            createdAt: created,
            updatedAt: updated
        };

        await db.collection("books").doc().set(book);
        res.status(201).json({
            status: "success",
            message: "Book created successfully"
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            error: error.message
        });
    }
}

async function getBookById(req, res) {
    try {
        const { docId } = req.params;
        const book = await db.collection("books").doc(docId).get();
        if (!book.exists) {
            res.status(404).json({
                status: "error",
                error: "Book not found"
            });
        } else {
            res.status(200).json(book.data());
        }
    } catch (error) {
        res.status(500).json({
            status: "error",
            error: error.message
        });
    }
}

async function editBookById(req, res) {
    try {
        const { docId } = req.params;
        const { title, author, year } = req.body;
        const updated = new Date().toISOString();
        const book = {
            title: title,
            author: author,
            year: year,
            updatedAt: updated
        };

        await db.collection("books").doc(docId).update(book);
        res.status(200).json({
            status: "success",
            message: "Book updated successfully"
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            error: error.message
        });
    }
}

async function deleteBookById(req, res) {
    try {
        const { docId } = req.params;
        await db.collection("books").doc(docId).delete();
        res.status(200).json({
            status: "success",
            message: "Book deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            error: error.message
        });
    }
}

export default {
    getBooks,
    createBooks,
    getBookById,
    editBookById,
    deleteBookById
};