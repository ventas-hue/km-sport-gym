"use client";

import { useEffect, useState } from "react";
import { Truck, Plus, X, Trash2 } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

interface PurchaseItem {
  id: string;
  quantity: number;
  unitCost: number;
  subtotal: number;
  product: { name: string };
}

interface Purchase {
  id: string;
  supplier: string;
  notes: string | null;
  totalAmount: number;
  paymentMethod: string;
  createdAt: string;
  items: PurchaseItem[];
}

interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
}

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [supplier, setSupplier] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("efectivo");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [addProductId, setAddProductId] = useState("");
  const [addQty, setAddQty] = useState("1");
  const [addCost, setAddCost] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchAll = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/purchases").then((r) => r.json()),
      fetch("/api/products").then((r) => r.json()),
    ])
      .then(([p, pr]) => {
        setPurchases(p);
        setProducts(pr);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const addToCart = () => {
    if (!addProductId || !addCost) return;
    const product = products.find((p) => p.id === addProductId);
    if (!product) return;
    setCart([...cart, {
      productId: addProductId,
      productName: product.name,
      quantity: parseInt(addQty) || 1,
      unitCost: parseFloat(addCost),
    }]);
    setAddProductId("");
    setAddQty("1");
    setAddCost("");
  };

  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) { alert("Agrega al menos un producto"); return; }
    const res = await fetch("/api/purchases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        supplier,
        notes,
        paymentMethod,
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitCost: item.unitCost,
        })),
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      alert(err.error || "Error al registrar compra");
      return;
    }
    setShowForm(false);
    setSupplier("");
    setNotes("");
    setPaymentMethod("efectivo");
    setCart([]);
    fetchAll();
  };

  const monthTotal = purchases
    .filter((p) => {
      const d = new Date(p.createdAt);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, p) => sum + p.totalAmount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-8 lg:pt-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Truck className="text-blue-500" /> Compras
          </h1>
          <p className="text-gray-500 mt-1">Registro de compras de inventario</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-sm"
        >
          <Plus size={20} /> Nueva Compra
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Compras del Mes</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">${monthTotal.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Total de Compras</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{purchases.length}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      ) : purchases.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 text-center py-12 text-gray-400">
          <Truck size={48} className="mx-auto mb-3 opacity-50" />
          <p>No hay compras registradas</p>
        </div>
      ) : (
        <div className="space-y-3">
          {purchases.map((p) => (
            <div key={p.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div
                className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Truck size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{p.supplier}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(p.createdAt).toLocaleDateString("es-MX")} · {p.items.length} producto{p.items.length > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-600 text-lg">${p.totalAmount.toFixed(2)}</p>
                  <p className="text-xs text-gray-400 capitalize">{p.paymentMethod}</p>
                </div>
              </div>
              {expandedId === p.id && (
                <div className="border-t border-gray-100 px-6 py-4 bg-gray-50/50">
                  {p.notes && <p className="text-sm text-gray-500 mb-3 italic">{p.notes}</p>}
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-500">
                        <th className="text-left pb-2">Producto</th>
                        <th className="text-right pb-2">Cant.</th>
                        <th className="text-right pb-2">Costo Unit.</th>
                        <th className="text-right pb-2">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {p.items.map((item) => (
                        <tr key={item.id} className="border-t border-gray-100">
                          <td className="py-2 font-medium text-gray-800">{item.product.name}</td>
                          <td className="py-2 text-right text-gray-600">{item.quantity}</td>
                          <td className="py-2 text-right text-gray-600">${item.unitCost.toFixed(2)}</td>
                          <td className="py-2 text-right font-semibold text-gray-800">${item.subtotal.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4 animate-fade-in max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Nueva Compra</h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor *</label>
                <input
                  required
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="Nombre del proveedor"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Metodo de Pago</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="tarjeta">Tarjeta</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                <input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="Notas adicionales..."
                />
              </div>

              {/* Add product to cart */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <p className="text-sm font-semibold text-gray-700">Agregar Producto</p>
                <div className="grid grid-cols-12 gap-2">
                  <select
                    value={addProductId}
                    onChange={(e) => setAddProductId(e.target.value)}
                    className="col-span-5 border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="">Producto...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={addQty}
                    onChange={(e) => setAddQty(e.target.value)}
                    placeholder="Cant"
                    className="col-span-2 border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={addCost}
                    onChange={(e) => setAddCost(e.target.value)}
                    placeholder="Costo"
                    className="col-span-3 border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <button
                    type="button"
                    onClick={addToCart}
                    className="col-span-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors flex items-center justify-center"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* Cart items */}
                {cart.length > 0 && (
                  <div className="space-y-2 mt-3">
                    {cart.map((item, i) => (
                      <div key={i} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-gray-100">
                        <div>
                          <span className="text-sm font-medium text-gray-800">{item.productName}</span>
                          <span className="text-xs text-gray-500 ml-2">{item.quantity} x ${item.unitCost.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold">${(item.quantity * item.unitCost).toFixed(2)}</span>
                          <button type="button" onClick={() => removeFromCart(i)} className="text-red-400 hover:text-red-600">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-between pt-2 border-t border-gray-200">
                      <span className="font-bold text-gray-800">Total:</span>
                      <span className="font-bold text-blue-600 text-lg">${cartTotal.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium">
                  Registrar Compra
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
