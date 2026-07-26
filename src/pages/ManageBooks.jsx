import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getBooks, deleteBook } from '../utils/storage';
import './ManageBooks.css';

const ManageBooks = () => {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    getBooks().then(data => setBooks(data));
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to remove this book?")) {
      const updated = await deleteBook(id);
      setBooks(updated);
    }
  };

  return (
    <main className="manage-page container fade-up">
      <div className="manage-header">
        <h1 className="manage-title">Manage Books</h1>
        <Link to="/add-book" className="btn btn-navy">📋 Add New Book</Link>
      </div>

      <div className="manage-content">
        {books.length === 0 ? (
          <div className="manage-empty">
            <p>No books found.</p>
            <Link to="/add-book" className="btn btn-navy">List your first book</Link>
          </div>
        ) : (
          <div className="manage-table-wrap">
            <table className="manage-table">
              <thead>
                <tr>
                  <th>Book</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {books.map(b => (
                  <tr key={b.id}>
                    <td>
                      <div className="manage-book-cell">
                        <img src={b.coverUrl} alt={b.title} className="manage-thumb" />
                        <div className="manage-book-info">
                          <div className="manage-book-title">{b.title}</div>
                          <div className="manage-book-author">by {b.author}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="manage-cat-badge">{b.category}</span></td>
                    <td>
                      <div className="manage-price-col">
                        <span className="manage-price">₹{b.price}</span>
                        {b.oldPrice && <span className="manage-oldprice">₹{b.oldPrice}</span>}
                      </div>
                    </td>
                    <td>
                      <div className="manage-actions">
                        <Link to={`/book/${b.id}`} className="btn-icon view-btn" title="View">👁️</Link>
                        <button className="btn-icon delete-btn" title="Delete" onClick={() => handleDelete(b.id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
};

export default ManageBooks;
