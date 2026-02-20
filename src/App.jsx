import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = import.meta.env.PROD 
  ? 'https://book-library-api-production-f059.up.railway.app/api/books'
  : 'http://localhost:3001/api/books';

function App() {
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form state - UPDATED
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    year: '',
    category: 'Fiction',
    rating: 0,
    notes: ''
  });

  // Fetch books on component mount
  useEffect(() => {
    fetchBooks();
  }, []);

  // Update filteredBooks when books change
  useEffect(() => {
    setFilteredBooks(books);
  }, [books]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      setBooks(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch books');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const searchBooks = async (query) => {
    if (query.trim() === '') {
      setFilteredBooks(books);
      return;
    }
    
    try {
      const response = await axios.get(`http://localhost:3001/api/books/search/${query}`);
      setFilteredBooks(response.data);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const addBook = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.author || !formData.year) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const response = await axios.post(API_URL, {
        ...formData,
        year: parseInt(formData.year)
      });
      
      setBooks([...books, response.data]);
      
      // Clear form
      setFormData({
        title: '',
        author: '',
        year: '',
        category: 'Fiction',
        rating: 0,
        notes: ''
      });
    } catch (err) {
      alert('Failed to add book');
      console.error(err);
    }
  };

  const deleteBook = async (id) => {
    if (!window.confirm('Are you sure you want to delete this book?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/${id}`);
      setBooks(books.filter(book => book.id !== id));
    } catch (err) {
      alert('Failed to delete book');
      console.error(err);
    }
  };

  if (loading) return <div className="loading">Loading books...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="app">
      <h1>📚 Book Library</h1>
      
      {/* Search Bar */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search books by title or author..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            searchBooks(e.target.value);
          }}
          className="search-input"
        />
      </div>

      {/* Add Book Form - UPDATED */}
      <div className="add-book-section">
        <h2>Add New Book</h2>
        <form onSubmit={addBook} className="book-form">
          <input
            type="text"
            placeholder="Book Title"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
          />
          
          <input
            type="text"
            placeholder="Author"
            value={formData.author}
            onChange={(e) => setFormData({...formData, author: e.target.value})}
            required
          />
          
          <input
            type="number"
            placeholder="Year"
            value={formData.year}
            onChange={(e) => setFormData({...formData, year: e.target.value})}
            required
          />
          
          <select
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
            className="category-select"
          >
            <option value="Fiction">Fiction</option>
            <option value="Non-Fiction">Non-Fiction</option>
            <option value="Science Fiction">Science Fiction</option>
            <option value="Mystery">Mystery</option>
            <option value="Biography">Biography</option>
            <option value="Romance">Romance</option>
            <option value="History">History</option>
            <option value="Self-Help">Self-Help</option>
            <option value="Other">Other</option>
          </select>
          
          <div className="rating-input">
            <label>Rating: </label>
            {[1, 2, 3, 4, 5].map(star => (
              <span
                key={star}
                onClick={() => setFormData({...formData, rating: star})}
                className={star <= formData.rating ? 'star filled' : 'star'}
              >
                ★
              </span>
            ))}
            <span className="rating-text">
              {formData.rating === 0 ? 'No rating' : `${formData.rating} stars`}
            </span>
          </div>
          
          <textarea
            placeholder="Personal notes (optional)"
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            rows="3"
            className="notes-input"
          />
          
          <button type="submit">Add Book</button>
        </form>
      </div>

      {/* Books List - UPDATED */}
      <div className="books-section">
        <h2>All Books ({filteredBooks.length})</h2>
        
        {filteredBooks.length === 0 ? (
          <p className="no-books">No books found</p>
        ) : (
          <div className="books-grid">
            {filteredBooks.map(book => (
              <div key={book.id} className="book-card">
                <div className="book-header">
                  <h3>{book.title}</h3>
                  <span className="category-badge">{book.category}</span>
                </div>
                
                <p className="author">by {book.author}</p>
                <p className="year">Published: {book.year}</p>
                
                <div className="rating-display">
                  {book.rating > 0 ? (
                    <>
                      {'★'.repeat(book.rating)}
                      {'☆'.repeat(5 - book.rating)}
                      <span className="rating-number">({book.rating}/5)</span>
                    </>
                  ) : (
                    <span className="no-rating">No rating</span>
                  )}
                </div>
                
                {book.notes && (
                  <p className="book-notes">"{book.notes}"</p>
                )}
                
                <button 
                  onClick={() => deleteBook(book.id)}
                  className="delete-btn"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;