import React, { useState, useEffect } from "react";
import { useAuth } from "../../Components/AuthContext";
import NavBar from "../../Components/Nav";
import api from "../../../Axios/api";
import { FaEye, FaTrash, FaSearch, FaFilter } from "react-icons/fa";
import { toast } from "react-toastify";

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const { token, isAdmin } = useAuth();

  const statusOptions = [
    {
      value: "pending",
      label: "Pending",
      color: "bg-yellow-100 text-yellow-800",
    },
    {
      value: "confirmed",
      label: "Confirmed",
      color: "bg-blue-100 text-blue-800",
    },
    {
      value: "processing",
      label: "Processing",
      color: "bg-purple-100 text-purple-800",
    },
    {
      value: "shipped",
      label: "Shipped",
      color: "bg-indigo-100 text-indigo-800",
    },
    {
      value: "delivered",
      label: "Delivered",
      color: "bg-green-100 text-green-800",
    },
    {
      value: "cancelled",
      label: "Cancelled",
      color: "bg-red-100 text-red-800",
    },
  ];

  useEffect(() => {
    if (isAdmin()) {
      fetchOrders();
    }
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get("/orders/admin/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOrders(response.data);
      toast.success(`Loaded ${response.data.length} orders`);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error(error.response?.data?.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdatingStatus(true);
      await api.put(
        `/orders/admin/${orderId}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setOrders(
        orders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
      if (selectedOrder?._id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
      toast.success("Order status updated");
    } catch (err) {
      console.error(err);
      toast.error("Update failed");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const deleteOrder = async (orderId) => {
    if (!window.confirm("Delete this order?")) return;
    try {
      await api.delete(`/orders/admin/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(orders.filter((order) => order._id !== orderId));
      setShowOrderModal(false);
      toast.success("Order deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete");
    }
  };

  const getStatusColor = (status) => {
    const option = statusOptions.find((s) => s.value === status);
    return option ? option.color : "bg-gray-100 text-gray-800";
  };

  const filteredOrders = orders.filter((order) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      order._id.toLowerCase().includes(search) ||
      order.userId?.name?.toLowerCase().includes(search) ||
      order.userId?.email?.toLowerCase().includes(search);

    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (date) =>
    new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (!isAdmin()) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="p-10 text-center text-red-600 font-semibold text-lg">
          ❌ Access denied. Admin only.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between mb-4">
            <h2 className="text-2xl font-bold">📦 Order Management</h2>
            <button
              onClick={fetchOrders}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              🔄 Refresh
            </button>
          </div>

          {/* Search + Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative w-full md:w-2/3">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search by ID, name, or email"
                className="pl-10 w-full border rounded py-2 px-4"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="border rounded py-2 px-4"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Order Table */}
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2">Order</th>
                    <th className="p-2">Customer</th>
                    <th className="p-2">Total</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Date</th>
                    <th className="p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order._id} className="border-t hover:bg-gray-50">
                      <td className="p-2">#{order._id.slice(-8)}</td>
                      <td className="p-2">
                        {order.userInfo?.name || order.userId?.name}
                      </td>
                      <td className="p-2">AED {order.total.toFixed(2)}</td>
                      <td className="p-2">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            updateOrderStatus(order._id, e.target.value)
                          }
                          disabled={updatingStatus}
                          className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2">{formatDate(order.createdAt)}</td>
                      <td className="p-2 flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowOrderModal(true);
                          }}
                        >
                          <FaEye className="text-blue-600" />
                        </button>
                        <button onClick={() => deleteOrder(order._id)}>
                          <FaTrash className="text-red-600" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">
                  Order Details - #{selectedOrder._id.slice(-8)}
                </h2>
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Customer Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    Customer Information
                  </h3>
                  <div className="space-y-2">
                    <p>
                      <strong>Name:</strong>{" "}
                      {selectedOrder.userInfo?.name ||
                        selectedOrder.userId?.name ||
                        "N/A"}
                    </p>
                    <p>
                      <strong>Email:</strong>{" "}
                      {selectedOrder.userId?.email || "N/A"}
                    </p>
                    <p>
                      <strong>Phone:</strong>{" "}
                      {selectedOrder.userInfo?.phone || "N/A"}
                    </p>
                    <p>
                      <strong>Address:</strong>{" "}
                      {selectedOrder.userInfo?.address || "N/A"}
                    </p>
                  </div>
                </div>

                {/* Order Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    Order Information
                  </h3>
                  <div className="space-y-2">
                    <p>
                      <strong>Order ID:</strong> #{selectedOrder._id.slice(-8)}
                    </p>
                    <p>
                      <strong>Date:</strong>{" "}
                      {formatDate(selectedOrder.createdAt)}
                    </p>
                    <p>
                      <strong>Payment Method:</strong>{" "}
                      {selectedOrder.paymentMethod || "COD"}
                    </p>
                    <p>
                      <strong>Total:</strong> AED{" "}
                      {selectedOrder.total?.toFixed(2)}
                    </p>
                    <div className="flex items-center gap-2">
                      <strong>Status:</strong>
                      <select
                        value={selectedOrder.status}
                        onChange={(e) =>
                          updateOrderStatus(selectedOrder._id, e.target.value)
                        }
                        disabled={updatingStatus}
                        className={`px-2 py-1 rounded text-sm border ${getStatusColor(
                          selectedOrder.status
                        )}`}
                      >
                        {statusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {updatingStatus && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Order Items</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                          Product
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                          Quantity
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                          Price
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedOrder.items?.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {item.name}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            AED {item.price?.toFixed(2)}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            AED {(item.quantity * item.price)?.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td
                          colSpan="3"
                          className="px-4 py-2 text-sm font-medium text-gray-900 text-right"
                        >
                          Total:
                        </td>
                        <td className="px-4 py-2 text-sm font-bold text-gray-900">
                          AED {selectedOrder.total?.toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => deleteOrder(selectedOrder._id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
