import { useState } from "react";

// Styles
import { GLOBAL_CSS } from "./styles/theme";

// Hooks
import useBreakpoint    from "./hooks/useBreakpoint";
import useToast         from "./hooks/useToast";
import useCart          from "./hooks/useCart";
import useWishlist      from "./hooks/useWishlist";
import useProducts      from "./hooks/useProducts";

// Layout components
import DesktopHeader  from "./components/DesktopHeader";
import MobileHeader   from "./components/MobileHeader";
import MobileNav      from "./components/MobileNav";
import Footer         from "./components/Footer";
import CartDrawer     from "./components/CartDrawer";
import Toast          from "./components/Toast";

// Pages
import HomePage          from "./pages/HomePage";
import ShopPage          from "./pages/ShopPage";
import SearchPage        from "./pages/SearchPage";
import WishlistPage      from "./pages/WishlistPage";
import ProfilePage       from "./pages/ProfilePage";
import ProductDetailPage from "./pages/ProductDetailPage";

export default function App() {
  const { isMobile, isTablet, isDesktop } = useBreakpoint();

  // ── Navigation state ──
  const [activeTab,      setActiveTab]      = useState("home");
  const [selectedProduct,setSelectedProduct]= useState(null);

  // ── Filter / sort state ──
  const [search,      setSearch]      = useState("");
  const [catFilter,   setCatFilter]   = useState("All");
  const [brandFilter, setBrandFilter] = useState("All");
  const [maxPrice,    setMaxPrice]    = useState(5000);
  const [sortBy,      setSortBy]      = useState("popular");

  // ── UI state ──
  const [showCart,   setShowCart]   = useState(false);
  const [orderDone,  setOrderDone]  = useState(false);

  // ── Hooks ──
  const { toast, showToast }                                               = useToast();
  const { cart, cartCount, cartTotal, deliveryFee, grandTotal, addToCart, removeFromCart, updateQty, clearCart } = useCart(showToast);
  const { wishlist, toggleWishlist, isWishlisted }                        = useWishlist(showToast);
  const filteredProducts = useProducts({ search, catFilter, brandFilter, maxPrice, sortBy });

  // ── Shared handler: checkout ──
  const handleCheckout = () => {
    clearCart();
    setShowCart(false);
    setOrderDone(true);
    setActiveTab("profile");
    showToast("Order placed! 🎉");
  };

  // ── Common props passed to every page ──
  const pageProps = {
    isMobile, isTablet, isDesktop,
    onAddToCart:   addToCart,
    onToggleWish:  toggleWishlist,
    isWishlisted,
    onSelectProduct: (p) => setSelectedProduct(p),
  };

  // ── Render ──
  return (
    <div style={{ fontFamily: "'Palatino Linotype', Palatino, Georgia, serif", background: "#FFFAF8", minHeight: "100vh" }}>
      <style>{GLOBAL_CSS}</style>

      {/* ── Headers ── */}
      {isMobile ? (
        <MobileHeader
          setActiveTab={setActiveTab}
          cartCount={cartCount}
          onCartOpen={() => setShowCart(true)}
        />
      ) : (
        <DesktopHeader
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          search={search}
          setSearch={setSearch}
          catFilter={catFilter}
          setCatFilter={setCatFilter}
          wishlistCount={wishlist.length}
          cartCount={cartCount}
          onCartOpen={() => setShowCart(true)}
        />
      )}

      {/* ── Product detail view (full page, overrides tab) ── */}
      {selectedProduct ? (
        <ProductDetailPage
          product={selectedProduct}
          {...pageProps}
          onBack={() => setSelectedProduct(null)}
        />
      ) : (
        <main>
          {activeTab === "home" && (
            <HomePage
              {...pageProps}
              setActiveTab={setActiveTab}
              setCatFilter={setCatFilter}
            />
          )}

          {activeTab === "shop" && (
            <ShopPage
              {...pageProps}
              filteredProducts={filteredProducts}
              catFilter={catFilter}   setCatFilter={setCatFilter}
              brandFilter={brandFilter} setBrandFilter={setBrandFilter}
              maxPrice={maxPrice}     setMaxPrice={setMaxPrice}
              sortBy={sortBy}         setSortBy={setSortBy}
            />
          )}

          {activeTab === "search" && (
            <SearchPage
              {...pageProps}
              search={search}
              setSearch={setSearch}
              filteredProducts={filteredProducts}
            />
          )}

          {activeTab === "wishlist" && (
            <WishlistPage
              {...pageProps}
              wishlist={wishlist}
              onNavigateShop={() => setActiveTab("shop")}
            />
          )}

          {activeTab === "profile" && (
            <ProfilePage
              isMobile={isMobile}
              wishlistCount={wishlist.length}
              orderPlaced={orderDone}
            />
          )}
        </main>
      )}

      {/* ── Footer (desktop only) ── */}
      {!isMobile && !selectedProduct && <Footer />}

      {/* ── Mobile bottom nav ── */}
      {isMobile && (
        <MobileNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          wishlistCount={wishlist.length}
        />
      )}

      {/* ── Cart drawer ── */}
      <CartDrawer
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        cart={cart}
        cartCount={cartCount}
        cartTotal={cartTotal}
        deliveryFee={deliveryFee}
        grandTotal={grandTotal}
        updateQty={updateQty}
        removeFromCart={removeFromCart}
        onCheckout={handleCheckout}
        isMobile={isMobile}
        onNavigateShop={() => setActiveTab("shop")}
      />

      {/* ── Toast notification ── */}
      <Toast msg={toast} />
    </div>
  );
}
