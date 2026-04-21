"use client";

import { useEffect, useState } from "react";
import { ShoppingCart, Plus, X, Package, Edit2, Trash2 } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  category: string;
}

interface Client {
  id: string;
  firstName: string;
  lastName: string;
}

interface Sale {
  id: string;
  quantity: number;
  totalAmount: number;
  createdAt: string;
  product: { name: string; price: number };
  client: { firstName: string; lastName: string } | null;
}

export default function SalesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"sales" | "products">("sales");
  const [showSaleForm, setShowSaleForm] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [saleForm, setSaleForm] = useState({ productId: "", clientId: "", quantity: "1" });
  const [productForm, setProductForm] = useState({ name: "", description: "", price: "", stock: "0", category: "general" });

  const fetchAll = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/products").then((r) => r.json()),
      fetch("/api/clients").then((r) => r.json()),
      fetch("/api/sales").then((r) => r.json()),
    ])
      .then(([p, c, s]) => {
        setProducts(p);
        setClients(c);
        setSales(s);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleSale = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(saleForm),
    });
    if (!res.ok) {
      const err = await res.json();
      alert(err.error || "Error al registrar venta");
      return;
    }
    setShowSaleForm(false);
    setSaleForm({ productId: "", clientId: "", quantity: "1" });
    fetchAll();
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingProductId ? `/api/products/${editingProductId}` : "/api/products";
    const method = editingProductId ? "PUT" : "POST";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productForm),
    });
    setShowProductForm(false);
    setEditingProductId(null);
    setProductForm({ name: "", description: "", price: "", stock: "0", category: "general" });
    fetchAll();
  };

  const handleEditProduct = (p: Product) => {
    setProductForm({
      name: p.name,
      description: p.description || "",
      price: p.price.toString(),
      stock: p.stock.toString(),
      category: p.category,
    });
    setEditingProductId(p.id);
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Desactivar este producto?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    fetchAll();
  };

  const selectedProduct = products.find((p) => p.id === saleForm.productId);
  const saleTotal = selectedProduct ? selectedProduct.price * (parseInt(saleForm.quantity) || 1) : 0;

  const todayTotal = sales
    .filter((s) => new Date(s.createdAt).toDateString() === new Date().toDateString())
    .reduce((sum, s) => sum + s.totalAmount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-8 lg:pt-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <ShoppingCart className="text-orange-500" /> Punto de Venta
          </h1>
          <p className="text-gray-500 mt-1">Ventas de productos y suplementos</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setShowProductForm(true); setEditingProductId(null); setProductForm({ name: "", description: "", price: "", stock: "0", category: "general" }); }}
            className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-sm"
          >
            <Package size={18} /> Nuevo Producto
          </button>
          <button
            onClick={() => setShowSaleForm(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-sm"
          >
            <Plus size={20} /> Nueva Venta
          </button>
        </div>
      </div>

      {/* Today stats */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <p className="text-sm text-gray-500">Ventas de Productos Hoy</p>
        <p className="text-3xl font-bold text-green-600 mt-1">${todayTotal.toFixed(2)}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab("sales")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "sales" ? "bg-orange-500 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          Historial de Ventas
        </button>
        <button
          onClick={() => setTab("products")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "products" ? "bg-orange-500 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          Catalogo de Productos
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
        </div>
      ) : tab === "sales" ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {sales.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <ShoppingCart size={48} className="mx-auto mb-3 opacity-50" />
              <p>No hay ventas registradas</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Producto</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Cliente</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Cantidad</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Total</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((s) => (
                    <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-gray-900">{s.product.name}</td>
                      <td className="px-6 py-4 text-gray-600">
                        {s.client ? `${s.client.firstName} ${s.client.lastName}` : "Venta directa"}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{s.quantity}</td>
                      <td className="px-6 py-4 font-bold text-gray-900">${s.totalAmount.toFixed(2)}</td>
                      <td className="px-6 py-4 text-gray-500 text-sm">
                        {new Date(s.createdAt).toLocaleDateString("es-MX")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <div key={p.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-gray-900">{p.name}</h3>
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full capitalize">{p.category}</span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEditProduct(p)} className="p-1.5 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDeleteProduct(p.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-3">{p.description || "Sin descripcion"}</p>
              <div className="flex justify-between items-end">
                <p className="text-2xl font-bold text-orange-500">${p.price.toFixed(2)}</p>
                <p className={`text-sm font-medium ${p.stock > 5 ? "text-green-600" : p.stock > 0 ? "text-yellow-600" : "text-red-600"}`}>
                  Stock: {p.stock}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sale Form Modal */}
      {showSaleForm && (
        <div className="modal-overlay" onClick={() => setShowSaleForm(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Registrar Venta</h2>
              <button onClick={() => setShowSaleForm(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>
            <form onSubmit={handleSale} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Producto *</label>
                <select
                  required
                  value={saleForm.productId}
                  onChange={(e) => setSaleForm({ ...saleForm, productId: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                >
                  <option value="">Seleccionar producto...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} - ${p.price.toFixed(2)} (Stock: {p.stock})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cliente (opcional)</label>
                <select
                  value={saleForm.clientId}
                  onChange={(e) => setSaleForm({ ...saleForm, clientId: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                >
                  <option value="">Venta directa (sin cliente)</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
                <input
                  type="number"
                  min="1"
                  value={saleForm.quantity}
                  onChange={(e) => setSaleForm({ ...saleForm, quantity: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
              {selectedProduct && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Precio unitario:</span>
                    <span className="font-medium">${selectedProduct.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-gray-600">Cantidad:</span>
                    <span className="font-medium">{saleForm.quantity}</span>
                  </div>
                  <div className="flex justify-between mt-2 pt-2 border-t border-green-200">
                    <span className="font-bold text-gray-800">Total:</span>
                    <span className="font-bold text-green-700 text-lg">${saleTotal.toFixed(2)}</span>
                  </div>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowSaleForm(false)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium">
                  Cobrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Form Modal */}
      {showProductForm && (
        <div className="modal-overlay" onClick={() => setShowProductForm(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">{editingProductId ? "Editar" : "Nuevo"} Producto</h2>
              <button onClick={() => setShowProductForm(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>
            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  placeholder="Ej: Agua 600ml"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripcion</label>
                <input
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio *</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                <select
                  value={productForm.category}
                  onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                >
                  <option value="general">General</option>
                  <option value="bebidas">Bebidas</option>
                  <option value="suplementos">Suplementos</option>
                  <option value="accesorios">Accesorios</option>
                  <option value="ropa">Ropa</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowProductForm(false)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium">
                  {editingProductId ? "Guardar" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
