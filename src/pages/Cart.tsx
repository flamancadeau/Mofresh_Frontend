import { Header } from '@/components/ui/Header';
import { Footer } from '@/components/ui/Footer';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearCart, removeFromCart } from '@/store/cartSlice';

function Cart() {
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.cart.items);

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <>
      <Header />
      <main className="w-full max-w-[1728px] mx-auto px-4 sm:px-8 lg:px-16 py-8 lg:py-12 min-h-[60vh]">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
          Your Cart
        </h1>

        {items.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-300">
            Your cart is empty. Add some fresh products to get started.
          </p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-8">
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                  />
                  <div className="flex-1">
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                      {item.name}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {item.price} {item.unit}
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                      Qty: <span className="font-semibold">{item.quantity}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => dispatch(removeFromCart(item.id))}
                    className="text-sm font-medium text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <aside className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Order Summary
                </h2>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-300">
                    Items
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {items.length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-base font-semibold mt-2">
                  <span className="text-gray-900 dark:text-white">
                    Total
                  </span>
                  <span className="text-[#1a5e3f] dark:text-[#8bc34a]">
                    {total.toLocaleString()} Rwf
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <button className="w-full bg-[#1a5e3f] hover:bg-[#15452f] text-white rounded-xl py-3 font-semibold transition-colors">
                  Proceed to Checkout
                </button>
                <button
                  onClick={() => dispatch(clearCart())}
                  className="w-full border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-xl py-3 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Clear Cart
                </button>
              </div>
            </aside>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

export default Cart;

