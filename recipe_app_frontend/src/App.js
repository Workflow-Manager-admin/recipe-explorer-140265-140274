import React, { useState, useEffect } from 'react';
import './App.css';

// Color Palette from requirements
const PALETTE = {
  primary: '#FF7043',
  secondary: '#FFA726',
  accent: '#66BB6A',
};

// -- Utility function for API calls (placeholder) --
const API_BASE_URL = "http://localhost:5000/api"; // To be replaced with backend URL

// PUBLIC_INTERFACE
function fetchRecipes(query = "", category = "") {
  /**
   * Fetches recipes from the backend via REST API.
   * @param {string} query Search query.
   * @param {string} category Category filter.
   * @returns {Promise<Array>} List of recipes.
   */
  let url = `${API_BASE_URL}/recipes`;
  const params = [];
  if (query) params.push(`q=${encodeURIComponent(query)}`);
  if (category) params.push(`category=${encodeURIComponent(category)}`);
  if (params.length > 0) url += `?${params.join('&')}`;
  return fetch(url).then(res => res.json());
}

// PUBLIC_INTERFACE
function fetchCategories() {
  /**
   * Fetches recipe categories from backend.
   * @returns {Promise<Array>} List of categories.
   */
  return fetch(`${API_BASE_URL}/categories`).then(res => res.json());
}

// PUBLIC_INTERFACE
function fetchRecipeDetail(id) {
  /**
   * Fetches detailed info for a recipe by ID.
   * @param {string} id Recipe ID.
   * @returns {Promise<Object>} The recipe object.
   */
  return fetch(`${API_BASE_URL}/recipes/${id}`).then(res => res.json());
}

// -- Header with search bar --
function Header({ onSearch }) {
  const [search, setSearch] = useState('');
  return (
    <header className="header">
      <h1 className="brand">Recipe Explorer</h1>
      <form
        className="searchbar"
        onSubmit={e => {
          e.preventDefault();
          onSearch(search.trim());
        }}
      >
        <input
          className="search-input"
          type="text"
          placeholder="Search recipes..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          aria-label="Search recipes"
        />
        <button className="search-btn" type="submit">
          🔍
        </button>
      </form>
    </header>
  );
}

// -- Sidebar for categories --
function Sidebar({ categories, activeCategory, onSelectCategory }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-title">Categories</div>
      <ul className="category-list">
        <li
          className={activeCategory === "" ? "active" : ""}
          key="all"
          onClick={() => onSelectCategory("")}
        >
          All
        </li>
        {categories.map(cat => (
          <li
            key={cat}
            className={activeCategory === cat ? "active" : ""}
            onClick={() => onSelectCategory(cat)}
          >
            {cat}
          </li>
        ))}
      </ul>
    </aside>
  );
}

// -- Recipe Card --
function RecipeCard({ recipe, onClick }) {
  return (
    <div className="recipe-card" onClick={() => onClick(recipe)}>
      <div className="recipe-thumb">
        <img src={recipe.image || "/default-thumb.png"} alt={recipe.title} />
      </div>
      <div className="recipe-info">
        <h3 className="recipe-title">{recipe.title}</h3>
        <p className="recipe-category">{recipe.category}</p>
      </div>
    </div>
  );
}

// -- Recipes grid
function RecipesGrid({ recipes, onRecipeClick }) {
  if (!recipes.length) {
    return <div className="recipes-empty">No recipes found.</div>;
  }
  return (
    <div className="recipes-grid">
      {recipes.map(recipe => (
        <RecipeCard key={recipe.id} recipe={recipe} onClick={onRecipeClick} />
      ))}
    </div>
  );
}

// -- Recipe Detail Modal
function RecipeDetailModal({ recipe, onClose }) {
  if (!recipe) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          &times;
        </button>
        <h2 className="detail-title">{recipe.title}</h2>
        <img className="detail-image" src={recipe.image || "/default-thumb.png"} alt={recipe.title} />
        <div className="detail-meta">
          <span className="detail-category">{recipe.category}</span>
          {recipe.time && <span className="detail-time">⏱ {recipe.time} min</span>}
        </div>
        <div className="detail-summary">{recipe.description || ''}</div>
        <div className="detail-section">
          <h4>Ingredients</h4>
          <ul className="ingredients-list">
            {(recipe.ingredients || []).map((ing, i) => (
              <li key={i}>{ing}</li>
            ))}
          </ul>
        </div>
        <div className="detail-section">
          <h4>Instructions</h4>
          <ol className="instructions-list">
            {(recipe.instructions || []).map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

// -- Main App --
function App() {
  const [recipes, setRecipes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories()
      .then(data => setCategories(data))
      .catch(() => setCategories(['Breakfast', 'Lunch', 'Dinner', 'Dessert']));
  }, []);

  // Fetch recipes whenever search or category changes
  useEffect(() => {
    setLoading(true);
    fetchRecipes(searchQuery, activeCategory)
      .then(data => {
        setRecipes(data);
        setLoading(false);
      })
      .catch(() => {
        setRecipes([]);
        setLoading(false);
      });
  }, [searchQuery, activeCategory]);

  // Handler for clicking a recipe - fetch recipe detail and open modal
  const handleRecipeClick = (recipe) => {
    fetchRecipeDetail(recipe.id)
      .then(detail => {
        setSelectedRecipe(detail);
      })
      .catch(() => setSelectedRecipe(recipe)); // fallback: basic info
  };

  // Handler for closing modal
  const handleCloseModal = () => setSelectedRecipe(null);

  return (
    <div className="main-layout">
      <Header onSearch={q => setSearchQuery(q)} />
      <div className="content-area">
        <Sidebar
          categories={categories}
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
        />
        <main className="main-content">
          {loading ? (
            <div className="loader">Loading recipes...</div>
          ) : (
            <RecipesGrid recipes={recipes} onRecipeClick={handleRecipeClick} />
          )}
        </main>
      </div>
      <RecipeDetailModal recipe={selectedRecipe} onClose={handleCloseModal} />
      <footer className="footer">
        &copy; {new Date().getFullYear()} Recipe Explorer &middot; Built with <span style={{ color: PALETTE.primary }}>React</span>
      </footer>
    </div>
  );
}

export default App;
