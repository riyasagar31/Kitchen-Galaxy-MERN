import { useEffect, useState } from "react";

export default function CustomerProducts() {
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    // Replace with your actual API call for wishlist/saved items
    fetch("/api/customer/wishlist")
      .then((res) => res.json())
      .then((data) => setWishlist(data))
      .catch(() => setWishlist([]));
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        My Wishlist / Saved Items
      </h2>

      {wishlist.length === 0 ? (
        <p className="text-gray-600">You haven't saved any products yet.</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Image
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Name
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Price
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Seller
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {wishlist.map((item, index) => (
                <tr key={index}>
                  <td className="px-4 py-2">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-10 w-10 object-cover rounded"
                    />
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700">{item.name}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">₹{item.price}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{item.seller}</td>
                  <td className="px-4 py-2 text-sm">
                    <button
                      onClick={() => {
                        // Example remove action
                        setWishlist(wishlist.filter((w) => w.id !== item.id));
                      }}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Remove
                    </button>
                    <button
                      onClick={() => {
                        // Example move to cart action
                        alert(`Moved ${item.name} to cart`);
                      }}
                      className="ml-3 text-primary hover:text-primary-hover text-sm font-medium"
                    >
                      Move to Cart
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
