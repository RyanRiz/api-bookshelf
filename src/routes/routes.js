import express from 'express';
import userControllers from '../controllers/userControllers.js';
import bookControllers from '../controllers/bookControllers.js';
import borrowBookControllers from '../controllers/borrowBookControllers.js';

const router = express.Router();
const route = "/api";

// User routes
router.get(`${route}/users`, userControllers.getUsers);
router.post(`${route}/users`, userControllers.createUsers);
router.get(`${route}/users/:docId`, userControllers.getUserById);
router.put(`${route}/users/:docId`, userControllers.editUserById);
router.delete(`${route}/users/:docId`, userControllers.deleteUserById);

// Book routes
router.get(`${route}/books`, bookControllers.getBooks);
router.post(`${route}/books`, bookControllers.createBooks);
router.get(`${route}/books/:docId`, bookControllers.getBookById);
router.put(`${route}/books/:docId`, bookControllers.editBookById);
router.delete(`${route}/books/:docId`, bookControllers.deleteBookById);

// Borrow book routes
router.post(`${route}/users/:userId/borrow`, borrowBookControllers.borrowBook);
router.delete(`${route}/users/:userId/return/:bookId`, borrowBookControllers.returnBook);

export default router;