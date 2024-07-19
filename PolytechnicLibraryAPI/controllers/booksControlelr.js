const Book = require("../models/book");

const getAllBooks = async (req, res) => {
  try {

    //Need middleware for this
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    // console.log(req.user);
    const books = await Book.getAllBooks();
    const result = {
      role:req.user.role,
      books:books
    };
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving books");
  }
};

const updateBookAvalibility = async (req, res) => {
    const bookId = parseInt(req.params.bookId);
    const newBookAvailability = req.body.newAvailability;
    console.log(req.body)
    try {
      const updatedBook = await Book.updateBookAvailability(bookId, newBookAvailability);
      if (!updatedBook) {
        return res.status(404).send("Book not found.");
      }
      res.json(updatedBook);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error updating book");
    }
};

const getBookById = async (req, res) => {
    const bookId = parseInt(req.params.id);
    try {
      const book = await Book.getBookById(bookId);
      if (!book) {
        return res.status(404).send("Book not found");
      }
      res.json(book);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error retrieving book");
    }
};

module.exports ={
    getAllBooks,
    updateBookAvalibility,
    getBookById
}