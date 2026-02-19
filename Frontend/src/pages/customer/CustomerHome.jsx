import { useNavigate, Link } from "react-router-dom";

export default function CustomerHome() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user_data")) || { name: "Customer" };

  const cards = [
    {
      title: "My Wishlist",
      label: "Wishlist",
      description: "View your saved products",
      route: "/customer/wishlist",
      cta: "View All →"
    },
    {
      title: "Order History",
      label: "Orders",
      description: "Track your past orders",
      route: "/customer/orders",
      cta: "View Orders →"
    },
    {
      title: "My Cart",
      label: "Cart",
      description: "Manage your shopping bag",
      route: "/customer/cart",
      cta: "Go to Cart →"
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Header Section */}
      <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm mb-10 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-center md:text-left">
          <h2 className="text-4xl font-bold text-gray-900 tracking-tighter mb-1">
            Hello, <span className="text-red-500">{user?.name}!</span>
          </h2>
          <p className="text-gray-500 font-medium">Welcome back to Kitchen Galaxy. Ready to upgrade your kitchen?</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, index) => (
          <Link
            key={index}
            to={card.route}
            className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-100 flex flex-col justify-between min-h-[160px] hover:border-red-200 transition-all hover:shadow-md group"
          >
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 group-hover:text-red-400">{card.label}</p>
              <div className="text-2xl font-bold text-gray-900 mb-1">{card.title}</div>
              <p className="text-sm text-gray-500 font-medium">{card.description}</p>
            </div>
            <div className="mt-4 text-[10px] font-bold text-gray-400 group-hover:text-red-500 uppercase tracking-widest">
              {card.cta}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}