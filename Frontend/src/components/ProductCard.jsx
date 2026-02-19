import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  return (
    <div className="product-card">
      {/* ... image and name ... */}
      <button 
        onClick={() => addToCart(product)}
        className="bg-black text-white px-4 py-2"
      >
        Add to Cart
      </button>
    </div>
  );
};